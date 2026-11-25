import {
  FORMATS,
  Format,
  MemoryAdapter,
} from "@nand2tetris/simulator/cpu/memory.js";
import { loadAsm, loadBlob, loadHack } from "@nand2tetris/simulator/loader.js";
import { asm } from "@nand2tetris/simulator/util/asm.js";
import { bin, dec, hex } from "@nand2tetris/simulator/util/twos.js";
import {
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Btn } from "../button.js";
import { Choice } from "../choice.js";
import { useClockReset } from "../clockface.js";
import { Field } from "../field.js";
import InlineEdit from "../inline_edit.js";
import { LOADING } from "../messages.js";
import { Panel } from "../panel.js";
import { useStateInitializer } from "../react.js";
import { BaseContext } from "../stores/base.context.js";
import { Tip, type TipPlacement } from "../tooltip.js";
import VirtualScroll, { VirtualScrollSettings } from "../virtual_scroll.js";
import "../public/memory.css";

const ITEM_HEIGHT = 34;

export const MemoryBlock = ({
  memory,
  jmp = { value: 0 },
  highlight = -1,
  editable = false,
  justifyLeft = false, // TODO: handle this in css in the future
  count,
  maxSize,
  offset = 0,
  cellLabels,
  format = dec,
  onChange = () => undefined,
  onFocus = () => undefined,
  "aria-label": label,
}: {
  "aria-label"?: string;
  jmp?: { value: number };
  memory: MemoryAdapter;
  highlight?: number;
  editable?: boolean;
  justifyLeft?: boolean;
  count?: number;
  offset?: number;
  maxSize?: number;
  cellLabels?: string[];
  format?: (v: number) => string;
  onChange?: (i: number, value: string, previous: number) => void;
  onFocus?: (i: number) => void;
}) => {
  const settings = useMemo<Partial<VirtualScrollSettings>>(
    () => ({
      count: Math.min(memory.size, count ?? 25),
      maxIndex: maxSize ?? memory.size,
      itemHeight: ITEM_HEIGHT,
      startIndex: jmp.value,
    }),
    [memory.size, jmp],
  );
  const get = useCallback(
    (pos: number, count: number): [number, number][] =>
      memory
        .range(pos + offset, pos + offset + count)
        .map((v, i) => [i + pos + offset, v]),
    [memory],
  );

  const row = useCallback(
    ([i, v]: [number, number]) => (
      <MemoryCell
        index={i}
        value={format(v)}
        label={(cellLabels?.[i] ?? "").padStart(
          cellLabels ? Math.max(...cellLabels.map((label) => label.length)) : 0,
        )}
        showLabel={cellLabels != undefined}
        size={memory.size}
        editable={editable}
        justifyLeft={justifyLeft}
        highlight={i === highlight}
        onChange={onChange}
        onFocus={onFocus}
      />
    ),
    [format, editable, highlight, onChange],
  );

  return (
    <VirtualScroll<[number, number], ReactNode>
      aria-label={label}
      settings={settings}
      get={get}
      row={row}
      rowKey={([i]) => i}
    />
  );
};

export const MemoryCell = ({
  index,
  value,
  label,
  showLabel = false,
  size,
  highlight = false,
  editable = false,
  justifyLeft = false,
  onChange = () => undefined,
  onFocus = () => undefined,
}: {
  index: number;
  value: string;
  label?: string;
  showLabel?: boolean;
  size?: number;
  highlight?: boolean;
  editable?: boolean;
  justifyLeft?: boolean;
  onChange?: (i: number, value: string, previous: number) => void;
  onFocus?: (i: number) => void;
}) => (
  <div
    className="memory-cell"
    data-current={highlight || undefined}
    style={{ display: "flex", height: "100%" }}
  >
    {showLabel && <code>{label ?? ""}</code>}
    <code>
      {size
        ? dec(index).padStart(Math.ceil(Math.log10(size)), " ")
        : dec(index)}
    </code>
    <code
      className="memory-cell-value"
      style={{ flex: "1", textAlign: justifyLeft ? "left" : "right" }}
    >
      {editable ? (
        <InlineEdit
          value={value}
          highlight={highlight}
          onChange={(newValue: string) =>
            onChange(index, newValue, Number(value))
          }
          onFocus={() => onFocus(index)}
        />
      ) : (
        <span>{value}</span>
      )}
    </code>
  </div>
);

export const Memory = forwardRef(
  (
    {
      name = "Memory",
      className,
      displayEnabled = true,
      highlight = -1,
      editable = true,
      memory,
      format = "dec",
      onSetFormat,
      excludedFormats = [],
      count,
      maxSize,
      offset,
      initialAddr,
      cellLabels,
      fileSelect,
      showClear = true,
      onChange = undefined,
      onClear = undefined,
      loadTooltip = undefined,
    }: {
      name?: string;
      className?: string;
      displayEnabled?: boolean;
      editable?: boolean;
      highlight?: number;
      memory: MemoryAdapter;
      count?: number;
      maxSize?: number;
      offset?: number;
      initialAddr?: number;
      format: Format;
      onSetFormat?: (format: Format) => void;
      excludedFormats?: Format[];
      cellLabels?: string[];
      fileSelect?: () => Promise<{ name: string; content: string }>;
      showClear?: boolean;
      onChange?: () => void;
      onClear?: () => void;
      loadTooltip?: { value: string; placement: TipPlacement };
    },
    ref,
  ) => {
    const [fmt, setFormat] = useStateInitializer(format);
    const [jmp, setJmp] = useState("");
    const [goto, setGoto] = useState({ value: initialAddr ?? 0 });
    const [highlighted, setHighlighted] = useStateInitializer(highlight);
    const [renderKey, setRenderKey] = useState(0);

    const jumpTo = () => {
      const value =
        !isNaN(parseInt(jmp)) && isFinite(parseInt(jmp)) ? Number(jmp) : 0;
      setHighlighted(value);
      setGoto({
        value: value,
      });
      rerenderMemoryBlock();
    };

    const doLoad = async () => {
      onChange?.();
      if (fileSelect) {
        const { name, content } = await fileSelect();
        setStatus(LOADING);
        requestAnimationFrame(async () => {
          const loader = name.endsWith("hack")
            ? loadHack
            : name.endsWith("asm")
              ? loadAsm
              : loadBlob;
          requestAnimationFrame(async () => {
            try {
              const bytes = await loader(content);
              memory.loadBytes(bytes);
              setStatus("");
              setFormat(
                name.endsWith("hack")
                  ? "bin"
                  : name.endsWith("asm")
                    ? "asm"
                    : fmt,
              );
              jumpTo();
            } catch (e) {
              setStatus({
                message: `Error loading memory: ${(e as Error).message}`,
                severity: "ERROR",
              });
              return;
            }
          });
        });
      }
    };

    const { setStatus } = useContext(BaseContext);

    const rerenderMemoryBlock = () => {
      setRenderKey(renderKey + 1);
    };

    useImperativeHandle(ref, () => ({
      rerender: rerenderMemoryBlock,
    }));

    const clear = () => {
      memory.reset();
      onChange?.();
      onClear?.();
      rerenderMemoryBlock();
    };

    const doUpdate = (i: number, v: string) => {
      memory.update(i, v, fmt ?? "dec");
      onChange?.();
      rerenderMemoryBlock();
    };

    useClockReset(() => {
      setJmp("");
      setGoto({ value: 0 });
    });

    const doSetFormat = (format: Format) => {
      setFormat(format);
      onSetFormat?.(format);
    };

    return (
      <Panel
        className={`memory ${className ?? name}`}
        title={name}
        overflow="clip"
        header={
          <fieldset role="group">
            {fileSelect && (
              <Tip
                label={loadTooltip?.value ?? "Load file"}
                placement={loadTooltip?.placement ?? "bottom"}
              >
                <Btn
                  onClick={doLoad}
                  aria-label={loadTooltip?.value ?? "Load file"}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    folder_open
                  </span>
                </Btn>
              </Tip>
            )}
            {showClear && (
              <Tip label="Clear">
                <Btn onClick={clear} aria-label="Clear">
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    delete_sweep
                  </span>
                </Btn>
              </Tip>
            )}
            <Field
              style={{ width: "4em" }}
              placeholder="Addr"
              aria-label="Address"
              value={jmp}
              onKeyDown={({ key }) => key === "Enter" && jumpTo()}
              onChange={({ target: { value } }) => setJmp(value)}
            />
            <Tip label="Scroll to address">
              <Btn onClick={jumpTo} aria-label="Scroll to address">
                <span className="material-symbols-outlined" aria-hidden="true">
                  move_down
                </span>
              </Btn>
            </Tip>
            <Choice
              value={fmt}
              aria-label="Number format"
              onChange={(value) => doSetFormat(value as Format)}
              options={FORMATS.filter(
                (option) => !excludedFormats.includes(option),
              )}
            />
          </fieldset>
        }
      >
        {displayEnabled ? (
          <MemoryBlock
            key={renderKey}
            aria-label={name}
            jmp={goto}
            memory={memory}
            highlight={highlighted}
            editable={editable}
            justifyLeft={fmt == "asm"}
            count={count}
            format={(v: number) => doFormat(fmt, v)}
            cellLabels={cellLabels}
            maxSize={maxSize}
            offset={offset}
            onChange={doUpdate}
            onFocus={(i) => setHighlighted(i)}
          />
        ) : (
          "Memory display is disabled"
        )}
      </Panel>
    );
  },
);
Memory.displayName = "Memory";

export default Memory;

function doFormat(format: Format, v: number): string {
  switch (format) {
    case "bin":
      return bin(v);
    case "hex":
      return hex(v);
    case "asm":
      return asm(v);
    case "dec":
    default:
      return dec(v);
  }
}

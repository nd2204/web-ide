import { Trans, useLingui } from "@lingui/react/macro";
import { LOADING } from "@nand2tetris/components/messages.js";
import { Runbar } from "@nand2tetris/components/runbar";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { SymbolTable } from "@nand2tetris/components/symbol_table";
import { ROM } from "@nand2tetris/simulator/cpu/memory";
import { ASM } from "@nand2tetris/simulator/languages/asm.js";
import { loadHack } from "@nand2tetris/simulator/loader.js";
import { Timer } from "@nand2tetris/simulator/timer";
import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../App.context";
import { PageContext } from "../Page.context";
import { Editor } from "../shell/editor";
import { isPath } from "../shell/file_select";
import { Icon } from "../shell/icon";
import { Panel } from "../shell/panel";
import URLs from "../urls";
import "./asm.scss";
import { Tip } from "../shell/tip";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

export const Asm = () => {
  const { t } = useLingui();
  const { filePicker } = useContext(AppContext);
  const { stores, setTool } = useContext(PageContext);
  const { state, actions, dispatch } = stores.asm;
  const { fs, localFsRoot } = useContext(BaseContext);

  const sourceCursorPos = useRef(0);
  const resultCursorPos = useRef(0);

  const runner = useRef<Timer | undefined>(undefined);
  const [runnerAssigned, setRunnerAssigned] = useState(false);

  const [showSymbolTable, setShowSymbolTable] = useState(true);

  useEffect(() => {
    setTool("asm");
  }, [setTool]);

  useEffect(() => {
    runner.current = new (class AsmRunner extends Timer {
      override async tick(): Promise<boolean> {
        sourceCursorPos.current = 0;
        resultCursorPos.current = 0;
        return await actions.step();
      }
      override reset(): void {
        actions.reset();
      }
      override toggle(): void {
        return;
      }
    })();
    setRunnerAssigned(true);

    return () => {
      runner.current?.stop();
    };
  }, [actions, dispatch]);

  const fileDownloadRef = useRef<HTMLAnchorElement>(null);
  const redirectRef = useRef<HTMLAnchorElement>(null);

  const loadAsm = async () => {
    const fileRef = await filePicker.selectAllowLocal({ suffix: ".asm" });
    setStatus(LOADING);
    requestAnimationFrame(async () => {
      let title: string;
      if (isPath(fileRef)) {
        await actions.loadAsm(fileRef.path);
        title = fileRef.path.split("/").pop() ?? "";
      } else {
        const file = Array.isArray(fileRef) ? fileRef[0] : fileRef;
        await actions.loadAsm(undefined, file.content);
        title = file.name;
      }
      setStatus("");
      dispatch.current({ action: "setTitle", payload: title });
    });
  };

  const loadCompare = async () => {
    const filesRef = await filePicker.selectAllowLocal({ suffix: "hack" });
    if (isPath(filesRef)) {
      const cmp = await fs.readFile(filesRef.path);
      dispatch.current({
        action: "setCmp",
        payload: { cmp, name: filesRef.path.split("/").pop() },
      });
    } else {
      const file = Array.isArray(filesRef) ? filesRef[0] : filesRef;
      dispatch.current({
        action: "setCmp",
        payload: { cmp: file.content, name: file.name },
      });
    }
  };

  const { setStatus } = useContext(BaseContext);

  const downloadAsm = () =>
    download(state.asm, state.path?.split("/").pop() ?? "source.asm");
  const downloadHack = () =>
    download(
      state.result,
      state.path?.split("/").pop()?.replace(".asm", ".hack") ?? "result.hack",
    );

  const download = (content: string, name: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    if (!fileDownloadRef.current) {
      return;
    }
    fileDownloadRef.current.href = url;
    fileDownloadRef.current.download = name;
    fileDownloadRef.current.click();

    URL.revokeObjectURL(url);
  };

  const compare = () => {
    actions.compare();
  };

  const onSpeedChange = (speed: number) => {
    dispatch.current({ action: "updateConfig", payload: { speed } });
    actions.setAnimate(speed <= 2);
  };

  const loadToCpu = async () => {
    const bytes = await loadHack(state.result);
    const rom = new ROM();
    await rom.loadBytes(bytes);
    stores.cpu.actions.replaceROM(rom);
    if (state.path) {
      stores.cpu.dispatch.current({
        action: "setTitle",
        payload: state.path.split("/").pop() ?? "",
      });
      stores.cpu.actions.setPath(state.path);
      stores.cpu.actions.reset();
    }
    redirectRef.current?.click();
  };

  return (
    <div className={`AsmPage grid ${showSymbolTable ? "" : "hide-sym"}`}>
      <Panel
        className="source"
        overflow="clip"
        title={<Trans>Source</Trans>}
        header={
          <>
            <div className="flex-1">
              {runnerAssigned && runner.current && (
                <Runbar
                  runner={runner.current}
                  disabled={state.error != undefined}
                  prefix={
                    <Tip label={t`Load file`} placement="bottom">
                      <Button onClick={loadAsm} aria-label={t`Load file`}>
                        <Icon name="folder_open" />
                      </Button>
                    </Tip>
                  }
                  overrideTooltips={{ step: "Translate", run: "Translate all" }}
                  speed={state.config.speed}
                  onSpeedChange={onSpeedChange}
                />
              )}
            </div>
            {!localFsRoot && (
              <fieldset role="group" className="key-group">
                <Tip label={t`Download`} placement="left">
                  <Button aria-label={t`Download`} onClick={downloadAsm}>
                    <Icon name="download" />
                  </Button>
                </Tip>
              </fieldset>
            )}
          </>
        }
      >
        <Editor
          value={state.asm}
          path={state.path ?? "tmp.asm"}
          error={state.error}
          alwaysRecenter={false}
          onChange={(source: string) => {
            actions.setAsm(source);
          }}
          onCursorPositionChange={(index) => {
            if (index == sourceCursorPos.current) {
              return;
            }
            sourceCursorPos.current = index;

            // wait some time to allow the user to release the mouse before updating the highligh
            // (otherwise we auto-scroll while the mouse is pressed and cause unwanted text selection)
            setTimeout(() => {
              actions.updateHighlight(index, true);
            }, 100);
          }}
          grammar={ASM.parser}
          language={"asm"}
          highlight={state.translating ? state.sourceHighlight : undefined}
          lineNumberTransform={(n) => {
            if (!state.translating) {
              return "";
            }
            const num = state.lineNumbers[n] as number | undefined;
            return (num === undefined ? "" : num).toString();
          }}
        />
      </Panel>
      <Panel
        className="result"
        overflow="clip"
        title={<Trans>Binary Code</Trans>}
        header={
          <>
            <div>
              <a ref={fileDownloadRef} style={{ display: "none" }} />
              <Link
                ref={redirectRef}
                style={{ display: "none" }}
                to={URLs["cpu"].href}
              />
              <fieldset role="group" className="key-group">
                <Tip label={t`Load in CPU Emulator`} placement="left">
                  <Button
                    aria-label={t`Load in CPU Emulator`}
                    onClick={loadToCpu}
                  >
                    <Icon name="developer_board" />
                  </Button>
                </Tip>
                {!localFsRoot && (
                  <Tip label={t`Download`} placement="left">
                    <Button aria-label={t`Download`} onClick={downloadHack}>
                      <Icon name="download" />
                    </Button>
                  </Tip>
                )}
              </fieldset>
            </div>
          </>
        }
      >
        <Editor
          value={state.result}
          path={(state.path ?? "tmp.asm").replace(/\.asm$/, ".hack")}
          highlight={state.resultHighlight}
          disabled={true}
          onChange={function (_source: string): void {
            return;
          }}
          onCursorPositionChange={(index) => {
            if (index == resultCursorPos.current) {
              return;
            }
            resultCursorPos.current = index;
            actions.updateHighlight(index, false);
          }}
          grammar={undefined}
          language={""}
          alwaysRecenter={false}
          lineNumberTransform={(n) => (n - 1).toString()}
        />
      </Panel>
      <Panel
        className="sym"
        title={
          <span id="asm-symbol-table-title">
            <Trans>Symbol Table</Trans>
          </span>
        }
        header={
          <>
            <Switch
              className="self-center"
              aria-labelledby="asm-symbol-table-title"
              checked={showSymbolTable}
              onCheckedChange={setShowSymbolTable}
            />
          </>
        }
      >
        {state.translating && showSymbolTable && (
          <SymbolTable
            values={state.symbols}
            headings={{ symbol: t`Symbol`, address: t`Address` }}
            aria-labelledby="asm-symbol-table-title"
          />
        )}
      </Panel>
      <Panel
        className="compare"
        title={
          <>
            <Trans>Compare Code</Trans>
            {state.compareName && `: ${state.compareName}`}
          </>
        }
        header={
          <>
            <fieldset role="group" className="key-group">
              <Button aria-label={t`Load file`} onClick={loadCompare}>
                <Icon name="folder_open" />
              </Button>
            </fieldset>
            <div className="flex-1" />
            <fieldset role="group" className="key-group">
              <Button onClick={compare}>
                <Trans>Compare</Trans>
              </Button>
            </fieldset>
          </>
        }
      >
        <Editor
          value={state.compare}
          path={(state.path ?? "tmp.asm").replace(/\.asm$/, ".cmp")}
          highlight={state.translating ? state.resultHighlight : undefined}
          highlightType={state.compareError ? "error" : "highlight"}
          alwaysRecenter={false}
          onChange={function (_source: string): void {
            return;
          }}
          disabled={true}
          onCursorPositionChange={(index) => {
            if (index == resultCursorPos.current) {
              return;
            }
            resultCursorPos.current = index;
            actions.updateHighlight(index, false);
          }}
          language={""}
          lineNumberTransform={(n) => (n - 1).toString()}
        />
      </Panel>
    </div>
  );
};

export default Asm;

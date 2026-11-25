import { isErr, unwrap } from "@davidsouther/jiffies/result.ts";
import { Plural, Trans, useLingui } from "@lingui/react/macro";
import {
  DecorationType,
  DiffDisplay,
  generateDiffs,
} from "@nand2tetris/components/compare.js";
import { useDialog } from "@nand2tetris/components/dialog";
import { loadTestFiles } from "@nand2tetris/components/file_utils";
import { useStateInitializer } from "@nand2tetris/components/react";
import { Runbar, RunSpeed } from "@nand2tetris/components/runbar.js";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { Span } from "@nand2tetris/simulator/languages/base";
import { CMP } from "@nand2tetris/simulator/languages/cmp.js";
import { TST } from "@nand2tetris/simulator/languages/tst.js";
import { Timer } from "@nand2tetris/simulator/timer.js";
import {
  Dispatch,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppContext } from "../App.context";
import { Icon } from "../pico/icon";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogDescription,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Editor } from "./editor";
import { isPath } from "./file_select";
import { Panel } from "./panel";
import { SwitchRow } from "./switch_row";
import { Tip } from "./tip";

const WARNING_KEY = "skipTestEditWarning";

type TestTab = "tst" | "cmp" | "out" | "diff";

export const TestPanel = ({
  runner: baseRunner,
  tst: [tst, setTst, tstHighlight],
  cmp: [cmp, setCmp],
  out: [out],
  tstName,
  setPath,
  disabled = false,
  defaultTst,
  defaultCmp,
  showName = false,
  showLoad = true,
  showClear = false,
  overrideTooltips,
  speed,
  onSpeedChange,
  prefix,
}: {
  runner: RefObject<Timer | undefined>;
  tst: [string, Dispatch<string>, Span | undefined];
  cmp: [string, Dispatch<string>];
  out: [string, Dispatch<string>];
  tstName?: string;
  setPath?: Dispatch<string>;
  defaultTst?: string;
  defaultCmp?: string;
  showName?: boolean;
  showLoad?: boolean;
  showClear?: boolean;
  overrideTooltips?: { step?: string; run?: string };
  disabled?: boolean;
  speed?: RunSpeed;
  onSpeedChange?: (speed: number) => void;
  prefix?: ReactNode;
}) => {
  const { fs, setStatus } = useContext(BaseContext);
  const { filePicker, tracking } = useContext(AppContext);
  const { t } = useLingui();

  const [showHighlight, setShowHighlight] = useState(true);
  const runner = useRef<Timer | undefined>(undefined);
  useEffect(() => {
    runner.current = new (class ChipTimer extends Timer {
      async reset(): Promise<void> {
        await baseRunner.current?.reset();
        setShowHighlight(true);
      }

      override finishFrame(): void {
        super.finishFrame();
        baseRunner.current?.finishFrame();
      }

      async tick(): Promise<boolean> {
        setShowHighlight(true);
        return (await baseRunner.current?.tick()) ?? false;
      }

      toggle(): void {
        baseRunner.current?.toggle();
      }
    })();

    return () => {
      runner.current?.stop();
    };
  }, [baseRunner]);

  const setSelectedTestTab = useCallback(
    (tab: TestTab) => {
      tracking.trackEvent("tab", "change", tab);
    },
    [tracking],
  );

  const [skipWarning, setSkipWarning] = useState(false);
  const editDialog = useDialog();

  const onChange = (test: string) => {
    setTst(test);
    setShowHighlight(false);
  };

  const clear = () => {
    setTst(defaultTst ?? "");
    setCmp(defaultCmp ?? "");
  };

  const [name, setName] = useStateInitializer(tstName ?? "");

  const loadTest = useCallback(async () => {
    const file = await filePicker.selectAllowLocal({
      suffix: [".tst", ".cmp"],
    });
    if (isPath(file)) {
      const files = await loadTestFiles(fs, file.path);
      if (isErr(files)) {
        setStatus(`Failed to load test`);
        return;
      }
      setPath?.(file.path);
      setName(file.path.split("/").pop() ?? "");
      const { tst, cmp } = unwrap(files);
      setTst?.(tst);
      setCmp?.(cmp ?? "");
    } else {
      // File uploaded
      const selectedFiles = Array.isArray(file) ? file : [file];
      const tstFile = selectedFiles.find((f) => f.name.endsWith(".tst"));
      const cmpFile = selectedFiles.find((f) => f.name.endsWith(".cmp"));

      if (tstFile) {
        setTst?.(tstFile.content);
        setName(tstFile.name);
        setPath?.(tstFile.name);
      }
      if (cmpFile) {
        setCmp?.(cmpFile.content);
      }
    }
  }, [filePicker, setStatus, fs, setPath, setName, setTst, setCmp]);

  const outputLineCount = (out.match(/\n/g) ?? []).length;

  const [diffDisplay, setDiffDisplay] = useState<DiffDisplay>();

  useEffect(() => {
    setDiffDisplay(generateDiffs(cmp, out));
  }, [out, cmp]);

  const editWarning = (
    <Dialog
      open={editDialog.isOpen}
      onOpenChange={(open) => {
        if (!open) editDialog.close();
      }}
    >
      <DialogContent heading={<Trans>Warning</Trans>} closeLabel={t`Close`}>
        <DialogDescription>
          <Trans>
            The test script can be edited during this IDE session. In the next
            session, the original script will be restored.
          </Trans>
        </DialogDescription>
        <SwitchRow checked={skipWarning} onCheckedChange={setSkipWarning}>
          <Trans>Do not show this again</Trans>
        </SwitchRow>
        <DialogActions>
          <Button
            onClick={() => {
              if (skipWarning) {
                localStorage.setItem(WARNING_KEY, "true");
              }
              editDialog.close();
            }}
          >
            <Trans>Ok</Trans>
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );

  return (
    <Panel
      className="_test_panel"
      title={
        <>
          <Trans>Test</Trans>
          {showName && (name == "" ? ": Default" : `: ${name}`)}
        </>
      }
      header={
        <>
          {editWarning}
          <div className="flex-1">
            {runner.current && (
              <Runbar
                prefix={
                  <>
                    {prefix}
                    {showClear && (
                      <Button onClick={clear}>
                        <Trans>Clear</Trans>
                      </Button>
                    )}
                    {showLoad && (
                      <Tip label={t`Load a test script`} placement="bottom">
                        <Button
                          onClick={loadTest}
                          aria-label={t`Load a test script`}
                        >
                          <Icon name="folder_open" />
                        </Button>
                      </Tip>
                    )}
                  </>
                }
                runner={runner.current}
                outputLineCount={outputLineCount}
                disabled={disabled}
                overrideTooltips={overrideTooltips}
                speed={speed}
                onSpeedChange={onSpeedChange}
              />
            )}
          </div>
        </>
      }
    >
      <Tabs
        defaultValue="tst"
        onValueChange={(tab) => setSelectedTestTab(tab as TestTab)}
      >
        <TabsList>
          <TabsTrigger value="tst">
            <Trans>Test Script</Trans>
          </TabsTrigger>
          <TabsTrigger value="cmp">
            <Trans>Compare File</Trans>
          </TabsTrigger>
          <TabsTrigger value="out">
            <Trans>Output File</Trans>
          </TabsTrigger>
          <TabsTrigger value="diff">
            <Trans>Diff Table</Trans>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tst">
          <Editor
            value={tst}
            path={`${tstName ?? "test"}.tst`}
            onChange={onChange}
            grammar={TST.parser}
            language={"tst"}
            disabled={true}
            highlight={showHighlight ? tstHighlight : undefined}
          />
        </TabsContent>
        <TabsContent value="cmp">
          <Editor
            value={cmp}
            path={`${tstName ?? "test"}.cmp`}
            onChange={setCmp}
            grammar={CMP.parser}
            language={"cmp"}
            lineNumberTransform={(_) => ""}
            disabled={true}
          />
        </TabsContent>
        <TabsContent value="out">
          {out == "" && (
            <p>
              <Trans>Execute test script to generate output.</Trans>
            </p>
          )}
          <Editor
            value={out}
            onChange={() => {
              return;
            }}
            language={"cmp"}
            path={`${tstName ?? "test"}.out`}
            disabled={true}
            lineNumberTransform={(_) => ""}
          />
        </TabsContent>
        <TabsContent value="diff">
          {out == "" && (
            <p>
              <Trans>Execute test script to compare output.</Trans>
            </p>
          )}
          {(diffDisplay?.failureNum ?? 0) > 0 && (
            <p>
              <Plural
                value={diffDisplay?.failureNum ?? 0}
                one="# comparison failure. Scroll down for details"
                other="# comparison failures. Scroll down for details"
              />
            </p>
          )}
          <Editor
            value={diffDisplay?.text ?? ""}
            onChange={() => {
              return;
            }}
            language={""}
            path="test.txt"
            disabled={true}
            lineNumberTransform={(i) => diffDisplay?.lineNumbers[i - 1] ?? ""}
            customDecorations={diffDisplay?.decorations.map((decoration) => {
              return {
                span: decoration.span,
                cssClass: decorationTypeToCss(decoration.type),
              };
            })}
          />
        </TabsContent>
      </Tabs>
    </Panel>
  );
};

function decorationTypeToCss(type: DecorationType) {
  switch (type) {
    case "error-line":
      return "diff-highlight-error-line";
    case "error-cell":
      return "diff-highlight-error-cell";
    case "correct-line":
      return "diff-highlight-correct-line";
    case "correct-cell":
      return "diff-highlight-correct-cell";
    default:
      return "";
  }
}

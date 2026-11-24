import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Icon } from "../pico/icon";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

import "./chip.scss";

import { isErr, Ok } from "@davidsouther/jiffies/result.ts";
import { makeVisualizationsWithId } from "@nand2tetris/components/chips/visualizations.js";
import { Clockface } from "@nand2tetris/components/clockface.js";
import {
  FullPinout,
  PinContext,
  PinResetDispatcher,
} from "@nand2tetris/components/pinout.js";
import { useStateInitializer } from "@nand2tetris/components/react.js";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { hasBuiltinChip } from "@nand2tetris/simulator/chip/builtins/index.js";
import { HDL } from "@nand2tetris/simulator/languages/hdl.js";
import { Timer } from "@nand2tetris/simulator/timer.js";
import { AppContext } from "../App.context";
import { registerCustomChip, resetCustomChips } from "../languages/hdl";
import { reloadHdlLanguage } from "../languages/loader";
import { PageContext } from "../Page.context";
import { Editor } from "../shell/editor";
import { Accordian, Panel } from "../shell/panel";
import { TestPanel } from "../shell/test_panel";
import { Tip } from "../shell/tip";
import { zip } from "../shell/zip";

interface CompileInput {
  hdl: string;
  tst: string;
  cmp: string;
  tstDir: string;
}

export const Chip = () => {
  const { setStatus, localFsRoot } = useContext(BaseContext);
  const { stores, setTool } = useContext(PageContext);
  const { tracking, filePicker } = useContext(AppContext);
  const { state, actions, dispatch } = stores.chip;

  const [hdl, setHdl] = useStateInitializer(state.files.hdl);
  const latestState = useRef(state);
  latestState.current = state;
  const [tst, setTst] = useStateInitializer(state.files.tst);
  const [cmp, setCmp] = useStateInitializer(state.files.cmp);
  const [out, setOut] = useStateInitializer(state.files.out);
  const [tstDir, setTstDir] = useStateInitializer(state.dir);
  const [tstPath, setTstPath] = useState<string>();

  useEffect(() => {
    if (tstPath) {
      setTstDir(tstPath?.split("/").slice(0, -1).join("/"));
    }
  }, [tstPath]);

  useEffect(() => {
    if (!tstDir) return;
    // Guard against race conditions when changing project
    let active = true;

    const scanAndRegister = async () => {
      const files = await actions.getProjectFiles();
      let changed = resetCustomChips();

      for (const file of files) {
        const chipNameFromPath = file.name
          .split("/")
          .pop()
          ?.replace(".hdl", "");

        if (chipNameFromPath && hasBuiltinChip(chipNameFromPath)) {
          continue;
        }

        const content = await file.content;
        const parsed = HDL.parse(content);
        if (isErr(parsed)) {
          continue;
        }

        const hdl = Ok(parsed);
        const chipName = hdl.name.value;

        if (hasBuiltinChip(chipName)) {
          continue;
        }

        const ins = hdl.ins.map(({ pin }: { pin: string }) => pin.toString());
        const outs = hdl.outs.map(({ pin }: { pin: string }) => pin.toString());

        const pins = [...ins, ...outs];
        const signature = `${chipName}(${pins.map((p) => `${p}= `).join(", ")});`;

        if (registerCustomChip(chipName, signature)) {
          changed = true;
        }
      }

      if (changed && active) {
        reloadHdlLanguage();
      }
    };

    scanAndRegister();

    // Cleanup function
    return () => {
      active = false;
    };
  }, [tstDir, actions]);

  useEffect(() => {
    setTool("chip");
  }, [setTool]);

  useEffect(() => {
    tracking.trackPage("/chip");
  }, [tracking]);

  useEffect(() => {
    tracking.trackEvent("action", "setProject", state.controls.project);
    tracking.trackEvent("action", "setChip", state.controls.chipName);
  }, []);

  const doEval = useCallback(() => {
    actions.eval();
    tracking.trackEvent("action", "eval");
  }, [actions, tracking]);

  const compile = useRef<(files?: Partial<CompileInput>) => void>(
    () => undefined,
  );
  compile.current = async (files: Partial<CompileInput> = {}) => {
    const hdlToCompile = state.controls.usingBuiltin
      ? files.hdl
      : (files.hdl ?? hdl);
    await actions.updateFiles({
      hdl: hdlToCompile,
      tst: files.tst ?? tst,
      cmp: files.cmp ?? cmp,
      tstPath: files.tstDir ?? tstDir,
    });
  };

  useEffect(() => {
    compile.current({ tst, cmp, tstDir });
    actions.reset();
  }, [tst, cmp, tstDir]);

  const runner = useRef<Timer | undefined>(undefined);
  useEffect(() => {
    runner.current = new (class ChipTimer extends Timer {
      async reset(): Promise<void> {
        await compile.current();
        await actions.reset();
      }

      override finishFrame(): void {
        super.finishFrame();
        dispatch.current({ action: "updateTestStep" });
      }

      async tick(): Promise<boolean> {
        return await actions.stepTest();
      }

      toggle(): void {
        dispatch.current({ action: "updateTestStep" });
      }
    })();

    return () => {
      runner.current?.stop();
    };
  }, [compile, actions, dispatch]);

  const clockActions = useMemo(
    () => ({
      toggle() {
        actions.clock();
        tracking.trackEvent("action", "toggleClock");
      },
      reset() {
        tracking.trackEvent("action", "resetClock");
        actions.reset();
      },
    }),
    [actions],
  );

  const toggleUseBuiltin = () => {
    actions.toggleBuiltin();
    pinResetDispatcher.reset();
  };

  const loadFile = async () => {
    const path = await filePicker.select({ suffix: "hdl" });
    actions.loadChip(path.path);
  };

  const downloadRef = useRef<HTMLAnchorElement>(null);

  const downloadProject = async () => {
    if (!downloadRef.current) {
      return;
    }

    const files = await actions.getProjectFiles();
    const url = await zip(files);
    downloadRef.current.href = url;
    downloadRef.current.download = `${state.controls.project}`;
    downloadRef.current.click();

    URL.revokeObjectURL(url);
  };

  // The picker tooltip stays closed while either Select is open, so Escape
  // reaches the list rather than the tooltip.
  const [menuOpen, setMenuOpen] = useState(false);

  const selectors = (
    <>
      <Tip
        label={t`Open an HDL file using this menu`}
        placement="bottom"
        disabled={menuOpen}
      >
        <fieldset role="group">
          <Select
            onOpenChange={setMenuOpen}
            value={state.controls.project}
            onValueChange={(value) => {
              actions.setProject(value);
            }}
          >
            <SelectTrigger aria-label={t`Project`} data-testid="project-picker">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {state.controls.projects.map((project) => (
                <SelectItem key={project} value={project}>
                  {`Project ${project.replace(/^0/, "")}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onOpenChange={setMenuOpen}
            value={state.controls.chipName}
            onValueChange={(value) => {
              if (value != "") {
                let path = `/${state.controls.project}/${value}.hdl`;
                if (!localFsRoot) {
                  path = `/projects${path}`;
                }
                actions.loadChip(path);
              }
            }}
          >
            <SelectTrigger aria-label={t`Chip`} data-testid="chip-picker">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {state.controls.chips.map((chip) => (
                <SelectItem key={chip} value={chip}>
                  {chip}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </fieldset>
      </Tip>
    </>
  );
  const hdlPanel = (
    <Panel
      className="_hdl_panel"
      isEditorPanel={true}
      header={
        <>
          <div tabIndex={0}>HDL</div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              visibility: hasBuiltinChip(state.controls.chipName)
                ? "visible"
                : "hidden",
            }}
          >
            <Switch
              checked={state.controls.usingBuiltin}
              onCheckedChange={toggleUseBuiltin}
            />
            <Trans>Builtin</Trans>
          </label>
          <div style={{ width: "30px" }}></div>
          <div className="stack-item-4">{selectors}</div>
          <fieldset role="group">
            <Tip label={t`Open an HDL file directly`} placement="bottom">
              <Button
                size="icon"
                aria-label={t`Open an HDL file directly`}
                onClick={loadFile}
              >
                <Icon name="folder_open" />
              </Button>
            </Tip>
            <a ref={downloadRef} style={{ display: "none" }} />
            <Tip label={t`Download .hdl files`} placement="left">
              <Button
                size="icon"
                onClick={downloadProject}
                aria-label={t`Download .hdl files`}
              >
                <Icon name="download" />
              </Button>
            </Tip>
          </fieldset>
        </>
      }
    >
      <Editor
        className="stack-item-1"
        value={hdl}
        error={state.controls.error}
        onChange={async (source) => {
          setHdl(source);
          // The editor also reports programmatic changes (switching Builtin on
          // or off). This callback can be stale then, so read the latest state:
          // only a real edit, which differs from the stored text, is saved.
          const latest = latestState.current;
          const edited = source !== latest.files.hdl;
          if (!latest.controls.usingBuiltin && edited) {
            actions.saveChip(source);
          }
          compile.current(latest.controls.usingBuiltin ? {} : { hdl: source });
        }}
        grammar={HDL.parser}
        language={"hdl"}
        path={`${state.controls.project}/${state.controls.chipName}.hdl`}
        disabled={state.controls.usingBuiltin || state.controls.chipName == ""}
      />
    </Panel>
  );

  const [inputValid, setInputValid] = useState(true);

  const showCannotTestError = () => {
    setStatus(t`Cannot test a chip that has syntax errors`);
  };

  const evalIfCan = () => {
    if (state.sim.invalid) {
      showCannotTestError();
      return;
    }
    doEval();
  };

  const chipButtons = (
    <fieldset role="group">
      <Button
        variant="primary"
        onClick={evalIfCan}
        onKeyDown={evalIfCan}
        disabled={!state.sim.pending || !inputValid}
      >
        <Trans>Eval</Trans>
      </Button>
      <Button
        onClick={() => {
          if (state.sim.invalid) {
            showCannotTestError();
            return;
          }
          clockActions.reset();
        }}
        disabled={!state.sim.clocked}
      >
        <Trans>Reset</Trans>
      </Button>
      <Button
        onClick={() => {
          if (state.sim.invalid) {
            showCannotTestError();
            return;
          }
          clockActions.toggle();
        }}
        disabled={!state.sim.clocked}
      >
        <Trans>Clock</Trans>:{"\u00a0"}
        <Clockface />
      </Button>
    </fieldset>
  );

  const visualizations: [string, ReactNode][] = makeVisualizationsWithId(
    {
      parts: state.sim.chip,
    },
    () => {
      dispatch.current({ action: "updateChip" });
    },
    state.controls.visualizationParameters,
  );

  const pinResetDispatcher = new PinResetDispatcher();

  const pinsPanel = (
    <Panel
      className="_parts_panel"
      header={
        <>
          <div>
            <Trans>Chip</Trans> {state.controls.chipName}
          </div>
          {chipButtons}
        </>
      }
    >
      {state.sim.invalid ? (
        <Trans>Syntax errors in the HDL code or test</Trans>
      ) : (
        state.controls.chipName != "" && (
          <>
            <PinContext.Provider value={pinResetDispatcher}>
              <FullPinout
                trace
                sim={state.sim}
                toggle={actions.toggle}
                setInputValid={setInputValid}
                hideInternal={state.controls.usingBuiltin}
              />
            </PinContext.Provider>
            {visualizations.length > 0 && (
              <Accordian summary={<Trans>Visualization</Trans>} open={true}>
                <main>{visualizations.map(([_, v]) => v)}</main>
              </Accordian>
            )}
          </>
        )
      )}
    </Panel>
  );

  const testPanel = (
    <TestPanel
      runner={runner}
      disabled={state.sim.invalid}
      prefix={
        state.controls.tests.length > 1 ? (
          <Select
            value={state.controls.testName}
            onValueChange={(value) => {
              actions.loadTest(value);
            }}
          >
            <SelectTrigger aria-label={t`Test`} data-testid="test-picker">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {state.controls.tests.map((test) => (
                <SelectItem key={test} value={test}>
                  {test}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <></>
        )
      }
      tst={[tst, setTst, state.controls.span]}
      cmp={[cmp, setCmp]}
      out={[out, setOut]}
      setPath={setTstPath}
      speed={state.config.speed}
      onSpeedChange={(speed) => {
        dispatch.current({ action: "updateConfig", payload: { speed } });
      }}
    />
  );

  return (
    <>
      <div className="Page ChipPage grid">
        {hdlPanel}
        {pinsPanel}
        {testPanel}
      </div>
    </>
  );
};

export default Chip;

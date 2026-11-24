import { Timer } from "@nand2tetris/simulator/timer.js";
import { ChangeEvent, ReactNode, useEffect, useRef } from "react";
import { useStateInitializer } from "./react.js";
import { useTimer } from "./timer.js";
import { Tip } from "./tooltip.js";

interface RunbarTooltipOverrides {
  step: string;
  run: string;
  pause: string;
  reset: string;
}

export type RunSpeed = 0 | 1 | 2 | 3 | 4;

export const Runbar = (props: {
  runner: Timer;
  speed?: RunSpeed;
  disabled?: boolean;
  prefix?: ReactNode;
  children?: ReactNode;
  overrideTooltips?: Partial<RunbarTooltipOverrides>;
  onSpeedChange?: (speed: RunSpeed) => void;
  outputLineCount?: number;
}) => {
  const runner = useTimer(props.runner);
  const [speedValue, setSpeed] = useStateInitializer(props.speed ?? 2);

  const speedValues: Record<RunSpeed, [number, number]> = {
    0: [1000, 1],
    1: [500, 1],
    2: [16, 1],
    3: [16, 16666],
    4: [16, 16666 * 30],
  };

  useEffect(() => {
    updateSpeed();
  }, [speedValue]);

  const updateSpeed = () => {
    const [speed, steps] = speedValues[speedValue];
    runner.dispatch({ action: "setSpeed", payload: speed });
    runner.dispatch({ action: "setSteps", payload: steps });
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const speed = Number(e.target.value) as RunSpeed;
    setSpeed(speed);
    props.onSpeedChange?.(speed);
  };

  const toggleRef = useRef<HTMLButtonElement>(null);

  const onKeyPress = (event: KeyboardEvent) => {
    toggleRef.current?.blur();
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);
    window.addEventListener("keyup", onKeyPress);

    return () => {
      window.removeEventListener("keydown", onKeyPress);
      window.removeEventListener("keyup", onKeyPress);
    };
  });

  return (
    <div className="stack stack-row stack-wrap">
      <fieldset role="group">
        {props.prefix}
        <Tip label={props.overrideTooltips?.step ?? `Step`}>
          <button
            className="stack-item-0"
            disabled={props.disabled}
            onClick={() => runner.actions.frame()}
            aria-label={props.overrideTooltips?.step ?? `Step`}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              skip_next
            </span>
          </button>
        </Tip>
        <Tip
          label={
            runner.state.running
              ? (props.overrideTooltips?.pause ?? `Pause`)
              : (props.overrideTooltips?.run ?? `Run`)
          }
        >
          <button
            className="stack-item-0"
            ref={toggleRef}
            disabled={props.disabled}
            onClick={() =>
              runner.state.running
                ? runner.actions.stop()
                : runner.actions.start()
            }
            aria-label={
              runner.state.running
                ? (props.overrideTooltips?.pause ?? `Pause`)
                : (props.overrideTooltips?.run ?? `Run`)
            }
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {runner.state.running ? "pause" : "fast_forward"}
            </span>
          </button>
        </Tip>
        <Tip label={props.overrideTooltips?.reset ?? `Reset`}>
          <button
            className="stack-item-0"
            onClick={() => {
              if (runner.state.running) {
                runner.actions.stop();
              }
              runner.actions.reset();
            }}
            aria-label={props.overrideTooltips?.reset ?? `Reset`}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              skip_previous
            </span>
          </button>
        </Tip>
      </fieldset>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <span data-testid="test-step-count">
          Steps: {runner.state.stepsTaken}
        </span>
        <span data-testid="test-output-count">
          Outputs: {props.outputLineCount ?? 0}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: "normal",
        }}
      >
        <span style={{ padding: "0.2rem" }}>Slow</span>
        <Tip label="Execution speed">
          <input
            type="range"
            min={0}
            max={4}
            step={1}
            value={speedValue}
            disabled={runner.state.running}
            onChange={onChange}
            style={{ width: "150px", padding: "0.2rem" }}
            aria-label="Execution speed"
          />
        </Tip>
        <span style={{ padding: "0.2rem" }}>Fast</span>
      </div>
      {props.children}
    </div>
  );
};

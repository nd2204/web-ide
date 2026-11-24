import { Trans, useLingui } from "@lingui/react/macro";
import { useStateInitializer } from "@nand2tetris/components/react";
import {
  CompilationError,
  Span,
} from "@nand2tetris/simulator/languages/base.js";
import { type Grammar } from "ohm-js";
import { CSSProperties, lazy, Suspense, useContext } from "react";
import { AppContext } from "../App.context";

import "./editor.scss";
import { Action } from "@nand2tetris/simulator/types";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const Monaco = lazy(() => import("./Monaco"));

export const ErrorPanel = ({ error }: { error?: CompilationError }) => {
  return error ? (
    <details className="ErrorPanel" open>
      <Button asChild>
        <summary role="button" className="secondary">
          <Trans>Parse Error</Trans>
        </summary>
      </Button>
      <pre>
        <code>{error?.message}</code>
      </pre>
    </details>
  ) : (
    <></>
  );
};

const PlainEditor = ({
  value,
  onChange,
  language,
  disabled = false,
}: {
  value: string;
  onChange: Action<string>;
  language: string;
  disabled?: boolean;
}) => {
  const [text, setText] = useStateInitializer(value);
  const { t } = useLingui();
  const name = language.toUpperCase();
  return (
    <Textarea
      data-testid={`editor-${language}`}
      aria-label={t`${name} source`}
      disabled={disabled}
      value={text}
      onChange={(e) => {
        const value = e.target?.value;
        setText(value);
        onChange(value);
      }}
    />
  );
};

export interface Decoration {
  span: Span;
  cssClass: string;
}

export type HighlightType = "highlight" | "error";

export const Editor = ({
  className = "",
  style = {},
  disabled = false,
  value,
  error,
  onChange,
  onCursorPositionChange,
  grammar,
  language,
  path,
  highlight,
  highlightType = "highlight",
  customDecorations = [],
  dynamicHeight = false,
  alwaysRecenter = true,
  lineNumberTransform,
}: {
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  value: string;
  path: string;
  error?: CompilationError;
  onChange: Action<string>;
  onCursorPositionChange?: (index: number) => void;
  grammar?: Grammar;
  language: string;
  highlight?: Span | number;
  highlightType?: HighlightType;
  customDecorations?: Decoration[];
  dynamicHeight?: boolean;
  alwaysRecenter?: boolean;
  lineNumberTransform?: (n: number) => string;
}) => {
  const { monaco } = useContext(AppContext);

  return (
    <div
      className={`Editor ${dynamicHeight ? "dynamic-height" : ""} ${className}`}
      style={style}
    >
      {monaco.canUse && monaco.wants ? (
        <Suspense fallback="Loading...">
          <Monaco
            value={value}
            onChange={onChange}
            onCursorPositionChange={onCursorPositionChange}
            path={path}
            language={language}
            error={error}
            disabled={disabled}
            highlight={highlight}
            highlightType={highlightType}
            customDecorations={customDecorations}
            dynamicHeight={dynamicHeight}
            alwaysRecenter={alwaysRecenter}
            lineNumberTransform={lineNumberTransform}
          />
        </Suspense>
      ) : (
        <>
          <PlainEditor
            value={value}
            onChange={onChange}
            language={language}
            disabled={disabled}
          />
          <ErrorPanel error={error} />
        </>
      )}
    </div>
  );
};

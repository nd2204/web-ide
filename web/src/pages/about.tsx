import { Trans, useLingui } from "@lingui/react/macro";
import Markdown from "../shell/markdown";
import aboutContent from "./ABOUT.md?raw";

const VERSION =
  document.querySelector("meta[name=version]")?.getAttribute("content") ??
  "unknown";

const useVersion = () => {
  return VERSION;
};

export const About = () => {
  const version = useVersion();
  const { t } = useLingui();
  return (
    // The page scrolls here; focusable so the keyboard can scroll it.
    <div
      role="group"
      aria-label={t`About`}
      tabIndex={0}
      className="overflow-y-scroll"
    >
      {/* The markdown's <hr> keeps the browser's 0.5em spacing that preflight resets. */}
      <div className="container [&_hr]:my-[0.5em]">
        <Markdown>{aboutContent}</Markdown>
        <p>
          <b>
            <Trans>Version</Trans>
          </b>{" "}
          <code>{version}</code>
        </p>
      </div>
    </div>
  );
};

export default About;

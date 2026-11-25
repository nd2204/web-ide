import { t } from "@lingui/core/macro";
import {
  BaseContext,
  useBaseContext,
} from "@nand2tetris/components/stores/base.context";
import { type JSX, RefObject, useContext, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppContext, useAppContext } from "../App.context";
import type { IconName } from "../icons";
import { PageContext } from "../Page.context";
import { Icon } from "../pico/icon";
import URLs, { LAST_ROUTE_KEY, TOOLS, URL } from "../urls";
import { Tip } from "./tip";
import "./header.scss";

interface HeaderButton {
  tooltip: string;
  icon: IconName;
  href?: string;
  tool?: string;
  target?: JSX.Element;
  onClick?: (context: HeaderButtonContext) => void;
}

interface HeaderButtonContext {
  appContext: ReturnType<typeof useAppContext>;
  baseContext: ReturnType<typeof useBaseContext>;
  pathname: string;
}

function headerButtonFromURL(url: URL, icon: IconName, tooltip?: string) {
  return {
    href: url.href,
    tool: url.tool,
    tooltip:
      tooltip ??
      (url.tool && Object.keys(TOOLS).includes(url.tool)
        ? TOOLS[url.tool]
        : ""),
    icon,
    target: url.target,
  };
}

const guideLinks: Record<string, string> = {
  chip: "user_guide/chip.pdf",
  cpu: "user_guide/cpu.pdf",
  asm: "user_guide/asm.pdf",
  vm: "user_guide/vm.pdf",
  compiler: "user_guide/compiler.pdf",
  bitmap: "user_guide/bitmap_editor.pdf",
};

const GUIDE_NOT_AVAILABLE_MESSAGE = "Guide not available for this tool";

function openGuide(context: HeaderButtonContext) {
  const pdfLink = guideLinks[context.pathname];
  if (!pdfLink) {
    context.baseContext.setStatus(GUIDE_NOT_AVAILABLE_MESSAGE);
    return;
  }
  // Must call window.open synchronously inside the click handler — any
  // intervening await drops the user-gesture flag and the popup blocker
  // silently denies the open.
  window.open(
    import.meta.env.BASE_URL + pdfLink,
    "_blank",
    "width=1000,height=800",
  );
}

const headerButtons: HeaderButton[] = [
  headerButtonFromURL(URLs["chip"], "memory"),
  headerButtonFromURL(URLs["cpu"], "developer_board"),
  headerButtonFromURL(URLs["asm"], "list_alt"),
  headerButtonFromURL(URLs["vm"], "computer"),
  // TODO(https://github.com/nand2tetris/web-ide/issues/349)
  // reenable when this is resolved for Firefox and safari
  // https://caniuse.com/?search=showDirectoryPicker
  headerButtonFromURL(URLs["compiler"], "code"),
  headerButtonFromURL(URLs["bitmap"], "grid_on"),
  headerButtonFromURL(URLs["util"], "function", "Converter Tool"),
  {
    onClick: openGuide,
    tooltip: `Guide`,
    icon: "menu_book",
  },
  {
    href: "https://github.com/nand2tetris/web-ide/issues/new/choose",
    icon: "bug_report",
    tooltip: "Bug Report",
  },
  {
    onClick: (context) => {
      context.appContext.settings.open();
    },
    icon: "settings",
    tooltip: "Settings",
  },
  headerButtonFromURL(URLs["about"], "info", "About"),
];

const Header = () => {
  const appContext = useContext(AppContext);
  const baseContext = useContext(BaseContext);
  const { title, setTool } = useContext(PageContext);
  const { setStatus } = useContext(BaseContext);

  const redirectRefs: Record<string, RefObject<HTMLAnchorElement | null>> = {};
  for (const button of headerButtons) {
    if (button.href) {
      redirectRefs[button.href] = useRef<HTMLAnchorElement>(null);
    }
  }

  const pathname = useLocation().pathname.replaceAll("/", "");

  const activate = ({
    href,
    onClick,
    target,
    tool,
  }: Pick<HeaderButton, "href" | "onClick" | "target" | "tool">) => {
    setTool(tool);
    setStatus("");
    if (onClick) {
      onClick({ appContext, baseContext, pathname });
    } else if (href) {
      if (target) {
        localStorage.setItem(LAST_ROUTE_KEY, href);
      }
      redirectRefs[href].current?.click();
    }
  };

  return (
    <header>
      <nav style={{ width: "100%" }}>
        <ul>
          <li>
            <strong>
              <a
                href="https://nand2tetris.org"
                target="_blank"
                rel="noreferrer"
              >
                NAND2Tetris
              </a>
            </strong>
            {TOOLS[pathname] && ` / ${TOOLS[pathname]}`}
            {title && ` / ${title}`}
          </li>
        </ul>
        <ul
          className="icon-list tool-capsule"
          role="toolbar"
          aria-label={t`Tools`}
        >
          {headerButtons.map(
            ({ href, icon, onClick, tooltip, target, tool }) => {
              const item = (
                <li
                  key={tooltip ? undefined : icon}
                  aria-current={
                    target && href?.replaceAll("/", "") === pathname
                      ? "page"
                      : undefined
                  }
                  role={target ? "link" : "button"}
                  tabIndex={0}
                  aria-label={tooltip}
                  // Chrome leaves a half-clipped tool half clipped on focus; bring
                  // it fully into the scrolling toolbar.
                  onFocus={(e) =>
                    e.currentTarget.scrollIntoView({
                      block: "nearest",
                      inline: "nearest",
                    })
                  }
                  onClick={() => activate({ href, onClick, target, tool })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      activate({ href, onClick, target, tool });
                    }
                  }}
                >
                  <Icon name={icon}></Icon>
                  {href &&
                    (target ? (
                      <Link
                        to={href}
                        ref={redirectRefs[href]}
                        style={{ display: "none" }}
                      />
                    ) : (
                      <a
                        href={href}
                        target="new"
                        ref={redirectRefs[href]}
                        style={{ display: "none" }}
                      />
                    ))}
                </li>
              );
              return tooltip ? (
                <Tip key={icon} label={tooltip} placement="bottom">
                  {item}
                </Tip>
              ) : (
                item
              );
            },
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;

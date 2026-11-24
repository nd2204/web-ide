import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
  BaseContext,
  useBaseContext,
} from "@nand2tetris/components/stores/base.context.js";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AppContext, useAppContext } from "./App.context";
import { ErrorBoundary, RenderError } from "./ErrorBoundary";
import { registerLanguages } from "./languages/loader";
import { messages } from "./locales";
import { PageContextProvider } from "./Page.context";
import { Redirect } from "./pages/redirect";
import { BtnRoot } from "./shell/btn";
import { FilePicker } from "./shell/file_select";
import Footer from "./shell/footer";
import Header from "./shell/header";
import { Settings } from "./shell/settings";
import { TipRoot } from "./shell/tip";
import { TooltipProvider } from "./ui/tooltip";
import urls from "./urls";
import "./pico/flex.scss";
import "./pico/pico.scss";
import { TrackingBanner } from "./tracking";
import { updateVersion } from "./versions";

// Select and Slider are only needed once a tool page renders, so the providers
// that hand them to `components` load with the pages, not with the entry chunk.
const FormRoot = lazy(() => import("./shell/form_controls"));

i18n.load(messages);
i18n.load("en-US", messages.en);
i18n.activate(navigator.language);

type STATE = "none" | "initializing" | "initialized";

function App() {
  const baseContext = useBaseContext();
  const appContext = useAppContext();
  const state = useRef<STATE>("none");
  const [initialized, setInitialized] = useState(false);

  const fs = baseContext.fs;

  useEffect(() => {
    registerLanguages();
  }, []);

  useEffect(() => {
    if (state.current != "none") return;
    state.current = "initializing";
    Promise.resolve().then(async () => {
      await updateVersion(fs);
      state.current = "initialized";
      setInitialized(true);
    });
  }, [fs, state]);

  useEffect(() => {
    (document.children[0] as HTMLHtmlElement).dataset.theme =
      appContext.theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : appContext.theme;
  }, [appContext.theme]);

  return (
    <I18nProvider i18n={i18n}>
      <BaseContext.Provider value={baseContext}>
        <AppContext.Provider value={appContext}>
          {initialized ? (
            <PageContextProvider>
              <TooltipProvider>
                <TipRoot>
                  <BtnRoot>
                    <Settings />
                    <FilePicker />
                    <Router basename={import.meta.env.BASE_URL}>
                      <Header />
                      <main className="stack stack-item-1">
                        <ErrorBoundary fallback={RenderError}>
                          <Suspense
                            fallback={
                              <div>
                                <Trans>Loading...</Trans>
                              </div>
                            }
                          >
                            <FormRoot>
                              <Routes>
                                <Route path="/" element={<Redirect />} />
                                {Object.values(urls).map(({ href, target }) => (
                                  <Route
                                    key={href}
                                    path={href}
                                    element={target}
                                  />
                                ))}
                              </Routes>
                            </FormRoot>
                          </Suspense>
                        </ErrorBoundary>
                      </main>
                      <Footer />
                      <TrackingBanner />
                    </Router>
                  </BtnRoot>
                </TipRoot>
              </TooltipProvider>
            </PageContextProvider>
          ) : (
            <div>
              <Trans>Initializing...</Trans>
            </div>
          )}
        </AppContext.Provider>
      </BaseContext.Provider>
    </I18nProvider>
  );
}

export default App;

import { i18n } from "@lingui/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { useDialog } from "@nand2tetris/components/dialog";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../App.context";
import { PageContext } from "../Page.context";
import "../pico/button-group.scss";
import "../pico/property.scss";
import "./settings.scss";
import { TrackingDisclosure } from "../tracking";
import { Dialog, DialogActions, DialogContent } from "../ui/dialog";
import { getVersion, setVersion } from "../versions";

const showUpgradeFs = true;

export const Settings = () => {
  const { stores } = useContext(PageContext);
  const {
    fs,
    setStatus,
    canUpgradeFs,
    upgradeFs,
    closeFs,
    localFsRoot,
    permissionPrompt,
    requestPermission,
    loadFs,
  } = useContext(BaseContext);
  const { settings, monaco, theme, setTheme } = useContext(AppContext);
  const { t } = useLingui();

  const [storageMode, setStorageMode] = useState<"browser" | "pc">(
    localFsRoot ? "pc" : "browser",
  );
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (localFsRoot) {
      setStorageMode("pc");
    } else {
      setStorageMode("browser");
    }
  }, [localFsRoot]);

  const upgradeFsAction = async (createFiles?: boolean) => {
    setUpgrading(true);
    try {
      await upgradeFs(localFsRoot != undefined, createFiles);
      // If after upgrade attempt we still don't have a root (canceled), revert to browser
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // User cancelled
        setStorageMode("browser");
      } else {
        console.error("Failed to upgrade FS", { err });
        setStatus(t`Failed to load local file system.`);
        setStorageMode("browser");
      }
    } finally {
      setUpgrading(false);
      // If we finished and still don't have a root (e.g. cancelled without error if that's possible, or just didn't select),
      // we might want to ensure we are consistent.
      // However, since upgradeFs is async, we can't easily know the *result* state here immediately if it relies on context propagation.
      // But usually if it fails/cancels, we want to be in browser mode.
    }
  };

  const writeLocale = useMemo(
    () => (locale: string) => {
      if (localFsRoot) return;
      i18n.activate(locale);
      fs.writeFile("/locale", locale);
    },
    [fs],
  );
  useEffect(() => {
    if (localFsRoot) return;
    fs.readFile("/locale")
      .then((locale) => i18n.activate(locale))
      .catch(() => writeLocale("en"));
  }, [fs, writeLocale]);

  // "warn" asks, then the same dialog swaps to "done" once the files are reset.
  const [resetStep, setResetStep] = useState<"warn" | "done" | null>(null);

  const resetFiles = async () => {
    const version = getVersion();
    localStorage.clear();
    setVersion(version);
    localStorage["/chip/project"] = "01";
    localStorage["/chip/chip"] = "Not";
    const loaders = await import("@nand2tetris/projects/loader.js");
    await loaders.resetFiles(fs);

    stores.cpu.actions.clear();
    stores.asm.actions.clear();
    stores.vm.actions.initialize();
    stores.compiler.actions.reset();
  };

  const permissionPromptDialog = (
    <Dialog
      open={permissionPrompt.isOpen}
      onOpenChange={(open) => {
        if (!open) permissionPrompt.close();
      }}
    >
      <DialogContent
        heading={<Trans>Permission needed</Trans>}
        closeLabel={t`Close`}
        aria-describedby={undefined}
      >
        <div>
          <Trans>
            Please grant permissions to use your local projects folder
          </Trans>
        </div>
        <DialogActions>
          <button
            onClick={async () => {
              await requestPermission();
              loadFs();
              permissionPrompt.close();
            }}
          >
            <Trans>Ok</Trans>
          </button>
          <button
            onClick={() => {
              permissionPrompt.close();
            }}
          >
            <Trans>Cancel</Trans>
          </button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );

  const resetDialog = (
    <Dialog
      open={resetStep !== null}
      onOpenChange={(open) => {
        if (!open) setResetStep(null);
      }}
    >
      <DialogContent
        heading={
          resetStep === "done" ? (
            <Trans>Your files were reset</Trans>
          ) : (
            <Trans>Reset browser storage files</Trans>
          )
        }
        closeLabel={t`Close`}
        aria-describedby={undefined}
      >
        {resetStep === "done" ? (
          <DialogActions>
            <button onClick={() => setResetStep(null)}>
              <Trans>Ok</Trans>
            </button>
          </DialogActions>
        ) : (
          <>
            <div>
              <Trans>
                The "reset browser storage files" results in erasing all the
                project files stored in the browser memory (but not on your PC),
                replacing them with a fresh set of skeletal files. You may want
                to back-up your edited project files before resetting.
              </Trans>
            </div>
            <DialogActions>
              <button
                onClick={async () => {
                  await resetFiles();
                  setResetStep("done");
                }}
              >
                <Trans>Reset</Trans>
              </button>
              <button onClick={() => setResetStep(null)}>
                <Trans>Cancel</Trans>
              </button>
            </DialogActions>
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  // The incomplete-setup warning is a second view of the Settings dialog, so
  // focus stays put and Escape always closes only the topmost view.
  const closeWarning = useDialog();

  const handleClose = () => {
    if (closeWarning.isOpen) {
      closeWarning.close();
    } else if (storageMode === "pc" && !localFsRoot) {
      closeWarning.open();
    } else {
      settings.close();
    }
  };

  return (
    <>
      <Dialog
        open={settings.isOpen}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <DialogContent
          className="settings-dialog w-[min(900px,calc(100vw-1rem))]"
          heading={
            closeWarning.isOpen ? (
              <Trans>Incomplete Setup</Trans>
            ) : (
              <Trans>Settings</Trans>
            )
          }
          closeLabel={t`Close`}
          aria-describedby={undefined}
        >
          {closeWarning.isOpen ? (
            <>
              <div>
                <Trans>
                  You chose use pc storage but didn't select a folder in your PC
                </Trans>
              </div>
              <DialogActions>
                <button onClick={closeWarning.close}>
                  <Trans>Select Folder</Trans>
                </button>
                <button
                  className="secondary"
                  onClick={() => {
                    setStorageMode("browser");
                    closeWarning.close();
                    settings.close();
                  }}
                >
                  <Trans>Use Browser Storage</Trans>
                </button>
              </DialogActions>
            </>
          ) : (
            <>
              <dl>
                {/* Storage Mode Selection */}
                <dt>
                  <Trans>Project files</Trans>
                  <div style={{ marginTop: "3rem" }}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(
                          import.meta.env.BASE_URL +
                            "user_guide/file_system.pdf",
                          "_blank",
                          "width=1000,height=800",
                        );
                      }}
                      style={{ fontSize: "0.9rem" }}
                    >
                      <Trans>File System User Guide</Trans>
                    </a>
                  </div>
                </dt>
                <dd>
                  <div className="storage-mode-selection">
                    <div className="storage-option">
                      <label>
                        <input
                          type="radio"
                          name="storage-mode"
                          checked={storageMode === "browser"}
                          onChange={async () => {
                            setStorageMode("browser");
                            if (localFsRoot) {
                              await closeFs();
                            }
                          }}
                        />
                        <Trans>Use browser storage</Trans>
                      </label>
                    </div>

                    <div className="storage-option">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <label style={{ width: "auto" }}>
                          <input
                            type="radio"
                            name="storage-mode"
                            checked={storageMode === "pc"}
                            onChange={() => {
                              setStorageMode("pc");
                              // Do NOT trigger upgradeFsAction here anymore
                            }}
                          />
                          <Trans>Use Desktop Storage</Trans>
                        </label>
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#888",
                          marginLeft: "1.8rem",
                          marginTop: "-0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <Trans>
                          Works on Chrome, Edge, Opera, and other Chromium-based
                          browsers
                        </Trans>
                      </div>
                      <div
                        className="folder-location-row"
                        style={{
                          opacity: storageMode === "pc" ? 1 : 0.5,
                          pointerEvents: storageMode === "pc" ? "auto" : "none",
                          marginLeft: "2rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <span>
                            <Trans>Projects folder location (on your PC)</Trans>
                            :
                          </span>
                          {localFsRoot ? (
                            <code style={{ flex: "1", minWidth: "200px" }}>
                              {localFsRoot}
                            </code>
                          ) : (
                            <span
                              style={{
                                flex: "1",
                                minWidth: "200px",
                                fontStyle: "italic",
                              }}
                            >
                              <Trans>Not selected</Trans>
                            </span>
                          )}
                          {showUpgradeFs && canUpgradeFs && (
                            <button
                              disabled={upgrading}
                              onClick={async () => {
                                // Check if we are already in PC mode but no folder selected, or changing folder
                                // If we are in browser mode (shouldn't happen due to pointerEvents), switch to PC first?
                                // No, pointerEvents handles it.
                                try {
                                  await upgradeFsAction();
                                  // After action, check if we have a root.
                                  // Note: localFsRoot might not be updated immediately in this closure.
                                  // We rely on the catch block in upgradeFsAction to handle cancellation.
                                } catch (_e) {
                                  // Should be caught inside upgradeFsAction
                                }
                              }}
                              data-tooltip={t`Select the folder where the projects are stored on your PC`}
                              data-placement="bottom"
                              style={{ marginLeft: "auto" }}
                            >
                              {localFsRoot ? (
                                <Trans>Change folder</Trans>
                              ) : (
                                <Trans>Select Projects Folder</Trans>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Download Projects Folder */}
                      <div
                        style={{
                          marginTop: "1rem",
                          marginLeft: "2rem",
                          opacity: storageMode === "pc" ? 1 : 0.5,
                          pointerEvents: storageMode === "pc" ? "auto" : "none",
                        }}
                      >
                        <button
                          onClick={() =>
                            window.open(
                              "https://drive.google.com/open?id=1oD0WMJRq1UPEFEXWphKXR6paFwWpBS4o",
                              "_blank",
                            )
                          }
                          data-tooltip={t`Download (one time) before using PC Storage`}
                          data-placement="bottom"
                          style={{ width: "100%" }}
                        >
                          <Trans>Download the projects folder</Trans>
                        </button>
                      </div>
                    </div>
                  </div>
                </dd>
                <dt>
                  <Trans>Editor</Trans>
                </dt>
                <dd>
                  <label>
                    <input
                      type="checkbox"
                      name="switch"
                      role="switch"
                      checked={monaco.wants}
                      disabled={!monaco.canUse}
                      onChange={(e) => monaco.toggle(e.target.checked)}
                    />
                    <Trans>Use Monaco Editor</Trans>
                  </label>
                </dd>

                {/* Theme Section */}
                <dt>
                  <Trans>Theme</Trans>
                </dt>
                <dd>
                  <fieldset role="group">
                    <label role="button" aria-current={theme === "light"}>
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={theme === "light"}
                        onChange={() => setTheme("light")}
                      />
                      <Trans>Light</Trans>
                    </label>
                    <label role="button" aria-current={theme === "dark"}>
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={theme === "dark"}
                        onChange={() => setTheme("dark")}
                      />
                      <Trans>Dark</Trans>
                    </label>
                    <label role="button" aria-current={theme === "system"}>
                      <input
                        type="radio"
                        name="theme"
                        value="system"
                        checked={theme === "system"}
                        onChange={() => setTheme("system")}
                      />
                      <Trans>System</Trans>
                    </label>
                  </fieldset>
                </dd>

                {/* Divider for bottom section */}
                <div
                  style={{
                    borderTop: "1px solid var(--contrast-lower)",
                    margin: "0.5rem 0 1rem 0",
                  }}
                />

                {/* Bottom Section - Utility Items */}
                {!localFsRoot && (
                  <>
                    <dt>
                      <Trans>Browser Storage Reset</Trans>
                    </dt>
                    <dd>
                      <button onClick={() => setResetStep("warn")}>
                        <Trans>Reset browser storage files</Trans>
                      </button>
                    </dd>
                  </>
                )}

                <dt>
                  <Trans>References</Trans>
                </dt>
                <dd>
                  <div>
                    <a
                      href="https://nand2tetris.org"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Trans>nand2tetris.org (course website)</Trans>
                    </a>
                  </div>
                  <div>
                    <a
                      href="https://github.com/davidsouther/nand2tetris"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Trans>nand2tetris/web-IDE on Github (open source)</Trans>
                    </a>
                  </div>
                </dd>
              </dl>
            </>
          )}
        </DialogContent>
      </Dialog>
      {permissionPromptDialog}
      {resetDialog}
    </>
  );
};

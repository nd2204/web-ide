import { i18n } from "@lingui/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { useDialog } from "@nand2tetris/components/dialog";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { useContext, useEffect, useId, useMemo, useState } from "react";
import { AppContext } from "../App.context";
import { PageContext } from "../Page.context";
import { TrackingDisclosure } from "../tracking";
import { Button } from "../ui/button";
import { Dialog, DialogActions, DialogContent } from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { getVersion, setVersion } from "../versions";
import { SwitchRow } from "./switch_row";
import { Tip } from "./tip";

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
  const id = useId();

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
          <Button
            onClick={async () => {
              await requestPermission();
              loadFs();
              permissionPrompt.close();
            }}
          >
            <Trans>Ok</Trans>
          </Button>
          <Button
            onClick={() => {
              permissionPrompt.close();
            }}
          >
            <Trans>Cancel</Trans>
          </Button>
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
            <Button onClick={() => setResetStep(null)}>
              <Trans>Ok</Trans>
            </Button>
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
              <Button
                onClick={async () => {
                  await resetFiles();
                  setResetStep("done");
                }}
              >
                <Trans>Reset</Trans>
              </Button>
              <Button onClick={() => setResetStep(null)}>
                <Trans>Cancel</Trans>
              </Button>
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
                <Button onClick={closeWarning.close}>
                  <Trans>Select Folder</Trans>
                </Button>
                <Button
                  className="secondary"
                  onClick={() => {
                    setStorageMode("browser");
                    closeWarning.close();
                    settings.close();
                  }}
                >
                  <Trans>Use Browser Storage</Trans>
                </Button>
              </DialogActions>
            </>
          ) : (
            <>
              <div className="grid grid-flow-row grid-cols-1 items-start gap-x-6 gap-y-3 phone:grid-cols-[minmax(8rem,max-content)_minmax(0,1fr)]">
                {/* Storage Mode Selection */}
                <div className="grid grid-flow-row grid-cols-1 gap-1 phone:pt-2">
                  <span id={`${id}-storage`} className="font-bold">
                    <Trans>Project files</Trans>
                  </span>
                  <a
                    href="#"
                    className="text-[0.9rem]"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        import.meta.env.BASE_URL + "user_guide/file_system.pdf",
                        "_blank",
                        "width=1000,height=800",
                      );
                    }}
                  >
                    <Trans>File System User Guide</Trans>
                  </a>
                </div>
                <div className="grid grid-flow-row grid-cols-1 gap-2">
                  <RadioGroup
                    aria-labelledby={`${id}-storage`}
                    value={storageMode}
                    onValueChange={async (value) => {
                      if (value === "pc") {
                        setStorageMode("pc");
                        return;
                      }
                      setStorageMode("browser");
                      if (localFsRoot) {
                        await closeFs();
                      }
                    }}
                  >
                    <RadioGroupItem
                      value="browser"
                      label={<Trans>Use browser storage</Trans>}
                    />
                    <RadioGroupItem
                      value="pc"
                      label={<Trans>Use Desktop Storage</Trans>}
                      hint={
                        <Trans>
                          Works on Chrome, Edge, Opera, and other Chromium-based
                          browsers
                        </Trans>
                      }
                    />
                  </RadioGroup>
                  {storageMode === "pc" && (
                    <div className="grid grid-flow-row grid-cols-1 gap-2 rounded-sm border border-border p-3">
                      <div className="grid grid-flow-row grid-cols-1 gap-0.5">
                        <span className="text-[0.85rem]">
                          <Trans>Projects folder location (on your PC)</Trans>
                        </span>
                        {localFsRoot ? (
                          <code className="break-all">{localFsRoot}</code>
                        ) : (
                          <span className="italic text-muted-foreground">
                            <Trans>Not selected</Trans>
                          </span>
                        )}
                      </div>
                      <div className="inline-flex w-full flex-wrap gap-2">
                        {showUpgradeFs && canUpgradeFs && (
                          <Tip
                            label={t`Select the folder where the projects are stored on your PC`}
                            placement="bottom"
                          >
                            <Button
                              disabled={upgrading}
                              onClick={async () => {
                                try {
                                  await upgradeFsAction();
                                } catch (_e) {
                                  // Handled inside upgradeFsAction.
                                }
                              }}
                            >
                              {localFsRoot ? (
                                <Trans>Change folder</Trans>
                              ) : (
                                <Trans>Select Projects Folder</Trans>
                              )}
                            </Button>
                          </Tip>
                        )}
                        <Tip
                          label={t`Download (one time) before using PC Storage`}
                          placement="bottom"
                        >
                          <Button
                            onClick={() =>
                              window.open(
                                "https://drive.google.com/open?id=1oD0WMJRq1UPEFEXWphKXR6paFwWpBS4o",
                                "_blank",
                              )
                            }
                          >
                            <Trans>Download the projects folder</Trans>
                          </Button>
                        </Tip>
                      </div>
                    </div>
                  )}
                </div>

                <span className="font-bold phone:pt-1">
                  <Trans>Editor</Trans>
                </span>
                <SwitchRow
                  checked={monaco.wants}
                  disabled={!monaco.canUse}
                  onCheckedChange={(checked) => monaco.toggle(checked)}
                >
                  <Trans>Use Monaco Editor</Trans>
                </SwitchRow>

                {/* Theme Section */}
                <span id={`${id}-theme`} className="font-bold phone:pt-1">
                  <Trans>Theme</Trans>
                </span>
                <ToggleGroup
                  aria-labelledby={`${id}-theme`}
                  value={theme}
                  onValueChange={(value) => setTheme(value as typeof theme)}
                >
                  <ToggleGroupItem value="light">
                    <Trans>Light</Trans>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dark">
                    <Trans>Dark</Trans>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="system">
                    <Trans>System</Trans>
                  </ToggleGroupItem>
                </ToggleGroup>

                {/* Bottom Section - Utility Items */}
                <div className="border-t border-border phone:col-span-2" />

                {!localFsRoot && (
                  <>
                    <span className="font-bold phone:pt-1">
                      <Trans>Browser Storage Reset</Trans>
                    </span>
                    <div>
                      <Button onClick={() => setResetStep("warn")}>
                        <Trans>Reset browser storage files</Trans>
                      </Button>
                    </div>
                  </>
                )}

                <span className="font-bold">
                  <Trans>References</Trans>
                </span>
                <div className="grid grid-flow-row grid-cols-1 gap-1">
                  <a
                    href="https://nand2tetris.org"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Trans>nand2tetris.org (course website)</Trans>
                  </a>
                  <a
                    href="https://github.com/davidsouther/nand2tetris"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Trans>nand2tetris/web-IDE on Github (open source)</Trans>
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {permissionPromptDialog}
      {resetDialog}
    </>
  );
};

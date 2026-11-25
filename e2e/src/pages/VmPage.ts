import { expect, type Locator, type Page } from "@playwright/test";
import { panel } from "../helpers";
import { FilePicker } from "./FilePicker";
import { RamPanel } from "./RamPanel";

export class VmPage {
  filePicker: FilePicker;
  ramPanel: RamPanel;

  constructor(private _page: Page) {
    this.filePicker = new FilePicker(_page);
    this.ramPanel = new RamPanel(panel(_page, "RAM").first());
  }

  get page(): Page {
    return this._page;
  }

  get vmStructures(): Locator {
    return panel(this._page, "VM Structures");
  }

  private get vmRunbar(): Locator {
    return panel(this._page, "VM Code");
  }

  async loadProjectFile(
    projectId: "07" | "08",
    name: string,
    fileName: string,
  ): Promise<void> {
    await this.filePicker.open();
    await this.filePicker.selectPath(["projects", projectId, name, fileName]);
  }

  async step(): Promise<void> {
    await this.clickRunbarButton("Step");
  }

  async run(): Promise<void> {
    await this.clickRunbarButton("Run");
  }

  async reset(): Promise<void> {
    await this.clickRunbarButton("Reset");
  }

  private async clickRunbarButton(tooltip: string): Promise<void> {
    await this.vmRunbar
      .getByRole("button", { name: tooltip, exact: true })
      .click();
  }

  async waitForHalt(): Promise<void> {
    await expect(this._page.getByText("Program halted")).toBeVisible();
  }

  async expectHalted(): Promise<void> {
    await expect(this._page.getByText("Program halted")).toBeVisible();
  }

  async expectNotHalted(): Promise<void> {
    await expect(this._page.getByText("Program halted")).toBeHidden();
  }

  async readRam(address: number): Promise<number> {
    return this.ramPanel.readAt(address);
  }

  async fillEditor(content: string): Promise<void> {
    const textarea = this._page.locator('[data-testid="editor-vm"]');
    await expect(textarea).toBeEnabled();
    await textarea.fill(content);
  }
}

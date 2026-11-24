import { expect, type Page } from "@playwright/test";
import { FilePicker } from "./FilePicker";
import { RamPanel } from "./RamPanel";

export class CpuPage {
  readonly filePicker: FilePicker;
  readonly ramPanel: RamPanel;

  constructor(private _page: Page) {
    this.filePicker = new FilePicker(_page);
    this.ramPanel = new RamPanel(_page.locator("article.panel.memory.RAM"));
  }

  get page(): Page {
    return this._page;
  }

  async selectTst(name: string): Promise<void> {
    const picker = this._page.locator('select[data-testid="test-picker"]');
    await picker.selectOption(name);
    await expect(picker).toHaveValue(name);
    await expect(
      this._page
        .locator("article._test_panel")
        .getByRole("button", { name: "Run Test", exact: true }),
    ).toBeEnabled();
  }

  async loadProgram(pathSegments: string[]): Promise<void> {
    await this._page
      .locator("article.panel.memory.ROM")
      .getByRole("button", { name: "Load an .asm or .hack file", exact: true })
      .click();
    await this.filePicker.selectPath(pathSegments);
  }

  private get ioPanel() {
    return this._page.locator("article.panel.IO");
  }

  async readRamCell(address: number): Promise<number> {
    return this.ramPanel.readAt(address);
  }

  async setRamCell(address: number, value: number): Promise<void> {
    await this.ramPanel.writeAt(address, value);
  }

  async step(): Promise<void> {
    await this.ioPanel
      .getByRole("button", { name: "Step Code", exact: true })
      .click();
  }

  async reset(): Promise<void> {
    await this.ioPanel.getByLabel("Reset", { exact: true }).click();
    await expect.poll(async () => await this.readRegister("PC")).toBe(0);
  }

  async readRegister(name: "PC" | "A" | "D"): Promise<number> {
    const text = await this._page
      .locator(`[data-testid="register-${name}"]`)
      .textContent();
    return Number((text ?? "").trim());
  }
}

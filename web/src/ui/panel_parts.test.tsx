import { Panel as WidgetPanel } from "@nand2tetris/components/panel.js";
import FormRoot from "../shell/form_controls";
import { Panel } from "../shell/panel";
import { render, screen, userEvent, within } from "../testing";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs", () => {
  async function renderTabs(onValueChange = vi.fn()) {
    await render(
      <Tabs defaultValue="tst" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="tst">Test Script</TabsTrigger>
          <TabsTrigger value="cmp">Compare File</TabsTrigger>
        </TabsList>
        <TabsContent value="tst">
          <input aria-label="Script editor" defaultValue="" />
        </TabsContent>
        <TabsContent value="cmp">Compare text</TabsContent>
      </Tabs>,
    );
    return onValueChange;
  }

  it("selects the next tab with the arrow key", async () => {
    const events = userEvent.setup();
    const onValueChange = await renderTabs();
    await events.click(screen.getByRole("tab", { name: "Test Script" }));
    await events.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Compare File" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(onValueChange).toHaveBeenLastCalledWith("cmp");
    // jsdom applies no Tailwind, so read the state that hides a panel.
    const active = document.querySelector(
      "[data-slot=tabs-content][data-state=active]",
    );
    expect(active).toHaveTextContent("Compare text");
  });

  it("keeps an inactive tab mounted, so its editor keeps its state", async () => {
    const events = userEvent.setup();
    await renderTabs();
    await events.type(screen.getByLabelText("Script editor"), "repeat");
    await events.click(screen.getByRole("tab", { name: "Compare File" }));
    const hidden = screen.getByLabelText("Script editor", {
      selector: "input",
    });
    expect(hidden.closest("[data-slot=tabs-content]")).toHaveAttribute(
      "data-state",
      "inactive",
    );
    await events.click(screen.getByRole("tab", { name: "Test Script" }));
    expect(screen.getByLabelText("Script editor")).toHaveValue("repeat");
  });
});

describe("Accordion", () => {
  it("opens several items and hides a closed item's content", async () => {
    const events = userEvent.setup();
    await render(
      <Accordion defaultValue={["registers"]}>
        <AccordionItem value="registers">
          <AccordionTrigger>Registers</AccordionTrigger>
          <AccordionContent>PC 0</AccordionContent>
        </AccordionItem>
        <AccordionItem value="visualization">
          <AccordionTrigger>Visualization</AccordionTrigger>
          <AccordionContent>ALU</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const registers = screen.getByRole("button", { name: "Registers" });
    const visualization = screen.getByRole("button", { name: "Visualization" });
    expect(registers).toHaveAttribute("aria-expanded", "true");
    // Closed content stays mounted; `data-state=closed` hides it (Tailwind).
    expect(screen.getByText("ALU")).toHaveAttribute("data-state", "closed");

    await events.click(visualization);
    expect(registers).toHaveAttribute("aria-expanded", "true");
    expect(visualization).toHaveAttribute("aria-expanded", "true");

    await events.click(registers);
    expect(registers).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("PC 0")).toHaveAttribute("data-state", "closed");
  });
});

describe("Panel", () => {
  it("is a region named by its title, with controls in the title bar", async () => {
    await render(
      <Panel title="VM Code" header={<button type="button">Load files</button>}>
        <p>push constant 0</p>
      </Panel>,
    );
    const region = screen.getByRole("region", { name: "VM Code" });
    expect(region).toHaveAttribute("data-slot", "panel");
    expect(
      within(region).getByRole("button", { name: "Load files" }).parentElement,
    ).toHaveAttribute("data-slot", "panel-header");
  });

  it("names an untitled panel with aria-label and nests as a section", async () => {
    await render(
      <Panel aria-label="Computer">
        <Panel title="Screen">canvas</Panel>
      </Panel>,
    );
    const outer = screen.getByRole("region", { name: "Computer" });
    expect(outer).not.toHaveAttribute("data-nested");
    expect(screen.getByRole("region", { name: "Screen" })).toHaveAttribute(
      "data-nested",
      "true",
    );
  });

  it("renders components widgets' panels through FormRoot", async () => {
    await render(
      <FormRoot>
        <WidgetPanel title="RAM" overflow="clip">
          rows
        </WidgetPanel>
      </FormRoot>,
    );
    const region = screen.getByRole("region", { name: "RAM" });
    expect(region).toHaveAttribute("data-slot", "panel");
    expect(within(region).getByText("rows")).toHaveAttribute(
      "data-slot",
      "panel-body",
    );
  });
});

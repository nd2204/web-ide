import { DiffTable } from "@nand2tetris/components/difftable.js";
import { SymbolTable } from "@nand2tetris/components/symbol_table.js";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FormRoot from "./form_controls";

const SYMBOLS = [
  { name: "R0", value: "0" },
  { name: "SCREEN", value: "16384" },
  { name: "LOOP", value: "4" },
];

function renderSymbols(highlight = -1) {
  render(
    <FormRoot>
      <h2 id="title">Symbol Table</h2>
      <SymbolTable
        values={SYMBOLS}
        highlight={highlight}
        headings={{ symbol: "Symbol", address: "Address" }}
        aria-labelledby="title"
      />
    </FormRoot>,
  );
  return screen.getByRole("table", { name: "Symbol Table" });
}

describe("Symbol table through FormRoot", () => {
  it("is a named table of symbol and address columns", () => {
    const table = renderSymbols();
    expect(table).toHaveAttribute("data-slot", "table");
    const headers = within(table).getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent)).toEqual(["Symbol", "Address"]);
    const row = within(table).getByRole("row", { name: "SCREEN 16384" });
    expect(within(row).getAllByRole("cell")[1]).toHaveAttribute(
      "data-slot",
      "table-cell",
    );
  });

  it("marks only the highlighted row as current", () => {
    const table = renderSymbols(1);
    const current = within(table)
      .getAllByRole("row")
      .filter((row) => row.getAttribute("aria-current") === "true");
    expect(current.map((row) => row.textContent)).toEqual(["SCREEN16384"]);
  });

  it("uses compact rows", () => {
    expect(renderSymbols()).toHaveAttribute("data-density", "compact");
  });
});

describe("Diff table through FormRoot", () => {
  it("tints only the cells that differ from the compare file", () => {
    render(
      <FormRoot>
        <DiffTable cmp={"|a|b|\n|1|0|\n"} out={"|a|b|\n|1|1|\n"} />
      </FormRoot>,
    );
    const failed = screen
      .getAllByRole("cell")
      .filter((cell) => cell.dataset.tone === "fail");
    expect(failed).toHaveLength(1);
    expect(failed[0]).toHaveTextContent("01");
    expect(screen.getByText("1 failure")).toBeVisible();
  });
});

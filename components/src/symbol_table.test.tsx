import { render, screen, within } from "@testing-library/react";
import { SymbolTable } from "./symbol_table.js";

// Without a provider from `web`, the table parts are plain elements.
describe("<SymbolTable /> without table parts", () => {
  it("renders a plain table with the given headings", () => {
    render(
      <SymbolTable
        values={[{ name: "SCREEN", value: "16384" }]}
        headings={{ symbol: "Symbol", address: "Address" }}
      />,
    );
    const table = screen.getByRole("table");
    expect(table).not.toHaveAttribute("data-slot");
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((h) => h.textContent),
    ).toEqual(["Symbol", "Address"]);
    expect(
      within(table).getByRole("row", { name: "SCREEN 16384" }),
    ).toBeVisible();
  });
});

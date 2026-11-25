import type { TranslatorSymbol } from "./stores/asm.store.js";
import { useTableParts } from "./table.js";

/**
 * The assembler's symbols and their addresses. The column headings arrive
 * translated from `web`; name the table with `aria-labelledby`.
 */
export const SymbolTable = ({
  values = [],
  highlight = -1,
  headings,
  "aria-labelledby": labelledBy,
}: {
  values?: TranslatorSymbol[];
  highlight?: number;
  headings: { symbol: string; address: string };
  "aria-labelledby"?: string;
}) => {
  const { Table, Header, Body, Row, Head, Cell } = useTableParts();
  return (
    <Table density="compact" aria-labelledby={labelledBy}>
      <Header>
        <Row>
          <Head scope="col">{headings.symbol}</Head>
          <Head scope="col" align="end">
            {headings.address}
          </Head>
        </Row>
      </Header>
      <Body>
        {values.map((entry, i) => (
          <Row key={i} aria-current={i === highlight ? "true" : undefined}>
            <Cell>{entry.name}</Cell>
            <Cell align="end">{entry.value}</Cell>
          </Row>
        ))}
      </Body>
    </Table>
  );
};

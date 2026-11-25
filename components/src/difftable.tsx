import { display } from "@davidsouther/jiffies/display.ts";
import { range } from "@davidsouther/jiffies/range.ts";
import { Err, isErr, Ok } from "@davidsouther/jiffies/result.ts";
import { CMP } from "@nand2tetris/simulator/languages/cmp.js";
import { ReactElement } from "react";
import { useTableParts } from "./table.js";
import "./public/difftable.css";

export const DiffTable = ({
  className = "",
  out,
  cmp,
  zeroState,
}: {
  out: string;
  cmp: string;
  className?: string;
  zeroState?: ReactElement;
}) => {
  const { Table, Body, Row, Cell } = useTableParts();
  const output = CMP.parse(out);
  const compare = CMP.parse(cmp);

  if (isErr(output)) {
    return (
      <details>
        <summary>Failed to parse output</summary>
        <pre>{display(Err(output))}</pre>
        <code>
          <pre>{out}</pre>
        </code>
      </details>
    );
  }

  if (isErr(compare)) {
    return (
      <details>
        <summary>Failed to parse compare</summary>
        <code>
          <pre>{display(Err(compare))}</pre>
          <pre>{cmp}</pre>
        </code>
      </details>
    );
  }

  const cmpData = Ok(compare);
  const outData = Ok(output);
  let failures = 0;
  const table = range(0, Math.min(cmpData.length, outData.length)).map((i) => {
    const cmpI = cmpData[i] ?? [];
    const outI = outData[i] ?? [];
    return range(0, Math.max(cmpI.length, outI.length))
      .map((_, j) => [cmpI[j] ?? "", outI[j] ?? ""])
      .map(([cmp, out]) => {
        const cell = {
          cmp: cmp ?? '"',
          out: out ?? '"',
          pass:
            cmp?.trim().match(/^\*+$/) !== null || out?.trim() === cmp?.trim(),
        };
        if (!cell.pass) {
          failures += 1;
        }
        return cell;
      });
  });

  return (
    <div className={"difftable-scroll " + className}>
      {failures > 0 && (
        <p>
          {failures} failure{failures === 1 ? "" : "s"}
        </p>
      )}
      {table.length > 0 ? (
        <Table>
          <Body>
            {table.map((row, i) => (
              <Row key={i}>
                {row.map(({ cmp, out, pass }, j) => (
                  <Cell key={j} tone={pass ? "default" : "fail"}>
                    {pass ? (
                      cmp
                    ) : (
                      <>
                        <ins>{cmp}</ins>
                        <br />
                        <del>{out}</del>
                      </>
                    )}
                  </Cell>
                ))}
              </Row>
            ))}
          </Body>
        </Table>
      ) : (
        (zeroState ?? <p>Execute test script to compare output.</p>)
      )}
    </div>
  );
};

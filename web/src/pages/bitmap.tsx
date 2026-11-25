import { Trans, useLingui } from "@lingui/react/macro";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Panel } from "../shell/panel";
import {
  createGrid,
  generateHackAssemblyCode,
  generateJackCodeLine,
  getColumns,
  getWordValue,
} from "../utils/bitmapUtils";
import "./bitmap.scss";
import { SwitchRow } from "../shell/switch_row";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

// Constants
const STATE_KEY = "bitmap_editor_state";
const GRID_KEY = "bitmap_editor_grid";

interface BitmapState {
  width: number;
  height: number;
  pixelSize: number;
  currentIShift: number;
  currentJShift: number;
  marginSaveFrames: number;
  baseI: number;
  baseJ: number;
  drawHeight: number;
  invertMode: boolean;
  comments: boolean;
}

const defaultState: BitmapState = {
  width: 48,
  height: 32,
  pixelSize: 16,
  currentIShift: 0,
  currentJShift: 0,
  marginSaveFrames: 1,
  baseI: 0,
  baseJ: 0,
  drawHeight: 0,
  invertMode: false,
  comments: true,
};

type CodeMode = "jack" | "hack";
type MarginType = "fitToDrawing" | "rectangular" | "fullCanvas";

export const BitmapEditor = () => {
  const { t } = useLingui();
  // Load state from localStorage
  const loadState = (): BitmapState => {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        return { ...defaultState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Error loading bitmap editor state:", e);
    }
    return defaultState;
  };

  const loadGrid = (
    width: number,
    height: number,
    invertMode: boolean,
  ): boolean[][] => {
    try {
      const saved = localStorage.getItem(GRID_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading bitmap editor grid:", e);
    }
    return createGrid(width, height, invertMode);
  };

  // State
  const initialState = loadState();
  const [width, setWidth] = useState(initialState.width);
  const [height, setHeight] = useState(initialState.height);
  const [pixelSize, setPixelSize] = useState(initialState.pixelSize);
  const [currentIShift, setCurrentIShift] = useState(
    initialState.currentIShift,
  );
  const [currentJShift, setCurrentJShift] = useState(
    initialState.currentJShift,
  );
  const [marginSaveFrames, setMarginSaveFrames] = useState(
    initialState.marginSaveFrames,
  );
  const [invertMode, setInvertMode] = useState(initialState.invertMode);
  const [comments, setComments] = useState(initialState.comments);

  const [grid, setGrid] = useState<boolean[][]>(() =>
    loadGrid(initialState.width, initialState.height, initialState.invertMode),
  );

  const [currentColor, setCurrentColor] = useState<boolean | null>(null);
  const [codeMode, setCodeMode] = useState<CodeMode>("jack");
  const [pauseCode, setPauseCode] = useState(false);
  const [marginType, setMarginType] = useState<MarginType>("fitToDrawing");
  const [obviousStyling, setObviousStyling] = useState(false);
  const [baseTopLeft, setBaseTopLeft] = useState(true);

  // Refs for input fields
  const widthInputRef = useRef<HTMLInputElement>(null);
  const heightInputRef = useRef<HTMLInputElement>(null);
  const pixelSizeInputRef = useRef<HTMLInputElement>(null);
  const marginFramesInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedName, setImportedName] = useState<string>();

  // Save state to localStorage
  useEffect(() => {
    const state: BitmapState = {
      width,
      height,
      pixelSize,
      currentIShift,
      currentJShift,
      marginSaveFrames,
      baseI: 0,
      baseJ: 0,
      drawHeight: 0,
      invertMode,
      comments,
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }, [
    width,
    height,
    pixelSize,
    currentIShift,
    currentJShift,
    marginSaveFrames,
    invertMode,
    comments,
  ]);

  // Save grid to localStorage
  useEffect(() => {
    localStorage.setItem(GRID_KEY, JSON.stringify(grid));
  }, [grid]);

  // Get used words for code generation
  const getUsedWords = useCallback(() => {
    const words: Record<string, [number, number][]> = {};
    let leftJ = 0;
    let rightJ = width - 1;
    let baseJ = 0;
    let bottomI = height - 1;
    let topI = 0;
    let baseI = height - 1;

    if (marginType !== "fullCanvas") {
      // Find drawing borders
      findLeft: for (let j = 0; j < width; j++) {
        for (let i = height - 1; i >= 0; i--) {
          if (grid[i]?.[j] !== invertMode) {
            leftJ = j;
            break findLeft;
          }
        }
      }

      findRight: for (let j = width - 1; j >= 0; j--) {
        for (let i = height - 1; i >= 0; i--) {
          if (grid[i]?.[j] !== invertMode) {
            rightJ = j;
            break findRight;
          }
        }
      }

      findBottom: for (let i = height - 1; i >= 0; i--) {
        for (let j = 0; j < width; j++) {
          if (grid[i]?.[j] !== invertMode) {
            bottomI = i;
            break findBottom;
          }
        }
      }

      findTop: for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          if (grid[i]?.[j] !== invertMode) {
            topI = i;
            break findTop;
          }
        }
      }

      baseJ = leftJ - currentJShift;
      baseI = bottomI - currentIShift;
      rightJ = Math.max(rightJ, rightJ - currentJShift);
      leftJ = Math.min(leftJ, leftJ - currentJShift);
    }

    const columns = getColumns(leftJ, rightJ, baseJ);

    for (const col of columns) {
      const thisCol: [number, number][] = [];
      const colIndex = col * 16 + baseJ;

      if (marginType === "fullCanvas") {
        for (let i = 0; i < height; i++) {
          thisCol.push([i, colIndex]);
        }
      } else if (marginType === "rectangular") {
        const minI = Math.min(topI, baseI);
        const maxI = Math.max(bottomI, baseI);
        for (let i = minI; i <= maxI; i++) {
          if (i < 0 || i >= height) continue;
          thisCol.push([i, colIndex]);
        }
      } else {
        // fitToDrawing: collect rows that contain drawing data in this 16-px column,
        // including extra rows needed for horizontal-shift animation frames.
        const includedIvalues = new Set<number>();
        const minI = Math.min(topI, baseI);
        const maxI = Math.max(bottomI, baseI);

        for (let i = minI; i <= maxI; i++) {
          if (i < 0 || i >= height) continue;
          let thisIIn = false; // true if row i has any drawn pixel in this word

          // Check pixels within the current 16-px word
          for (let j = colIndex; j < colIndex + 16; j++) {
            if (j >= 0 && j < width) {
              if (grid[i]?.[j] !== invertMode) {
                thisIIn = true;
                break;
              }

              // Also check neighboring columns that will shift into this word during animation
              if (currentJShift > 0) {
                for (
                  let l = colIndex + 16;
                  l < Math.min(currentJShift, marginSaveFrames) + colIndex + 16;
                  l++
                ) {
                  if (l >= width) break;
                  if (grid[i]?.[l] !== invertMode) {
                    thisIIn = true;
                    break;
                  }
                }
              } else if (currentJShift < 0) {
                for (
                  let l = colIndex - 1;
                  l > Math.max(currentJShift, -marginSaveFrames) + colIndex - 1;
                  l--
                ) {
                  if (l < 0) break;
                  if (grid[i]?.[l] !== invertMode) {
                    thisIIn = true;
                    break;
                  }
                }
              }
            }
          }

          if (thisIIn) {
            includedIvalues.add(i);
            const minM = Math.min(i, i - currentIShift);
            const maxM = Math.max(i, i - currentIShift);
            for (let m = minM; m <= maxM; m++) {
              if (m >= 0 && m < height) includedIvalues.add(m);
            }
          }
        }

        for (const item of includedIvalues) {
          thisCol.push([item, colIndex]);
        }
      }

      words[col.toString()] = thisCol;
    }

    const drawHeight = Math.max(bottomI, baseI) - Math.min(topI, baseI);
    return { words, baseI, baseJ, columns, drawHeight };
  }, [
    grid,
    width,
    height,
    invertMode,
    marginType,
    currentIShift,
    currentJShift,
    marginSaveFrames,
  ]);

  // Generate code
  const generatedCode = useMemo(() => {
    if (pauseCode) return "";

    const { words, baseI, columns, drawHeight } = getUsedWords();
    const baseRow = baseTopLeft ? drawHeight : 0;
    const subroutineName = "draw";

    if (codeMode === "jack") {
      let code =
        "function void " +
        subroutineName +
        "(int location) {\n\tvar int memAddress; \n\tlet memAddress = 16384+location;\n";

      for (const col of columns) {
        if (comments) {
          code += "\t// column " + col + "\n";
        }
        const coords = words[col.toString()] || [];
        for (const [i, j] of coords) {
          const value = getWordValue(grid, i, j, invertMode, width);
          code += generateJackCodeLine(i - baseI + baseRow, value, col);
        }
      }
      code += "\treturn;\n}";
      return code;
    } else {
      // hack assembly
      const rowsOfWords: Record<
        string,
        { coords: [number, number]; col: string }[]
      > = {};
      for (const col in words) {
        for (const coords of words[col]) {
          const key = coords[0].toString();
          if (!rowsOfWords[key]) rowsOfWords[key] = [];
          rowsOfWords[key].push({ coords, col });
        }
      }

      let code = "(" + subroutineName + ")\n";
      if (comments) {
        code +=
          "\t// put bitmap location value in R12\n\t// put code return address in R13\n";
      }
      code += "\t@SCREEN\n\tD=A\n\t@R12\n\tAD=D+M\n";

      let dHoldsAddr = true;
      let previousCoords: [number, number] | null = null;
      let previousCol: string | null = null;

      const sortedRows = Object.keys(rowsOfWords)
        .map(Number)
        .sort((a, b) => a - b);

      for (const row of sortedRows) {
        if (comments) code += "\t// row " + (row + 1) + "\n";
        for (const data of rowsOfWords[row.toString()]) {
          const { coords, col } = data;
          const value = getWordValue(
            grid,
            coords[0],
            coords[1],
            invertMode,
            width,
          );
          let addrIncrement = 0;
          if (previousCoords !== null && previousCol !== null) {
            addrIncrement =
              (coords[0] - previousCoords[0]) * 32 +
              (parseInt(col) - parseInt(previousCol));
          }
          const hackCode = generateHackAssemblyCode(
            addrIncrement,
            value,
            dHoldsAddr,
            comments,
          );
          dHoldsAddr = hackCode.dHoldsAddr;
          code += hackCode.code;
          previousCoords = coords;
          previousCol = col;
        }
      }

      if (comments) code += "\t// return\n";
      code += "\t@R13\n\tA=M\n\tD;JMP\n";
      return code;
    }
  }, [
    grid,
    codeMode,
    comments,
    pauseCode,
    getUsedWords,
    invertMode,
    width,
    baseTopLeft,
  ]);

  // Word edge columns for styling
  const wordEdgeColumns = useMemo(() => {
    if (!obviousStyling) return new Set<number>();
    const { columns, baseJ } = getUsedWords();
    const edges = new Set<number>();
    for (const col of columns) {
      edges.add(col * 16 + baseJ);
    }
    return edges;
  }, [obviousStyling, getUsedWords]);

  // Drawing event handlers
  const startDraw = useCallback((i: number, j: number) => {
    // use functional update to avoid reading stale grid from closure
    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row]);
      const newColor = !newGrid[i][j];
      newGrid[i][j] = newColor;
      setCurrentColor(newColor);
      return newGrid;
    });
  }, []);

  const moveDraw = useCallback(
    (i: number, j: number) => {
      if (currentColor === null) return;
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row]);
        newGrid[i][j] = currentColor;
        return newGrid;
      });
    },
    [currentColor],
  );

  const stopDraw = useCallback(() => {
    setCurrentColor(null);
  }, []);

  const handleResize = useCallback(() => {
    const newWidth =
      Math.floor(parseInt(widthInputRef.current?.value || "48") / 16) * 16;
    const newHeight = parseInt(heightInputRef.current?.value || "32");
    const newPixelSize = parseInt(pixelSizeInputRef.current?.value || "16");

    if (isNaN(newWidth) || isNaN(newHeight) || isNaN(newPixelSize)) return;

    setWidth(newWidth);
    setHeight(newHeight);
    setPixelSize(newPixelSize);

    setGrid((prev) => {
      const newGrid = createGrid(newWidth, newHeight, invertMode);
      for (let i = 0; i < Math.min(newHeight, prev.length); i++) {
        for (let j = 0; j < Math.min(newWidth, prev[i]?.length || 0); j++) {
          newGrid[i][j] = prev[i][j];
        }
      }
      return newGrid;
    });
  }, [invertMode]);

  const handleReset = useCallback(() => {
    setWidth(defaultState.width);
    setHeight(defaultState.height);
    setPixelSize(defaultState.pixelSize);
    setCurrentIShift(0);
    setCurrentJShift(0);
    setMarginSaveFrames(1);
    setInvertMode(false);
    setComments(true);
    setGrid(createGrid(defaultState.width, defaultState.height, false));

    // Reset input fields
    if (widthInputRef.current)
      widthInputRef.current.value = defaultState.width.toString();
    if (heightInputRef.current)
      heightInputRef.current.value = defaultState.height.toString();
    if (pixelSizeInputRef.current)
      pixelSizeInputRef.current.value = defaultState.pixelSize.toString();
    if (marginFramesInputRef.current) marginFramesInputRef.current.value = "1";
  }, []);

  const shiftLeft = useCallback(() => {
    setCurrentJShift((prev) => prev - 1);
    setGrid((prev) => {
      return prev.map((row) => {
        const newRow = [...row];
        for (let j = 0; j < width - 1; j++) {
          newRow[j] = row[j + 1];
        }
        newRow[width - 1] = invertMode;
        return newRow;
      });
    });
  }, [width, invertMode]);

  const shiftRight = useCallback(() => {
    setCurrentJShift((prev) => prev + 1);
    setGrid((prev) => {
      return prev.map((row) => {
        const newRow = [...row];
        for (let j = width - 1; j > 0; j--) {
          newRow[j] = row[j - 1];
        }
        newRow[0] = invertMode;
        return newRow;
      });
    });
  }, [width, invertMode]);

  const shiftUp = useCallback(() => {
    setCurrentIShift((prev) => prev - 1);
    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row]);
      for (let i = 0; i < height - 1; i++) {
        newGrid[i] = [...prev[i + 1]];
      }
      newGrid[height - 1] = new Array(width).fill(invertMode);
      return newGrid;
    });
  }, [height, width, invertMode]);

  const shiftDown = useCallback(() => {
    setCurrentIShift((prev) => prev + 1);
    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row]);
      for (let i = height - 1; i > 0; i--) {
        newGrid[i] = [...prev[i - 1]];
      }
      newGrid[0] = new Array(width).fill(invertMode);
      return newGrid;
    });
  }, [height, width, invertMode]);

  const clearShifting = useCallback(() => {
    setCurrentIShift(0);
    setCurrentJShift(0);
  }, []);

  const rotateBitmapRight = useCallback(() => {
    if (height !== width) return;
    setGrid((prev) => {
      const newGrid = createGrid(width, height, invertMode);
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          newGrid[j][height - 1 - i] = prev[i][j];
        }
      }
      return newGrid;
    });
    clearShifting();
  }, [height, width, invertMode, clearShifting]);

  const mirrorBitmap = useCallback(() => {
    setGrid((prev) => {
      return prev.map((row) => {
        const newRow = [...row];
        for (let j = 0; j < width; j++) {
          newRow[j] = row[width - 1 - j];
        }
        return newRow;
      });
    });
  }, [width]);

  const invertBitmap = useCallback(() => {
    setGrid((prev) => {
      return prev.map((row) => row.map((cell) => !cell));
    });
  }, []);

  const handleMarginFramesChange = useCallback(() => {
    let value = parseInt(marginFramesInputRef.current?.value || "1");
    if (value < 1) value = 1;
    setMarginSaveFrames(value);
  }, []);

  // keep uncontrolled input refs in sync when state changes (consistent with other pages)
  useEffect(() => {
    if (widthInputRef.current) widthInputRef.current.value = width.toString();
    if (heightInputRef.current)
      heightInputRef.current.value = height.toString();
    if (pixelSizeInputRef.current)
      pixelSizeInputRef.current.value = pixelSize.toString();
    if (marginFramesInputRef.current)
      marginFramesInputRef.current.value = marginSaveFrames.toString();
  }, [width, height, pixelSize, marginSaveFrames]);

  // File import handlers
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const extension = file.name.toLowerCase().split(".").pop();

      if (extension === "bmp" || extension === "png") {
        setImportedName(file.name);
      }
      if (extension === "bmp") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const buffer = new Uint8Array(e.target?.result as ArrayBuffer);
          parseBMP(buffer);
        };
        reader.readAsArrayBuffer(file);
      } else if (extension === "png") {
        parsePNG(file);
      } else {
        alert(
          "This file type is not supported. Please upload a .bmp (24-bit) or .png image.",
        );
      }

      event.target.value = "";
    },
    [],
  );

  const parseBMP = useCallback((bytes: Uint8Array) => {
    const bmpWidth = bytes[18] + (bytes[19] << 8);
    const bmpHeight = bytes[22] + (bytes[23] << 8);
    const offset = bytes[10] + (bytes[11] << 8);
    const depth = bytes[28];

    if (depth !== 24) {
      alert(
        "Only 24-bit BMP files are supported. Please convert your BMP file to a 24-bit depth bitmap.",
      );
      return;
    }

    const rowSize = Math.floor((24 * bmpWidth + 31) / 32) * 4;
    const newWidth = Math.ceil(bmpWidth / 16) * 16;
    const newHeight = bmpHeight;

    const newGrid: boolean[][] = [];
    for (let i = 0; i < newHeight; i++) {
      newGrid[i] = new Array(newWidth).fill(false);
    }

    for (let y = 0; y < bmpHeight; y++) {
      const row = bmpHeight - 1 - y;
      for (let x = 0; x < bmpWidth; x++) {
        const index = offset + row * rowSize + x * 3;
        const blue = bytes[index];
        const green = bytes[index + 1];
        const red = bytes[index + 2];
        const luminance = (red + green + blue) / 3;
        newGrid[y][x] = luminance < 128;
      }
    }

    setWidth(newWidth);
    setHeight(newHeight);
    setGrid(newGrid);
  }, []);

  const parsePNG = useCallback((file: File) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    img.onload = () => {
      const newWidth = Math.ceil(img.width / 16) * 16;
      const newHeight = img.height;

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, newWidth, newHeight);
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, newWidth, newHeight).data;

      const newGrid: boolean[][] = [];
      for (let y = 0; y < newHeight; y++) {
        newGrid[y] = new Array(newWidth).fill(false);
        for (let x = 0; x < newWidth; x++) {
          const index = (y * newWidth + x) * 4;
          const r = imageData[index];
          const g = imageData[index + 1];
          const b = imageData[index + 2];
          const a = imageData[index + 3];
          const luminance = (r + g + b) / 3;
          newGrid[y][x] = a > 0 && luminance < 250;
        }
      }

      setWidth(newWidth);
      setHeight(newHeight);
      setGrid(newGrid);
    };
  }, []);

  return (
    <div
      className="Page BitmapPage grid"
      onMouseUp={stopDraw}
      onMouseLeave={stopDraw}
    >
      {/* Canvas Panel */}
      <Panel
        className="canvas-panel"
        header={
          <fieldset
            className="canvas-size-controls mb-0 inline-flex w-auto gap-x-3 gap-y-1 border-0 py-1"
            style={{ alignItems: "flex-end", flexWrap: "wrap" }}
          >
            <legend className="float-left mb-0 inline-flex min-h-7 items-center font-bold">
              <Trans>Canvas size</Trans>
            </legend>
            <div className="grid grid-flow-row grid-cols-1 *:min-w-0 gap-0.5">
              <Label htmlFor="inputWidth">
                <Trans>Width</Trans>
              </Label>
              <Input
                ref={widthInputRef}
                id="inputWidth"
                className="w-[calc(4ch+1.25rem)] [font-family:var(--font-family-monospace)]"
                inputMode="numeric"
                maxLength={3}
                defaultValue={width}
              />
            </div>
            <div className="grid grid-flow-row grid-cols-1 *:min-w-0 gap-0.5">
              <Label htmlFor="inputHeight">
                <Trans>Height</Trans>
              </Label>
              <Input
                ref={heightInputRef}
                id="inputHeight"
                className="w-[calc(4ch+1.25rem)] [font-family:var(--font-family-monospace)]"
                inputMode="numeric"
                maxLength={3}
                defaultValue={height}
              />
            </div>
            <div className="grid grid-flow-row grid-cols-1 *:min-w-0 gap-0.5">
              <Label htmlFor="pixelSize">
                <Trans>Pixel size</Trans>
              </Label>
              <Input
                ref={pixelSizeInputRef}
                id="pixelSize"
                className="w-[calc(3ch+1.25rem)] [font-family:var(--font-family-monospace)]"
                inputMode="numeric"
                maxLength={2}
                defaultValue={pixelSize}
              />
            </div>
            <div className="inline-flex w-auto gap-1.5">
              <Button
                onClick={handleResize}
                title={t`Resize Canvas Preserving Upper-left Contents`}
              >
                <Trans>Resize</Trans>
              </Button>
              <Button
                onClick={handleReset}
                title={t`Reset Canvas Size, Settings, and Clear Contents`}
              >
                <Trans>Reset</Trans>
              </Button>
            </div>
          </fieldset>
        }
      >
        <div
          role="group"
          aria-label={t`Canvas`}
          // Scrolls a large canvas; focusable so the keyboard can scroll it.
          tabIndex={0}
          className="overflow-auto p-1"
        >
          <table
            className={`canvas-grid ${obviousStyling ? "obvious-edges" : ""}`}
            onMouseLeave={stopDraw}
          >
            <tbody>
              {/* Column labels row */}
              <tr>
                <td></td>
                {Array.from({ length: width }, (_, j) => (
                  <td
                    key={`col-${j}`}
                    className="col-label"
                    style={{ fontSize: `${pixelSize * 0.6}px` }}
                  >
                    {j + 1}
                  </td>
                ))}
              </tr>
              {/* Grid rows */}
              {Array.from({ length: height }, (_, i) => (
                <tr key={`row-${i}`}>
                  <td
                    className="row-label"
                    style={{ fontSize: `${pixelSize * 0.6}px` }}
                  >
                    {i + 1}
                  </td>
                  {Array.from({ length: width }, (_, j) => (
                    <td
                      key={`cell-${i}-${j}`}
                      className={`cell ${grid[i]?.[j] ? "filled" : "empty"} ${
                        wordEdgeColumns.has(j) ? "word-edge" : ""
                      }`}
                      style={{ width: pixelSize, height: pixelSize }}
                      onMouseDown={() => startDraw(i, j)}
                      onMouseOver={() => moveDraw(i, j)}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Code Panel: the Tabs root wraps the panel so its list can sit in the
          title bar; `contents` keeps the panel itself the grid item. */}
      <Tabs
        className="contents"
        value={codeMode}
        onValueChange={(mode) => setCodeMode(mode as CodeMode)}
      >
        <Panel
          className="code-panel"
          header={
            <TabsList className="w-auto shrink border-0">
              <TabsTrigger value="jack">
                <Trans>Generated Jack Code</Trans>
              </TabsTrigger>
              <TabsTrigger value="hack">
                <Trans>Generated Hack Assembly</Trans>
              </TabsTrigger>
            </TabsList>
          }
        >
          <TabsContent value="jack" className="h-full">
            <Textarea
              className="generated-code"
              aria-label={t`Generated Jack Code`}
              readOnly
              value={codeMode === "jack" ? generatedCode : ""}
            />
          </TabsContent>
          <TabsContent value="hack" className="h-full">
            <Textarea
              className="generated-code"
              aria-label={t`Generated Hack Assembly`}
              readOnly
              value={codeMode === "hack" ? generatedCode : ""}
            />
          </TabsContent>
        </Panel>
      </Tabs>

      {/* Controls Panel */}
      <Panel className="controls-panel">
        {/* Row 1: image import, manipulation keys and switches */}
        <div className="control-row">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".bmp, .png, image/bmp, image/png"
            onChange={handleFileSelect}
          />
          <div className="inline-flex w-auto max-w-full items-stretch">
            <output
              aria-live="polite"
              className="inline-flex min-h-7 min-w-[10ch] items-center break-all rounded-l-sm border border-r-0 border-well-edge bg-well px-2 text-[0.9rem] text-foreground"
            >
              {importedName ?? <Trans>No image imported</Trans>}
            </output>
            <Button
              className="rounded-l-none"
              onClick={() => fileInputRef.current?.click()}
              title={t`Import BMP (24-bit) or PNG (black and white) file`}
            >
              <Trans>Import Image</Trans>
            </Button>
          </div>

          <div className="button-group">
            <Button onClick={shiftLeft}>
              <Trans>Shift left &lt;</Trans>
            </Button>
            <Button onClick={shiftRight}>
              <Trans>Shift right &gt;</Trans>
            </Button>
            <Button onClick={shiftUp}>
              <Trans>Shift up ^</Trans>
            </Button>
            <Button onClick={shiftDown}>
              <Trans>Shift down v</Trans>
            </Button>
            <Button onClick={clearShifting}>
              <Trans>Clear Shifting</Trans>
            </Button>
          </div>

          <div className="button-group">
            <Button onClick={rotateBitmapRight} disabled={width !== height}>
              <Trans>Rotate right</Trans>
            </Button>
            <Button onClick={mirrorBitmap}>
              <Trans>Flip horizontally</Trans>
            </Button>
            <Button onClick={invertBitmap}>
              <Trans>Invert</Trans>
            </Button>
          </div>
        </div>

        <div className="control-row">
          <SwitchRow checked={invertMode} onCheckedChange={setInvertMode}>
            <Trans>Inverted Mode</Trans>
          </SwitchRow>
          <SwitchRow checked={pauseCode} onCheckedChange={setPauseCode}>
            <Trans>Pause Code Generation</Trans>
          </SwitchRow>
          <SwitchRow checked={comments} onCheckedChange={setComments}>
            <Trans>Comments On</Trans>
          </SwitchRow>
          <SwitchRow
            checked={obviousStyling}
            onCheckedChange={setObviousStyling}
          >
            <Trans>Obvious Word Edges</Trans>
          </SwitchRow>
        </div>

        {/* Row 2: margin type */}
        <div className="control-row" style={{ alignItems: "flex-end" }}>
          <div className="inline-flex w-auto flex-wrap items-center gap-2">
            <span
              id="bitmapMarginLabel"
              className="text-[0.9rem] leading-tight"
            >
              <Trans>Margin</Trans>
            </span>
            <ToggleGroup
              aria-labelledby="bitmapMarginLabel"
              value={marginType}
              onValueChange={(value) => setMarginType(value as MarginType)}
            >
              <ToggleGroupItem value="fitToDrawing">
                <Trans>Fit to drawing</Trans>
              </ToggleGroupItem>
              <ToggleGroupItem value="rectangular">
                <Trans>Rectangular</Trans>
              </ToggleGroupItem>
              <ToggleGroupItem value="fullCanvas">
                <Trans>Full Canvas</Trans>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {marginType === "fitToDrawing" && (
            <div className="grid grid-flow-row grid-cols-1 *:min-w-0 gap-0.5">
              <Label htmlFor="marginSaveFrames">
                <Trans>Horizontal shifts per animation frame</Trans>
              </Label>
              <Input
                ref={marginFramesInputRef}
                id="marginSaveFrames"
                className="w-[calc(3ch+1.25rem)] [font-family:var(--font-family-monospace)]"
                inputMode="numeric"
                maxLength={2}
                defaultValue={marginSaveFrames}
                onChange={handleMarginFramesChange}
              />
            </div>
          )}
        </div>

        {/* Row 3: base address */}
        <div className="control-row">
          <div className="inline-flex w-auto flex-wrap items-center gap-2">
            <span id="bitmapBaseLabel" className="text-[0.9rem] leading-tight">
              <Trans>Base address</Trans>
            </span>
            <ToggleGroup
              aria-labelledby="bitmapBaseLabel"
              value={baseTopLeft ? "topLeft" : "bottomLeft"}
              onValueChange={(value) => setBaseTopLeft(value === "topLeft")}
            >
              <ToggleGroupItem value="topLeft">
                <Trans>Top Left</Trans>
              </ToggleGroupItem>
              <ToggleGroupItem value="bottomLeft">
                <Trans>Bottom Left</Trans>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default BitmapEditor;

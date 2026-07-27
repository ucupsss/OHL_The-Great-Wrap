import { describe, expect, it } from "vitest";
import { parseDatasetText } from "./fileParser";

describe("file parser", () => {
  it("parses comma-separated point data and skips a header row", () => {
    const result = parseDatasetText("x,y\n10,20\n30,40");

    expect(result).toEqual({
      points: [
        { id: "p-1", x: 10, y: 20 },
        { id: "p-2", x: 30, y: 40 },
      ],
      duplicateRows: [],
      rejectedRows: [],
    });
  });

  it("parses whitespace-separated point data", () => {
    const result = parseDatasetText("10 20\n30 40");

    expect(result.points).toEqual([
      { id: "p-1", x: 10, y: 20 },
      { id: "p-2", x: 30, y: 40 },
    ]);
  });

  it("deduplicates coordinates and reports invalid and duplicate rows", () => {
    const result = parseDatasetText("10,20\nbad,row\n10,20\n50,60,extra");

    expect(result.points).toEqual([
      { id: "p-1", x: 10, y: 20 },
      { id: "p-2", x: 50, y: 60 },
    ]);
    expect(result.duplicateRows).toEqual([3]);
    expect(result.rejectedRows).toEqual([2]);
  });

  it("accepts points on the visible canvas boundary", () => {
    const result = parseDatasetText("0,0\n1000,600");

    expect(result.points).toEqual([
      { id: "p-1", x: 0, y: 0 },
      { id: "p-2", x: 1000, y: 600 },
    ]);
    expect(result.rejectedRows).toEqual([]);
  });

  it("rejects points outside the visible canvas", () => {
    const result = parseDatasetText("-1,20\n1001,20\n20,-1\n20,601\n500,300");

    expect(result.points).toEqual([{ id: "p-1", x: 500, y: 300 }]);
    expect(result.rejectedRows).toEqual([1, 2, 3, 4]);
  });
});

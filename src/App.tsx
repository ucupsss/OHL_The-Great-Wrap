import { type ChangeEvent, useMemo, useRef, useState } from "react";
import { Play, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { PointCanvas, SVG_VIEWBOX } from "@/components/visualizer/PointCanvas";
import {
  ALGORITHM_OPTIONS,
  calculateConvexHull,
  type ConvexHullAlgorithm,
  getAlgorithmLabel,
} from "@/algorithms/convexHull";
import type { Point } from "@/types/point";
import { generateRandomPoints } from "@/utils/datasetGenerator";
import { analyzeEdgeCases } from "@/utils/edgeCases";
import { parseDatasetText } from "@/utils/fileParser";
import { removePointById } from "@/utils/pointList";

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [algorithm, setAlgorithm] = useState<ConvexHullAlgorithm>("graham");
  const [pointCount, setPointCount] = useState("30");
  const [points, setPoints] = useState<Point[]>([]);
  const [datasetNotice, setDatasetNotice] = useState("Click the SVG workspace to add points.");
  const activeAlgorithmLabel = getAlgorithmLabel(algorithm);
  const edgeCaseStatus = useMemo(() => analyzeEdgeCases(points), [points]);
  const hullResult = useMemo(
    () => calculateConvexHull(points, algorithm),
    [algorithm, points],
  );

  function handleGeneratePoints() {
    const count = Number(pointCount);
    const generatedPoints = generateRandomPoints({
      count: Number.isFinite(count) ? count : 0,
      viewport: SVG_VIEWBOX,
    });

    setPoints(generatedPoints);
    setDatasetNotice(`Generated ${generatedPoints.length} random points.`);
    toast.success(`Generated ${generatedPoints.length} points`);
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const result = parseDatasetText(text);
      setPoints(result.points);

      const rejectedMessage =
        result.rejectedRows.length > 0
          ? ` ${result.rejectedRows.length} invalid rows were skipped.`
          : "";
      const duplicateMessage =
        result.duplicateRows.length > 0
          ? ` ${result.duplicateRows.length} duplicate rows were skipped.`
          : "";

      setDatasetNotice(
        `Imported ${result.points.length} points from ${file.name}.${rejectedMessage}${duplicateMessage}`,
      );
      toast.success(`Imported ${result.points.length} points`);
    } catch {
      setDatasetNotice(`Could not read ${file.name}.`);
      toast.error("Could not import dataset");
    }
  }

  function handleResetPoints() {
    setPoints([]);
    setDatasetNotice("Dataset cleared. Click the workspace, generate, or import points.");
  }

  function handleRemovePoint(pointId: string) {
    setPoints((currentPoints) => {
      const nextPoints = removePointById(currentPoints, pointId);
      setDatasetNotice(`Manual dataset has ${nextPoints.length} points.`);
      return nextPoints;
    });
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto grid min-h-dvh max-w-7xl grid-cols-1 gap-4 p-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>The Great Wrap</CardTitle>
              <Badge variant="secondary">Milestone 7</Badge>
            </div>
            <CardDescription>
              Tambahkan titik secara manual, dengan generator, atau dengan import file .csv / .txt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="point-count">
                Point count
              </label>
              <Input
                id="point-count"
                min="0"
                onChange={(event) => setPointCount(event.target.value)}
                type="number"
                value={pointCount}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select
                value={algorithm}
                onValueChange={(value) => setAlgorithm(value as ConvexHullAlgorithm)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose algorithm" />
                </SelectTrigger>
                <SelectContent>
                  {ALGORITHM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="rounded-md border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Edge case status</span>
                <Badge
                  variant={edgeCaseStatus.severity === "success" ? "default" : "secondary"}
                >
                  {edgeCaseStatus.label}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{edgeCaseStatus.message}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGeneratePoints}>
                <Play className="size-4" />
                Generate
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="size-4" />
                Import
              </Button>
              <Button variant="ghost" onClick={handleResetPoints}>
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <input
                ref={fileInputRef}
                accept=".csv,.txt,text/csv,text/plain"
                className="hidden"
                onChange={handleImportFile}
                type="file"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Step speed</span>
                <span className="text-muted-foreground">1.0x</span>
              </div>
              <Slider defaultValue={[50]} max={100} step={1} />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="visualizer" className="min-w-0">
          <TabsList>
            <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
          </TabsList>
          <TabsContent value="visualizer">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle>Convex Hull Canvas</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{points.length} points</Badge>
                    <Badge variant="secondary">{hullResult.hull.length} hull points</Badge>
                    <Badge
                      variant={edgeCaseStatus.severity === "success" ? "default" : "secondary"}
                    >
                      {edgeCaseStatus.label}
                    </Badge>
                    <Badge>{activeAlgorithmLabel}</Badge>
                  </div>
                </div>
                <CardDescription>
                  {datasetNotice} {activeAlgorithmLabel} is drawing the current hull automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PointCanvas
                  hullPoints={hullResult.hull}
                  points={points}
                  onPointRemove={handleRemovePoint}
                  onPointsChange={(nextPoints) => {
                    setPoints(nextPoints);
                    setDatasetNotice(`Manual dataset has ${nextPoints.length} points.`);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="steps">
            <Card>
              <CardHeader>
                <CardTitle>Step Controls</CardTitle>
                <CardDescription>
                  {activeAlgorithmLabel} has recorded {hullResult.steps.length} algorithm steps for
                  the current dataset.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
          <TabsContent value="benchmark">
            <Card>
              <CardHeader>
                <CardTitle>Benchmark</CardTitle>
                <CardDescription>
                  Runtime comparison table will be added after algorithms exist.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster richColors />
    </main>
  );
}

export default App;

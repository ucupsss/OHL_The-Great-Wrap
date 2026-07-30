import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Upload,
} from "lucide-react";
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
import {
  DATASET_PATTERN_OPTIONS,
  type DatasetPattern,
  generateDatasetPoints,
} from "@/utils/datasetGenerator";
import { type BenchmarkResult, runBenchmarkSuite } from "@/utils/benchmark";
import { analyzeEdgeCases } from "@/utils/edgeCases";
import { parseDatasetText } from "@/utils/fileParser";
import { removePointById } from "@/utils/pointList";
import {
  getPlaybackTiming,
  getStepFrame,
  getStepProgress,
  getVisualizerCanvasFrame,
  type VisualizerMode,
} from "@/utils/stepPlayback";

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [algorithm, setAlgorithm] = useState<ConvexHullAlgorithm>("graham");
  const [isPlayingSteps, setIsPlayingSteps] = useState(false);
  const [datasetPattern, setDatasetPattern] = useState<DatasetPattern>("uniform");
  const [pointCount, setPointCount] = useState("30");
  const [points, setPoints] = useState<Point[]>([]);
  const [datasetNotice, setDatasetNotice] = useState("Click the SVG workspace to add points.");
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([]);
  const [benchmarkNotice, setBenchmarkNotice] = useState(
    "Run a benchmark to compare all available algorithms.",
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [stepSpeed, setStepSpeed] = useState(50);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>("edit");
  const activeAlgorithmLabel = getAlgorithmLabel(algorithm);
  const edgeCaseStatus = useMemo(() => analyzeEdgeCases(points), [points]);
  const hullResult = useMemo(
    () => calculateConvexHull(points, algorithm),
    [algorithm, points],
  );
  const maxStepIndex = Math.max(0, hullResult.steps.length - 1);
  const playbackTiming = getPlaybackTiming(stepSpeed);
  const stepFrame = useMemo(
    () => getStepFrame(hullResult.steps, stepIndex, hullResult.hull),
    [hullResult.hull, hullResult.steps, stepIndex],
  );
  const stepProgress = useMemo(
    () => getStepProgress(hullResult.steps, stepIndex),
    [hullResult.steps, stepIndex],
  );
  const canvasFrame = useMemo(
    () => getVisualizerCanvasFrame(visualizerMode, hullResult.hull, stepFrame),
    [hullResult.hull, stepFrame, visualizerMode],
  );

  useEffect(() => {
    setStepIndex(0);
    setIsPlayingSteps(false);
  }, [algorithm, points]);

  useEffect(() => {
    if (!isPlayingSteps) {
      return;
    }

    if (stepIndex >= maxStepIndex) {
      setIsPlayingSteps(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStepIndex((currentStepIndex) => Math.min(maxStepIndex, currentStepIndex + 1));
    }, playbackTiming.intervalMs);

    return () => window.clearTimeout(timeoutId);
  }, [isPlayingSteps, maxStepIndex, playbackTiming.intervalMs, stepIndex]);

  function handleGeneratePoints() {
    const count = Number(pointCount);
    const generatedPoints = generateDatasetPoints({
      count: Number.isFinite(count) ? count : 0,
      pattern: datasetPattern,
      viewport: SVG_VIEWBOX,
    });
    const patternLabel =
      DATASET_PATTERN_OPTIONS.find((option) => option.value === datasetPattern)?.label ??
      "dataset";

    setPoints(generatedPoints);
    setDatasetNotice(`Generated ${generatedPoints.length} ${patternLabel.toLowerCase()} points.`);
    toast.success(`Generated ${generatedPoints.length} ${patternLabel.toLowerCase()} points`);
  }

  function handleRunBenchmark() {
    const count = Number(pointCount);
    const benchmarkPoints = generateDatasetPoints({
      count: Number.isFinite(count) ? count : 0,
      pattern: datasetPattern,
      viewport: SVG_VIEWBOX,
    });
    const patternLabel =
      DATASET_PATTERN_OPTIONS.find((option) => option.value === datasetPattern)?.label ??
      "dataset";
    const results = runBenchmarkSuite({ points: benchmarkPoints });

    setBenchmarkResults(results);
    setBenchmarkNotice(
      `Benchmarked ${benchmarkPoints.length} ${patternLabel.toLowerCase()} points.`,
    );
    toast.success("Benchmark completed");
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
          ? ` ${result.rejectedRows.length} invalid or out-of-canvas rows were skipped.`
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

  function handleSelectEditMode() {
    setIsPlayingSteps(false);
    setVisualizerMode("edit");
  }

  function handleSelectStepMode() {
    setVisualizerMode("step");
  }

  function handlePreviousStep() {
    setVisualizerMode("step");
    setIsPlayingSteps(false);
    setStepIndex((currentStepIndex) => Math.max(0, currentStepIndex - 1));
  }

  function handleNextStep() {
    setVisualizerMode("step");
    setIsPlayingSteps(false);
    setStepIndex((currentStepIndex) => Math.min(maxStepIndex, currentStepIndex + 1));
  }

  function handleResetSteps() {
    setVisualizerMode("step");
    setIsPlayingSteps(false);
    setStepIndex(0);
  }

  function handleTogglePlayback() {
    setVisualizerMode("step");
    setStepIndex((currentStepIndex) => (currentStepIndex >= maxStepIndex ? 0 : currentStepIndex));
    setIsPlayingSteps((currentIsPlaying) => !currentIsPlaying);
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto grid min-h-dvh max-w-7xl grid-cols-1 gap-4 p-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>The Great Wrap</CardTitle>
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
              <label className="text-sm font-medium">Pattern</label>
              <Select
                value={datasetPattern}
                onValueChange={(value) => setDatasetPattern(value as DatasetPattern)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose pattern" />
                </SelectTrigger>
                <SelectContent>
                  {DATASET_PATTERN_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Canvas mode</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleSelectEditMode}
                  variant={visualizerMode === "edit" ? "default" : "outline"}
                >
                  <MousePointer2 className="size-4" />
                  Edit
                </Button>
                <Button
                  onClick={handleSelectStepMode}
                  variant={visualizerMode === "step" ? "default" : "outline"}
                >
                  <Play className="size-4" />
                  Step
                </Button>
              </div>
            </div>

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

            <Separator />

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stepProgress.label}</span>
                  <Badge variant="secondary">{stepFrame.step?.type ?? "idle"}</Badge>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${stepProgress.percent}%` }}
                  />
                </div>
              </div>

              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-sm text-muted-foreground">
                  {stepFrame.step?.description ?? "No recorded step for the current dataset."}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Button
                  aria-label="Previous step"
                  disabled={stepIndex <= 0}
                  onClick={handlePreviousStep}
                  variant="outline"
                >
                  <SkipBack className="size-4" />
                </Button>
                <Button className="col-span-1" onClick={handleTogglePlayback}>
                  {isPlayingSteps ? <Pause className="size-4" /> : <Play className="size-4" />}
                </Button>
                <Button
                  aria-label="Next step"
                  disabled={stepIndex >= maxStepIndex}
                  onClick={handleNextStep}
                  variant="outline"
                >
                  <SkipForward className="size-4" />
                </Button>
                <Button aria-label="Reset steps" onClick={handleResetSteps} variant="ghost">
                  <RotateCcw className="size-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Step speed</span>
                <span className="text-muted-foreground">{playbackTiming.speed.toFixed(1)}x</span>
              </div>
              <Slider
                max={400}
                min={10}
                onValueChange={(value) => setStepSpeed(value[0] ?? 50)}
                step={10}
                value={[stepSpeed]}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="visualizer" className="min-w-0">
          <TabsList>
            <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
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
                    <Badge variant="outline">{visualizerMode === "edit" ? "Edit" : "Step"} mode</Badge>
                  </div>
                </div>
                <CardDescription>
                  {visualizerMode === "edit"
                    ? `${datasetNotice} ${activeAlgorithmLabel} is drawing the current hull automatically.`
                    : "Step mode is read-only. Orange marks the active check, red marks the current hull snapshot."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PointCanvas
                  activePoints={canvasFrame.activePoints}
                  candidatePoints={canvasFrame.candidatePoints}
                  hullPoints={canvasFrame.hullPoints}
                  isInteractive={canvasFrame.isInteractive}
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
          <TabsContent value="benchmark">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Benchmark</CardTitle>
                    <CardDescription>
                      Compare Graham Scan, Jarvis March, and QuickHull with the selected dataset
                      pattern.
                    </CardDescription>
                  </div>
                  <Button onClick={handleRunBenchmark}>
                    <BarChart3 className="size-4" />
                    Run Benchmark
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{pointCount || "0"} points</Badge>
                  <Badge variant="secondary">
                    {DATASET_PATTERN_OPTIONS.find((option) => option.value === datasetPattern)
                      ?.label ?? "Dataset"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{benchmarkNotice}</p>

                <div className="overflow-hidden rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-left">
                      <tr>
                        <th className="px-3 py-2 font-medium">Algorithm</th>
                        <th className="px-3 py-2 text-right font-medium">Runtime</th>
                        <th className="px-3 py-2 text-right font-medium">Hull Points</th>
                        <th className="px-3 py-2 text-right font-medium">Steps</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {benchmarkResults.length > 0 ? (
                        benchmarkResults.map((result) => (
                          <tr key={result.algorithm}>
                            <td className="px-3 py-2 font-medium">{result.label}</td>
                            <td className="px-3 py-2 text-right">
                              {result.durationMs.toFixed(3)} ms
                            </td>
                            <td className="px-3 py-2 text-right">{result.hullPointCount}</td>
                            <td className="px-3 py-2 text-right">{result.stepCount}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-6 text-center text-muted-foreground" colSpan={4}>
                            No benchmark results yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <CardDescription>
                  Runtime depends on the browser and current machine load, so compare relative
                  results from the same run.
                </CardDescription>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster richColors />
    </main>
  );
}

export default App;

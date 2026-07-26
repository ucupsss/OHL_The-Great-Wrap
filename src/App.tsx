import { Play, RotateCcw, Upload } from "lucide-react";
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

function App() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto grid min-h-dvh max-w-7xl grid-cols-1 gap-4 p-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>The Great Wrap</CardTitle>
              <Badge variant="secondary">Milestone 1</Badge>
            </div>
            <CardDescription>
              UI foundation for the Convex Hull Visualizer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="point-count">
                Point count
              </label>
              <Input id="point-count" min="3" type="number" defaultValue="30" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select defaultValue="graham">
                <SelectTrigger>
                  <SelectValue placeholder="Choose algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="graham">Graham Scan</SelectItem>
                  <SelectItem value="jarvis">Jarvis March</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button>
                <Play className="size-4" />
                Generate
              </Button>
              <Button variant="outline">
                <Upload className="size-4" />
                Import
              </Button>
              <Button variant="ghost">
                <RotateCcw className="size-4" />
                Reset
              </Button>
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
                <CardTitle>Convex Hull Canvas</CardTitle>
                <CardDescription>
                  The SVG visualizer will be implemented in the next milestone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid aspect-[16/10] place-items-center rounded-md border border-dashed bg-muted/30 text-sm text-muted-foreground">
                  SVG workspace ready
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="steps">
            <Card>
              <CardHeader>
                <CardTitle>Step Controls</CardTitle>
                <CardDescription>
                  Playback controls will connect to algorithm snapshots later.
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


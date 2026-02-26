import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            React + Vite + Shadcn
          </h1>
          <p className="text-muted-foreground">
            A clean base project with Tailwind CSS v4
          </p>
        </div>

        <div className="p-6 border rounded-xl bg-card shadow-sm space-y-4">
          <div className="flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">
              Counter Stage
            </h3>
            <p className="text-sm text-muted-foreground">
              Try out the shadcn button and state.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => setCount((c) => c + 1)}>
              Count is {count}
            </Button>
            <Button variant="outline" onClick={() => setCount(0)}>
              Reset
            </Button>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Sample Input
            </label>
            <Input placeholder="Type something..." />
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Edit{" "}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            src/App.tsx
          </code>{" "}
          to get started.
        </p>
      </div>
    </div>
  );
}

export default App;

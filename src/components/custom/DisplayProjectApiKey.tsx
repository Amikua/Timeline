"use client";

import { useState } from "react";
import { Button } from "../ui/button";

export function DisplayProjectApiKey({ apiKey }: { apiKey: string }) {
  const [hidden, setHidden] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Project api key: </h1>
      <h2 className="text-lg">{hidden ? "*".repeat(apiKey.length) : apiKey}</h2>
      <Button variant="destructive" className="w-32 h-12 bg-yellow-600 hover:bg-yellow-700" onClick={() => setHidden((prev) => !prev)}>
        {hidden ? "Show" : "Hide"}
      </Button>
    </div>
  );
}

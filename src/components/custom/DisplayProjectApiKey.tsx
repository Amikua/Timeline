"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { createOrUpdateApiKey } from "./actions";

export function DisplayApiKey({
  apiKey,
  projectId,
}: {
  apiKey?: string;
  projectId: string;
}) {
  const [hidden, setHidden] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Project api key: </h1>
      {apiKey ? (
      <h2 className="text-lg">{hidden ? "*".repeat(apiKey.length) : apiKey}</h2>
      ): <h2 className="text-lg">No api key found</h2>}
      <div className="space-x-4">
        {apiKey ? (
          <Button
            variant="outline"
            className="h-12 w-32 border-yellow-600 hover:bg-yellow-700"
            onClick={() => setHidden((prev) => !prev)}
          >
            {hidden ? "Show" : "Hide"}
          </Button>
        ) : null}
        <Button
          variant="outline"
          className="h-12 w-36"
          onClick={async () => {
            await createOrUpdateApiKey({ projectId });
          }}
        >
          { apiKey ? "Generate new key" : "Create new key" }
        </Button>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { setProjectBackgroundImage } from "./actions";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function SetProjectBackgroundImage(props: {
  projectId: string;
  backgroundImgUrl: string;
  theme: 'light' | 'dark'
}) {
  const [backgroundImgUrl, setBackgroundImgUrl] = useState(
    props.backgroundImgUrl,
  );
  return (
    <form
      className="flex flex-col gap-4"
      action={async () => {
        await setProjectBackgroundImage({ projectId: props.projectId, url: backgroundImgUrl, theme: props.theme });
      }}
    >
      <h1 className="text-2xl font-bold">Background Image for {props.theme === 'light' ? 'Light' : 'Dark'} Mode</h1>
      <div className="flex max-w-full gap-4">
        <Input
          className="w-64"
          placeholder="Background Image URL"
          value={backgroundImgUrl}
          onChange={(e) => setBackgroundImgUrl(e.target.value)}
          type="text"
          name="backgroundImgUrl"
        />
        <Button variant="outline" className="h-full w-24" type="submit">Set</Button>
      </div>
    </form>
  );
}

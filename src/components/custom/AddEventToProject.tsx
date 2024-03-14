"use client";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { addEventToProject } from "~/components/custom/actions";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Textarea } from "../ui/textarea";

function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending}>
      Add event
    </Button>
  );
}

export function AddEventToProject({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-lg border-2 border-border py-6 my-auto"
        >
          Add event
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New project event</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Add a new project event to the timeline.
        </DialogDescription>
        <form
          className="flex flex-col p-4 gap-4"
          action={async (formData: FormData) => {
            await addEventToProject({
              projectId,
              content: formData.get("content") as string,
            });
            setOpen(false);
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Message
              </Label>
              <Textarea required maxLength={255} id="name" name="content" className="col-span-3 " />
            </div>
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

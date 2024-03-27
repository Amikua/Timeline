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
import { DateTimePicker } from "../ui/time-picker";
import { type EventAndAuthor } from "~/app/dashboard/[projectId]/page";
import { AddCategoryToPost } from "./AddCategoryToPost";
import { type $Enums } from "@prisma/client";

function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending}>
      Add event
    </Button>
  );
}

export function AddEventToProject({
  projectId,
  isActive,
  events,
  setEvents,
}: {
  projectId: string;
  isActive: boolean;
  events: EventAndAuthor[];
  setEvents: (events: EventAndAuthor[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<
    $Enums.Category | ""
  >("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={!isActive}
          className="my-auto rounded-lg border-2 border-border py-6 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px] border-border lg:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New project event</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Add a new project event to the timeline.
        </DialogDescription>
        <form
          className="flex flex-col gap-4 p-4"
          action={async (formData: FormData) => {
            if (!selectedCategory) return;
            try {
              console.log("here");
              const response = await addEventToProject({
                projectId,
                happendAt: date,
                content: formData.get("content") as string,
                category: selectedCategory,
              });
              setOpen(false);
              const event = response.data!.event!;
              setEvents(
                [event, ...events].sort(
                  (a, b) =>
                    new Date(b.happendAt).getTime() -
                    new Date(a.happendAt).getTime(),
                ),
              );
            } catch (error) {
              console.error("Error while adding event", error);
            }
          }}
        >
          <div className="grid gap-4 py-12">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Message
              </Label>
              <Textarea
                required
                maxLength={255}
                id="name"
                name="content"
                className="col-span-3 "
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Category</Label>
              <AddCategoryToPost
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              ></AddCategoryToPost>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date</Label>
              <DateTimePicker date={date} setDate={setDate} />
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

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

function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending}>
      Add event
    </Button>
  );
}

export function AddEventToProject({ projectId, events, setEvents }: { projectId: string; events: EventAndAuthor[]; setEvents: (events: EventAndAuthor[]) => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();

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
      <DialogContent className="border-border max-w-[425px] lg:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New project event</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Add a new project event to the timeline.
        </DialogDescription>
        <form
          className="flex flex-col p-4 gap-4"
          action={async (formData: FormData) => {
            try {
              const response = await addEventToProject({
                projectId,
                happendAt: date,
                content: formData.get("content") as string,
              });
              setOpen(false);
              const event = response.data!.event!;
              setEvents([event, ...events]);
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
              <Textarea required maxLength={255} id="name" name="content" className="col-span-3 " />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Date
              </Label>
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

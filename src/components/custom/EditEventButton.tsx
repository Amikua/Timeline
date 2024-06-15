"use client";
import { useState } from "react";
import { useFormStatus } from "react-dom";
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
import { addEventToProject, updateEvent } from "~/components/custom/actions";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Textarea } from "../ui/textarea";
import { DateTimePicker } from "../ui/time-picker";
import { type EventAndAuthor } from "~/app/dashboard/[projectId]/page";
import { AddCategoryToPost } from "./AddCategoryToPost";
import { type $Enums } from "@prisma/client";
import { Loader2 } from "lucide-react";

function SubmitButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" disabled={status.pending}>
      {status.pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Updating...</span>
        </>
      ) : (
        "Update event"
      )}
    </Button>
  );
}

export function EditEventButton(props: {
  event: EventAndAuthor;
  isActive: boolean;
  events: EventAndAuthor[];
  setEvents: (events: EventAndAuthor[]) => void;
  userId: string;
  eventId: string;
  projectId: string;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(props.event.content);
  const [date, setDate] = useState<Date | undefined>(props.event.happendAt);
  const [selectedCategory, setSelectedCategory] = useState<$Enums.Category>(
    props.event.category,
  );

  if (
    props.userId !==
    props.events.find((event) => event.id === props.eventId)?.author.id
  ) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          disabled={!props.isActive}
          className="ml-auto disabled:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            >
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
            </g>
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px] border-border lg:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Update event</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4 p-4"
          action={async () => {
            if (!selectedCategory) return;
            try {
              const response = await updateEvent({
                projectId: props.projectId,
                happendAt: date,
                content,
                category: selectedCategory,
                eventId: props.eventId,
              });
              setOpen(false);
              const event = response.data!.event!;
              props.setEvents(
                [
                  event,
                  ...props.events.filter((e) => e.id !== props.eventId),
                ].sort(
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
                value={content}
                onChange={(e) => setContent(e.target.value)}
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

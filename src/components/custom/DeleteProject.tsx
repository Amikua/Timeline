"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { deleteProject } from "./actions";
import { type User } from "@prisma/client";

export function DeleteProject({
  user,
  projectId,
}: {
  user: User;
  projectId: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="h-12 w-32 rounded-md bg-destructive px-4 hover:brightness-75 disabled:brightness-50">
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            project.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive"
            onClick={async () => {
              await deleteProject({ id: user.id, projectId });
            }}
          >
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

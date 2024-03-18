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
import { removeUserFromProject } from "./actions";
import { type User } from "@prisma/client";

export function RemoveUserFromProject({
  user,
  projectId,
  disabled,
  text,
}: {
  user: User;
  projectId: string;
  disabled: boolean;
  text: string
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="bg-destructive px-4 w-24 rounded-md disabled:brightness-50" disabled={disabled}>
        {text}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Do you want to remove this user from the project?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No</AlertDialogCancel>
          <AlertDialogAction
            className="float-right bg-destructive hover:bg-destructive hover:brightness-150"
            onClick={async () => {
              await removeUserFromProject({ id: user.id, projectId });
            }}
          >
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

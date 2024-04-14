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
  text: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="w-24 rounded-md border border-destructive px-4 transition-colors duration-200  
        hover:bg-destructive hover:brightness-75 disabled:brightness-50 disabled:cursor-not-allowed"
        disabled={disabled}
      >
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

"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { type User } from "@prisma/client";
import { changeProjectStatus } from "./actions";

export function ChangeProjectStatus({
  user,
  projectId,
  isActive,
  children,
}: {
  user: User;
  projectId: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={`${isActive ? "bg-destructive" : "bg-green-700"} h-12 w-32 rounded-md bg-accent px-4 hover:brightness-75 disabled:brightness-50`}
      >
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive"
            onClick={async () => {
              await changeProjectStatus({
                id: user.id,
                projectId,
                isActive: !isActive,
              });
            }}
          >
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

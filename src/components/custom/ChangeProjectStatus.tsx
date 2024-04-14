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
import { useState, useEffect, useRef } from "react";
import { type User } from "@prisma/client";
import { changeProjectStatus } from "./actions";
import Confetti from "react-confetti";

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
  const [didFinish, setDidFinish] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current) {
      const { width, height } = divRef.current.getBoundingClientRect();
      setWidth(width);
      setHeight(height);
    }
  }, []);

  useEffect(() => {
    if (didFinish) {
      setTimeout(() => {
        setDidFinish(false);
      }, 3000);
    }
  }, [didFinish]);

  return (
    <>
      <div className="absolute left-0 top-0 w-full h-full pointer-events-none" ref={divRef}>
        {didFinish && (
          <Confetti
            width={width}
            numberOfPieces={1000}
            tweenDuration={2500}
            recycle={false}
            height={height}
          />
        )}
      </div>
      <AlertDialog>
        <AlertDialogTrigger
          className={`${isActive ? "border-destructive hover:bg-destructive" : "border-green-700 hover:bg-green-700"} 
          h-12 w-32 rounded-md border transition-colors duration-200 px-4 hover:brightness-75 disabled:brightness-50`}
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
                setDidFinish(isActive);
              }}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

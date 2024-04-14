import { validateRequest } from "~/lib/auth";
import { redirect } from "next/navigation";
import { db } from "~/server/db";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/");
  }
  // Check if user is in the project
  const project = await db.project.findFirst({
    select: {
      backgroundImage: true,
      users: {
        select: {
          id: true,
        },
      },
    },
    where: {
      id: params.projectId,
    },
  });

  if (!project?.users.find((u) => u.id === user.id)) {
    return redirect("/dashboard");
  }

  return (
    <div
      className="max-h-screen; relative flex h-1 min-h-full min-w-full max-w-full flex-col justify-between p-16"
      style={{
        backgroundImage: project?.backgroundImage
          ? `url(${project.backgroundImage})`
          : "",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat"
      }}
    >
      {children}
    </div>
  );
}

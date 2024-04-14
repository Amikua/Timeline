import { redirect } from "next/navigation";
import { AddProject } from "~/components/custom/sidebar/AddProject";
import { validateRequest } from "~/lib/auth";
import { db } from "~/server/db";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/dashboard");
  }

  const userProjectsCount = await db.project.count({
    where: {
      users: {
        some: {
          id: user.id,
        },
      },
    },
  });

  if (userProjectsCount !== 0) {
    return <></>;
  }

  return (
    <div className="flex h-full min-h-screen w-full flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-thin">Start by creating new project</h1>
      <AddProject />
    </div>
  );
}

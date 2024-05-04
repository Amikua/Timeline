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
      backgroundImageLightMode: true,
      backgroundImageDarkMode: true,
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
      className={`relative flex h-1 max-h-screen min-h-full min-w-full max-w-full flex-col justify-between bg-cover
        bg-no-repeat p-16 bg-[image:var(--light-image-url)] dark:bg-[image:var(--dark-image-url)]`}
      style={{
        // @ts-expect-error Typescript doesn't allow setting CSS variables in style but we can actually do that
        "--light-image-url": `url(${project?.backgroundImageLightMode})`,
        "--dark-image-url": `url(${project?.backgroundImageDarkMode})`,
      }}
    >
      {children}
    </div>
  );
}

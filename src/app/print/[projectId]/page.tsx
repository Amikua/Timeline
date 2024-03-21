import Link from "next/link";
import { PrintEventsView } from "~/components/custom/PrintEventsView";

function GoBackToProject({ projectId }: { projectId: string }) {
  return (
    <Link href={`/dashboard/${projectId}`} className="absolute right-4 top-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        className="size-8 hover:brightness-75 print:hidden"
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="m2.87 7.75l1.97 1.97a.75.75 0 1 1-1.06 1.06L.53 7.53L0 7l.53-.53l3.25-3.25a.75.75 0 0 1 1.06 1.06L2.87 6.25h9.88a3.25 3.25 0 0 1 0 6.5h-2a.75.75 0 0 1 0-1.5h2a1.75 1.75 0 1 0 0-3.5z"
          clipRule="evenodd"
        ></path>
      </svg>
    </Link>
  );
}

export default async function Page({
  params: { projectId },
}: {
  params: { projectId: string };
}) {
  return (
    <div>
      <PrintEventsView projectId={projectId} />
      <GoBackToProject projectId={projectId} />
    </div>
  );
}

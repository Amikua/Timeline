import Link from "next/link";

export function Settings(projectId?: string) {
  return (
    <Link
      href={`/dashboard/${projectId}/settings`}
      className="absolute right-4 top-4"
    >
      Settings
    </Link>
  );
}

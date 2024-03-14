import { db } from "~/server/db";
import { RemoveUserFromProject } from "./RemoveUserFromProject";

export async function UserList({ projectId }: { projectId: string }) {
  const project = await db.project.findFirst({
    where: { id: projectId },
    include: {
      users: true,
    },
  });

  return (
    <table className="text-white">
      <thead>
        <tr>
          <th>User</th>
          <th>Email</th>
          <th>Remove</th>
        </tr>
      </thead>
      <tbody>
        {project?.users.map((user, index) => (
          <tr key={index}>
            <td className="px-4 py-4">
              <div className="flex items-center">
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="mr-2 h-10 w-10 rounded-full"
                />
                <span>{user.username}</span>
              </div>
            </td>
            <td className="px-4 py-4">{user.email}</td>
            <td className="px-4py-4">
              <div className="flex justify-center">
                <RemoveUserFromProject
                  user={user}
                  projectId={projectId}
                  disabled={project.users.length < 2}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

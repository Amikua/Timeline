import { db } from "~/server/db";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { RemoveUserFromProject } from "./RemoveUserFromProject";

export async function UserList({ projectId }: { projectId: string }) {
  const project = await db.project.findFirst({
    where: { id: projectId },
    include: {
      users: true,
    },
  });
  return (
    <Table>
      <TableCaption>Members of the project.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className=" w-20" />
          <TableHead className="w-[100px]">Username</TableHead>
  
        </TableRow>
      </TableHeader>
      <TableBody>
        {project?.users.map((user, index) => (
          <TableRow key={index}>
            <TableCell className="text-center font-medium">
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className=" float-end size-10 rounded-3xl"
              />
            </TableCell>
            <TableCell>{user.username}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell className="text-right">
              <RemoveUserFromProject
                user={user}
                projectId={projectId}
                disabled={project.users.length < 2}
              ></RemoveUserFromProject>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

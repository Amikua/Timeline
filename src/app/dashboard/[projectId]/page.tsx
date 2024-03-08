export default async function Page({ params: {projectId} }: { params: { projectId: string}}) {
	return (
		<>
			<h1>Hello from {projectId}</h1>
		</>
	);
}


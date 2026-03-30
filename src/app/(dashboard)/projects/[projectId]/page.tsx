import { ProjectDetailOverview } from "@/components/projects/project-detail-overview";

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectDetailOverview projectId={projectId} />;
}

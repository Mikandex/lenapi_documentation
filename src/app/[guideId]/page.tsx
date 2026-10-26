import { notFound } from "next/navigation";
import DocsShell from "../docs-shell";
import { guides } from "../docs-data";

export function generateStaticParams() {
  return guides.filter((guide) => guide.id !== "introduction").map((guide) => ({ guideId: guide.id }));
}

export default async function GuidePage({ params }: { params: Promise<{ guideId: string }> }) {
  const { guideId } = await params;
  if (!guides.some((guide) => guide.id === guideId && guide.id !== "introduction")) notFound();
  return <DocsShell initialGuideId={guideId} />;
}

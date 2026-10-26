import { notFound } from "next/navigation";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import MockTestClient from "./MockTestClient";

const SUBJECT_IDS = new Set([...CPL_SUBJECTS, ...ATPL_SUBJECTS].map((s) => s.id));

type MockTestPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function MockTestPage({ searchParams }: MockTestPageProps) {
  const params = await searchParams;
  const subjectId = typeof params.subject === "string" ? params.subject : null;
  const type = typeof params.type === "string" ? params.type : null;

  // The generic mock-test page was removed. A hard load without a valid
  // subject should be a real 404, not a blank Suspense shell.
  if (!subjectId || !SUBJECT_IDS.has(subjectId)) {
    notFound();
  }

  // Remount when the paper changes so answers/flagged state cannot leak from a
  // previous sitting into a different subject or test type.
  return <MockTestClient key={`${subjectId}:${type ?? ""}`} subjectId={subjectId} type={type} />;
}

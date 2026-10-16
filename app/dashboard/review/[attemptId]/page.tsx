import type { Metadata } from "next";
import AttemptReview from "./AttemptReview";

// One sitting's saved answer review. The dashboard layout already sets
// robots noindex/nofollow and canonical /dashboard, so this page inherits
// both and only names itself.
export const metadata: Metadata = {
  title: "Review a sitting | Ghost Aviator",
};

export default async function AttemptReviewPage(
  { params }: { params: Promise<{ attemptId: string }> },
) {
  const { attemptId } = await params;
  return <AttemptReview attemptId={attemptId} />;
}

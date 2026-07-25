import { ImageResponse } from "next/og";
import { CPL_SUBJECTS } from "@/lib/subjects";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ subject: string; chapter: string; type: string }>;
}) {
  const { subject: subjectId, chapter: chapterId, type } = await params;

  const subject = CPL_SUBJECTS.find((s) => s.id === subjectId);
  const chapter = subject?.chapters.find((c) => c.id === chapterId);

  const subjectName = subject ? `${subject.name} CPL` : "DGCA CPL Course";
  const chapterName = chapter
    ? `Chapter ${chapter.number}: ${chapter.title}`
    : "Study Material";
    
  let label = "Study Notes";
  if (type === "mock-test") label = "Chapter Test";
  else if (type === "chapter-quiz") label = "Chapter Quiz";
  else if (type === "questions") label = "Question Bank";
  else if (type === "video") label = "Video Lecture";
  else if (type === "audio") label = "Audio Overview";
  else if (type === "slides") label = "Class Slides";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#050510",
          backgroundImage: "linear-gradient(to bottom right, #050510, #0a0a20)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top bar with branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-0.05em",
              }}
            >
              Ghost Aviator
            </div>
            <div
              style={{
                marginLeft: "24px",
                paddingLeft: "24px",
                borderLeft: "4px solid rgba(255,255,255,0.2)",
                fontSize: "36px",
                color: subject?.color || "#0ea5e9",
                fontWeight: 600,
              }}
            >
              {subjectName}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            maxWidth: "900px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(14, 165, 233, 0.15)",
              border: "1px solid rgba(14, 165, 233, 0.3)",
              color: "#0ea5e9",
              padding: "12px 24px",
              borderRadius: "100px",
              fontSize: "28px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              alignSelf: "flex-start",
            }}
          >
            {label}
          </div>

          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginTop: "20px",
            }}
          >
            {chapterName}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "rgba(255,255,255,0.6)",
            fontSize: "32px",
            fontWeight: 500,
          }}
        >
          <span>India's Most Complete DGCA Exam Prep</span>
          <span>ghostaviator.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

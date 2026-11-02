export type StudyEvent = "lesson_open" | "chapter_quiz_start" | "chapter_quiz_complete" |
  "subject_revision_start" | "subject_revision_complete" | "exam_start" | "exam_complete" | "whatsapp_click";

export function recordStudyEvent(name: StudyEvent) {
  window.dispatchEvent(new CustomEvent("ghost-study-event", { detail: name }));
}

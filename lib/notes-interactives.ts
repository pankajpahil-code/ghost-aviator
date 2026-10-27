// Interactive figures placed inside a chapter's notes.
//
// The notes are static HTML rendered with dangerouslySetInnerHTML, so an
// interactive cannot be written into them. Instead each entry names the figure
// it belongs beside (by its content-hashed file name, which only changes if
// the picture itself changes) and HtmlNotesPage inserts a mount point just
// before that figure on the client. The static figure stays where it was:
// crawlers, screen readers, read-aloud and a reader with scripts off get the
// chapter exactly as before.
//
// tools/audit/notes-interactives-check.mts fails if an anchor is no longer in
// its chapter, so a notes rebuild cannot silently drop an interactive.

export type InteractiveId = "one-in-sixty";

export type NotesInteractive = {
  id: InteractiveId;
  /** File name of the figure this sits in front of, e.g. "fig-ba560708db91a660.png". */
  beforeFigure: string;
};

export const NOTES_INTERACTIVES: Record<string, NotesInteractive[]> = {
  // Ch.11 Navigation using the 1 in 60 rule: before Figure 3, where the worked example starts.
  "air-navigation/nav-17": [{ id: "one-in-sixty", beforeFigure: "fig-ba560708db91a660.png" }],
};

export function interactivesFor(subjectId: string, chapterId: string): NotesInteractive[] {
  return NOTES_INTERACTIVES[`${subjectId}/${chapterId}`] ?? [];
}

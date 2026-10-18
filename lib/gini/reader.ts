/** Gini delegates to the same queue, voice choice and notes extraction as the toolbar. */
import { notesRoot, readingSections, chosenVoice, speakText, stopReading, speechSupported, type ReadingSection } from "../read-aloud";
export type NoteSection = ReadingSection;
export const bestVoice = chosenVoice;
export const sections = readingSections;
export const stop = stopReading;
export const supported = speechSupported;
export function hasNotes() { return !!notesRoot(); }
export function speakSection(section: NoteSection, onDone?: () => void) {
  speakText(`${section.title}. ${section.text}`, section.title, onDone);
}

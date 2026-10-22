import fs from 'node:fs';
import { ATPL_STUDY_TOPICS } from '../../lib/atpl-study-topics';
import { ATPL_SUBJECTS, CPL_SUBJECTS } from '../../lib/subjects';
import { servesRealNotes } from '../../lib/indexability';
import { getInlineNotes } from '../../lib/notes-inline';

// Builder's structural checks; this does not certify teaching accuracy or full syllabus coverage.
const problems: string[] = [];
const uniqueSources = new Set<string>();
let sharedHtmlMatches = 0;
const subjects = ATPL_SUBJECTS.map(subject => {
  const topics = ATPL_STUDY_TOPICS[subject.id] ?? [];
  const assigned = new Set<string>();
  for (const topic of topics) {
    if (topics.filter(t => t.id === topic.id).length !== 1) problems.push(`Duplicate topic: ${subject.id}/${topic.id}`);
    for (const ref of topic.sources) for (const chapterId of ref.chapterIds) {
      const key = `${ref.subjectId}/${chapterId}`;
      if (assigned.has(key)) problems.push(`Chapter repeated in topics: ${subject.id}/${key}`);
      assigned.add(key);
      if (!CPL_SUBJECTS.find(s => s.id === ref.subjectId)?.chapters.some(c => c.id === chapterId)) problems.push(`Missing source: ${key}`);
      if (!servesRealNotes(ref.subjectId, chapterId)) problems.push(`Unpublished mapped note: ${key}`);
      const chapter = subject.chapters.find(c => c.notesSource?.subjectId === ref.subjectId && c.notesSource.chapterId === chapterId);
      if (!chapter || !servesRealNotes(subject.id, chapter.id)) { problems.push(`Unreachable alias: ${subject.id}/${key}`); continue; }
      uniqueSources.add(key);
      if (key !== 'air-regulations/ar-1') {
        const source = getInlineNotes(ref.subjectId, chapterId);
        const alias = getInlineNotes(subject.id, chapter.id);
        if (!source || JSON.stringify(source) !== JSON.stringify(alias)) problems.push(`Shared HTML differs: ${subject.id}/${key}`);
        else sharedHtmlMatches++;
      }
    }
  }
  const notes = subject.chapters.filter(c => servesRealNotes(subject.id, c.id));
  if (new Set(subject.chapters.map(c => c.id)).size !== subject.chapters.length) problems.push(`Duplicate chapter ID: ${subject.id}`);
  for (const chapter of notes) if (!assigned.has(`${chapter.notesSource?.subjectId}/${chapter.notesSource?.chapterId}`)) problems.push(`Ungrouped note: ${subject.id}/${chapter.id}`);
  return { id: subject.id, topics: topics.length, notes: notes.length };
});
const result = { subjects, uniqueSharedChapters: uniqueSources.size, sharedHtmlMatches, reactSharedChapters: 1, problems };
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
if (problems.length) process.exitCode = 1;

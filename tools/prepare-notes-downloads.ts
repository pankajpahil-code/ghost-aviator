import fs from "node:fs";
import path from "node:path";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "../lib/subjects";
import { getInlineNotes } from "../lib/notes-inline";
import { NOTES_FIT_CSS } from "../lib/notes-layout";
import { SITE_URL, INSTAGRAM, YOUTUBE_BRAND, TELEGRAM_GROUP, SUBJECT_TELEGRAM_GROUPS } from "../lib/site";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AirRegsChapter1Notes from "../app/components/content/AirRegsChapter1Notes";

// Preparation only: the renderer produces the PDFs and writes the availability
// manifest after successful, nonempty PDF generation. A failed export never
// advertises a download that does not exist.
const escape = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const jobs = [];
for (const subject of [...CPL_SUBJECTS, ...ATPL_SUBJECTS]) {
  for (const chapter of subject.chapters) {
    const notes = getInlineNotes(subject.id, chapter.id);
    const componentNotes = subject.id === "air-regulations" && chapter.id === "ar-1";
    if (!notes && !componentNotes) continue;
    const chapterNotes = notes ?? {
      css: '.ga-notes *{color:#17202b!important;background-color:transparent!important}.ga-notes table{border-collapse:collapse;width:100%}.ga-notes td,.ga-notes th{padding:6px;border:1px solid #ccd3dc}.ga-notes a{color:#175a87!important}',
      html: renderToStaticMarkup(React.createElement(AirRegsChapter1Notes, { track: "cpl", subject, chapter, prevChapter: null, nextChapter: null })),
      stylesheets: [],
    };
    const id = `${subject.id}/${chapter.id}`;
    const file = path.join("public", "_notes-export", id + ".html");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>${escape(chapter.title)} | Ghost Aviator</title>
<meta name="robots" content="noindex,nofollow"><base href="${SITE_URL}/">
${chapterNotes.stylesheets.map(href => `<link rel="stylesheet" href="${escape(href)}">`).join("")}
<style>html,body{margin:0;padding:0;background:white;color:#17202b;font-family:Arial,sans-serif}
.ga-notes{padding:0;background:white;color:#17202b}
${chapterNotes.css}
${NOTES_FIT_CSS}
@page{size:A4;margin:15mm 12mm 22mm}
@media print{
 html,body,.ga-notes{display:block!important;background:white!important}
 .ga-notes{width:100%!important;padding:0!important;overflow:visible!important}
 .ga-notes .page,.ga-notes .sheet{width:auto!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
 .ga-notes .ga-table-scroll{overflow:visible!important}
 .ga-notes table{width:100%!important;max-width:100%!important}
 .ga-notes button,.ga-notes .watermark,.ga-notes .cpp-watermark{display:none!important}
 .ga-notes img{max-height:240mm;object-fit:contain;break-inside:avoid}
 .ga-notes figure,.ga-notes .figure,.ga-notes .qa-block{break-inside:auto!important}
 .ga-notes .answer,.ga-notes .qa-answer,.ga-notes .explanation{display:block!important}
}
</style><body><header style="font:12px Arial;color:#465568;border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:16px">Ghost Aviator &nbsp; | &nbsp; ${escape(subject.name)} &nbsp; | &nbsp; ${escape(chapter.title)}</header>
<article class="ga-notes">${chapterNotes.html.replaceAll('loading="lazy"','loading="eager"')
  .replace(/<details\b([^>]*)>/gi, (tag, attrs: string) => /\bopen(?:\s|=|$)/i.test(attrs) ? tag : `<details open${attrs}>`)}</article></body></html>`;
    // Assets stay same-origin on the local export server, never fetched from a
    // deployed chapter with a different version of its figures.
    fs.writeFileSync(file, html.replace(`<base href="${SITE_URL}/">`, '<base href="/">'));
    jobs.push({ id, title: chapter.title, html: `/_notes-export/${id}.html`,
      links: { Website: SITE_URL, Telegram: SUBJECT_TELEGRAM_GROUPS[subject.id] ?? TELEGRAM_GROUP,
        Instagram: INSTAGRAM, YouTube: YOUTUBE_BRAND, "Live classes": `${SITE_URL}/live-classes` } });
  }
}
fs.mkdirSync(".notes-build", { recursive: true });
fs.writeFileSync(".notes-build/jobs.json", JSON.stringify(jobs, null, 2));
console.log(`Prepared ${jobs.length} chapter exports.`);

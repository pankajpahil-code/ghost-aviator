import { BookOpen, Download } from "lucide-react";
import downloads from "@/lib/generated/book-downloads.json";

export default function FreeBookDownloads() {
  return (
    <section id="free-books" aria-labelledby="free-books-title" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-32">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-2">Free and open to every student pilot</p>
        <h2 id="free-books-title" className="text-3xl font-black text-white mb-3">Download your study books</h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">Keep a copy and study offline. These PDFs are free to download, with no account or payment required. Every page carries Ghost Aviator branding and links to our study community; use the PDF bookmarks to move between chapters.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {downloads.map(book => (
          <article id={`free-book-${book.slug}`} key={book.slug} className="rounded-2xl p-6 border border-amber-300/20 bg-[#101923] flex flex-col scroll-mt-32">
            <div className="flex items-center justify-between gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-amber-300" aria-hidden="true" />
              <span className="text-xs font-bold text-emerald-300">FREE PDF</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{book.title}</h3>
            <p className="text-xs text-slate-400 mb-5">Ghost Aviator · {book.pages} pages · {(book.bytes / 1_000_000).toFixed(1)} MB · Chapter bookmarks</p>
            <div className="flex flex-wrap gap-3 mt-auto">
              <a href={book.url} download className="inline-flex items-center gap-2 min-h-11 px-4 py-3 rounded-xl bg-amber-300 text-slate-950 text-sm font-bold no-underline" aria-label={`Download ${book.title} — free PDF`}>
                <Download className="w-4 h-4" aria-hidden="true" /> Download free PDF
              </a>
              <a href={book.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-11 px-4 py-3 rounded-xl border border-slate-500 text-slate-200 text-sm no-underline" aria-label={`View ${book.title} PDF in a new tab`}>View PDF</a>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-5 text-xs text-slate-400">Study editions for learning and revision. For operational use, consult the applicable current publications and approved procedures.</p>
    </section>
  );
}

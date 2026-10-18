"use client";

export default function GiniLauncher() {
  return (
    <button type="button" className="ga-gini-launch" aria-label="Open Gini study assistant" aria-haspopup="dialog" title="Ask Gini — reading and study help" onClick={() => window.dispatchEvent(new Event("ga:open-gini"))}>
      <span aria-hidden="true">👻</span>
    </button>
  );
}

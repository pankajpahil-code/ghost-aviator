"use client";

import type { CSSProperties, ReactNode } from "react";

type Props = {
  /** Question to place in Gini's input. The student still chooses to send it. */
  query: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Opens the existing site-wide Gini panel and pre-fills a question.
 *
 * The panel owns the conversation. This button only dispatches the same custom
 * event the navigation launcher uses, so there is exactly one Gini mount per
 * page and the AI page never becomes a second, divergent implementation.
 */
export default function AskGiniButton({ query, children, className, style }: Props) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => {
        window.dispatchEvent(new CustomEvent("ga:ask-gini", { detail: { query } }));
      }}
    >
      {children}
    </button>
  );
}

/** One question recalled from real DGCA sittings. Built by tools/previous-questions/build.mts. */
export type PQQuestion = {
  id: string;
  topic: string;
  stem: string;
  opts: string[];
  ans: number;
  exp: string;
  /** Sitting labels, e.g. "Mar 2022 · Regular". Real sittings only. */
  seenIn: string[];
  /** Also found in an undated previous-attempt compilation. */
  undated: boolean;
  /** Distinct sittings that asked it. 0 for a question written from a topic mention. */
  times: number;
  years: number[];
  /** asked: recalled as asked. topic: the topic came up, the question is ours. rebuilt: asked, wording rebuilt from a partial recall. */
  kind: "asked" | "topic" | "rebuilt";
  /** The recall carried no options; the options were written to the recalled question. */
  optionsWritten: boolean;
  /** Shown under the answer when the independent key check could not fully settle it. */
  note?: string;
};

export type PQSubject = {
  slug: string;
  subjectId: string;
  title: string;
  short: string;
  published: boolean;
  /** Date of the independent key check that cleared it for publishing. */
  checked: string;
  sittings: string[];
  firstYear: number;
  lastYear: number;
  questions: PQQuestion[];
};

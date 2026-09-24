// Iron Rule 2 - the ONE compiled form of tools/forbidden-source-names.json.
//
// Every JS/TS check imports this; every Python check imports the twin,
// tools/forbidden_source_names.py. The two build the SAME pattern string by the
// same algorithm, and tools/audit/forbidden-names-selftest.mjs fails the moment
// they disagree or a probe in the JSON is mis-classified. Do not compile the
// names anywhere else - four hand-rolled copies had drifted into four different
// behaviours (exact substring, word-bounded literal, spaced join, initials-aware)
// and only one of them caught "R.K. Bali".
//
// How a name is read (e.g. "RK Bali"):
//   - split on spaces/hyphens into tokens;
//   - a token of 2-3 capital letters is INITIALS: any run of spaces or dots may
//     sit between its letters, and one dot may follow it -> R.K. / R. K. / RK;
//   - any other token must appear as written (case-insensitive);
//   - tokens are joined by any run of spaces, dots or hyphens (or nothing);
//   - the whole name must start at a word boundary, so "work Bali" or
//     "basic Joshi" never match. No trailing boundary: "Oxford textbook" is
//     exactly the attribution "Oxford text" exists to catch.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const JSON_PATH = join(dirname(fileURLToPath(import.meta.url)), "forbidden-source-names.json");

export const FORBIDDEN_DEF = JSON.parse(readFileSync(JSON_PATH, "utf8"));
export const FORBIDDEN_NAMES = FORBIDDEN_DEF.names;

for (const n of FORBIDDEN_NAMES) {
  if (typeof n !== "string" || !/^[A-Za-z0-9]+(?:[ -][A-Za-z0-9]+)*$/.test(n)) {
    throw new Error(`forbidden-source-names.json: "${n}" is not plain text`);
  }
}

const SEP = "[\\s.\\-]*";
const token = t => /^[A-Z]{2,3}$/.test(t) ? t.split("").join("[\\s.]*") + "\\.?" : t;

/** The pattern for one name, as a regex source string (no flags). */
export const namePattern = n => "\\b" + n.split(/[ -]+/).map(token).join(SEP);

/** The pattern for the whole list. Byte-identical to the Python twin's. */
export const FORBIDDEN_PATTERN = "(?:" + FORBIDDEN_NAMES.map(namePattern).join("|") + ")";

/** Case-insensitive, non-global: safe to .test() repeatedly. */
export const FORBIDDEN_RX = new RegExp(FORBIDDEN_PATTERN, "i");

/** First forbidden name in `text` as it was written, or null. */
export function findForbidden(text) {
  const m = FORBIDDEN_RX.exec(String(text ?? ""));
  return m ? m[0] : null;
}

/** Every hit, with its offset - for audits that must list, not just refuse. */
export function findAllForbidden(text) {
  const rx = new RegExp(FORBIDDEN_PATTERN, "gi");
  return [...String(text ?? "").matchAll(rx)].map(m => ({ match: m[0], index: m.index }));
}

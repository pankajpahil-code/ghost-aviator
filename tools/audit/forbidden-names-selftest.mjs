// Iron Rule 2 self-test: the JS and Python compilers of
// tools/forbidden-source-names.json must build the SAME pattern, and every
// calibration probe in that file must be classified the way it says.
// Exits 1 on any disagreement. Run after editing the names, the probes, or
// either compiler:
//
//   node tools/audit/forbidden-names-selftest.mjs
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FORBIDDEN_DEF, FORBIDDEN_PATTERN, FORBIDDEN_RX } from "../forbidden-source-names.mjs";

const TOOLS = join(dirname(fileURLToPath(import.meta.url)), "..");
const probes = FORBIDDEN_DEF.probes ?? {};
let failures = 0;
const fail = msg => { failures++; console.log("  FAIL " + msg); };

for (const s of probes.must_match ?? []) if (!FORBIDDEN_RX.test(s)) fail(`not caught: ${JSON.stringify(s)}`);
for (const s of probes.must_not_match ?? []) if (FORBIDDEN_RX.test(s)) fail(`false positive: ${JSON.stringify(s)}`);
const gaps = (probes.known_gaps ?? []).filter(s => !FORBIDDEN_RX.test(s));

// Python twin. A missing interpreter is a failure, not a skip: the Python
// consumers are the ones this check exists to keep in step.
let py = null;
for (const exe of ["python", "py"]) {
  try {
    py = JSON.parse(execFileSync(exe, [join(TOOLS, "forbidden_source_names.py")], { encoding: "utf8" }));
    break;
  } catch { /* try the next launcher */ }
}
if (!py) fail("could not run tools/forbidden_source_names.py");
else {
  if (py.pattern !== FORBIDDEN_PATTERN) fail(`Python pattern differs:\n    js: ${FORBIDDEN_PATTERN}\n    py: ${py.pattern}`);
  for (const [s, hit] of Object.entries(py.verdicts)) {
    if (hit !== FORBIDDEN_RX.test(s)) fail(`JS and Python disagree on ${JSON.stringify(s)}`);
  }
}

const n = (probes.must_match?.length ?? 0) + (probes.must_not_match?.length ?? 0);
console.log(`${n} probes, ${FORBIDDEN_DEF.names.length} names, Python twin ${py ? "identical" : "NOT CHECKED"}`);
if (gaps.length) console.log(`known gaps (not caught, by design of this check): ${gaps.map(g => JSON.stringify(g)).join(", ")}`);
if (failures) { console.log(`${failures} failure(s)`); process.exitCode = 1; }
else console.log("ALL CHECKS PASSED");

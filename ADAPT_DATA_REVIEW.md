# ADAPT — what data the feature touches, and where the questions are

*Prepared 2026-08-09 for Capt. Pankaj Pahil.*

> **This is not legal advice, and I am not a lawyer.** It is a factual inventory
> of every piece of data the ADAPT feature touches, written so that whoever
> gives you the actual advice can spend their time on judgement instead of on
> working out what the software does. Take it to a lawyer who practises Indian
> data-protection law before relying on any of it.

---

## 1. Why this needs a look at all

Two facts together are what raise the question:

1. **A meaningful share of student pilots are 17 or 18.** India's Digital
   Personal Data Protection Act, 2023 treats anyone under 18 as a child, and
   attaches additional duties to children's data — including verifiable parental
   consent, and restrictions on tracking and behavioural monitoring directed at
   children. Whether what we do counts as "tracking" of a "child" is exactly the
   judgement call that needs a lawyer, not me.
2. **The feature scores behaviour, not just knowledge.** Reaction times, a
   psychomotor score, and — in the attitudes module — responses about how
   someone behaves under pressure. That is a different category from "which
   answer did you pick on a meteorology question".

## 2. Complete inventory of what the feature holds

### 2a. Sent to our server (`adapt_attempts`)

One row per module attempted. Nothing else in the feature is transmitted.

| Field | Example | Why it exists |
|---|---|---|
| `device_id` | random UUID | To count students without knowing who they are |
| `session_seed` | `2782415413` | Lets a disputed paper be rebuilt exactly |
| `module_id` | `aviation-maths` | Which module |
| `module_kind` | `knowledge` | Which scoring path |
| `stanine` | `6` | The grade |
| `headline_pct` | `65` | One percentage |
| `input_class` | `pointer` | Tracking only — norms must not pool a phone with a joystick |
| `completed` | `true` | For the questionnaire, this is the ONLY field it sets |
| `created_at` | timestamp | When |

**Not sent, and no code path exists that could send it:** the questions, the
student's answers, tracking samples, reaction times, or anything at all from the
attitudes questionnaire beyond `completed`. This is enforced by
`lib/adapt/telemetry-core.test.mjs`, which fails if a row ever contains an
attitude, a tally, a profile, a question or an answer.

**No account, no email, no `user_id`.** The row is not joined to `auth.users`
and cannot be — there is no column for it. (This remains true of `adapt_attempts`.
A SECOND, account-linked table was added on 2026-08-10 — see §4b.) RLS is insert-only with **no select
policy**, so no browser can read another device's rows back.

### 2b. Kept on the student's own device only

- **Attempt history** (`ga-adapt-history-v1`) — stanine and a headline per
  module. No answers, nothing from the questionnaire.
- **Device id** (`ga-adapt-device-v1`) — the random UUID above.
- **Opt-out flag** (`ga-adapt-no-telemetry`).

The attitudes questionnaire's answers and profile exist only in memory while the
student is looking at them. They are never written to storage, local or remote.

## 3. The questions a lawyer should actually be asked

1. **Is `device_id` personal data under the Act?** It identifies a browser, not
   a person, and is not derived from anything about the individual. It is
   nonetheless a persistent identifier. This is the central question and
   everything else follows from it.
2. **If it is, does a 17-year-old using this trigger the children's-data
   duties** — verifiable parental consent, and the restriction on behavioural
   monitoring? Note we do not advertise, profile for advertising, or target
   anything at users.
3. **Is a stanine "behavioural monitoring"?** It is a score on a practice test
   the student chose to sit, not observation of their conduct. But it is
   behaviour-derived, and the Act's wording is what matters, not my reading.
4. **Is the current notice sufficient?** The feature page states plainly what is
   recorded and what never leaves the device, the FAQ repeats it, and the result
   page shows what was sent with a working off switch. Is that adequate notice,
   and is an opt-out enough where consent is required?
5. **Retention.** Nothing currently expires. What should the retention period
   be, and should rows be aggregated and the raw ones dropped after it?
6. **Is a Data Protection Officer or a published privacy notice required** at
   this scale of processing?

## 4. What could be tightened cheaply if the answer is uncomfortable

Ranked by how little they cost:

1. **Drop `device_id` entirely.** Loses "how many students", keeps "how many
   sittings" and every score distribution — which is all the norms actually
   need. This is a one-line change and removes the hardest question above.
2. **Round `created_at` to the day.** Removes any timing pattern that could
   help re-identify a device.
3. **Make telemetry opt-IN** rather than opt-out.
4. **Add an age gate** before the attitudes module specifically, since that is
   the most sensitive part even though nothing from it is transmitted.
5. **Aggregate on a schedule** — keep per-module counts and distributions, drop
   the individual rows after they have been folded in.

**Option 1 alone removes most of the exposure and costs almost nothing**, because
the reason the data exists at all is to replace the provisional grade bands with
measured ones, and that needs distributions rather than people.

## 4b. COLLECTION WIDENED 2026-08-10 — accounts, and what changed

Capt. Pahil's instruction: *"ask student for free signup, record their result so that
we have data, we are not gonna share data with anyone but we will improve our version
from data."* Built the same day. This section exists because §5 below requires it: the
page copy, the FAQ and this document were all changed in the same commit.

**What is new.** A second table, `adapt_results` (SECURITY.md §3e), holding the results
of students who choose to sign in. It is keyed to `auth.users` by `user_id` — so unlike
everything described in §2a, **this data IS linked to a named person with an email
address.** That is the material change, and it is what a lawyer should be re-asked about.

**Signing up is asked for, not required.** Every module still runs signed-out, and a
student who never makes an account is in exactly the position described in §2a — an
anonymous device id and nothing else. Nothing is withheld from them.

**What a signed-in row holds:** the score (stanine, sten, band, one percentage) and the
*breakdown* of the score — accuracy per difficulty tier, per question family, per phase
of the multitasking run, per minute of the tracking run — plus the input device, the
duration, and the session seed. The breakdown is the point: it is what shows which
question generators are too hard and whether the difficulty ramp works, which is the
stated purpose.

**What is still refused, signed in or out, and enforced by test rather than by care:**
the questions, the student's answers, the tracking samples, and **anything at all from
the attitudes questionnaire beyond the bare fact that it was completed.** No attitude, no
tally, no profile. `results-core.test.mjs` scans a genuinely scored session for those
fields and fails if one appears; `results.ts` runs the same scan again immediately before
the insert and drops the row rather than send it.

**RLS is own-rows-only.** A student can read and write their own rows and there is no
policy under which one account could read another's. Unlike `adapt_attempts`, this table
does have a select policy — because the student's own dashboard reads it back.

**The questions for a lawyer that this changes:**

1. §3 question 1 (is a device id personal data?) is now **moot for signed-in students** —
   an account with an email plainly is. The question becomes what lawful basis covers it.
2. §3 question 2 becomes sharper, not softer: **a 17-year-old can now create an account**
   and have behaviour-derived scores stored against their identity. There is no age gate
   on signup today. If verifiable parental consent is required for under-18s, that is a
   signup-flow change, and it is the single most likely thing to need doing.
3. Retention is still unset, and now applies to identified data.
4. Deletion: `on delete cascade` means removing the auth user removes the results, but
   **there is no self-serve "delete my account" in the product.** If a data-erasure right
   applies, that is a gap.

**Nothing here is legal advice.** It is an inventory, kept current so the advice can be
about judgement instead of archaeology.

## 5. Standing rule for whoever works on this next

The page tells students what is collected. **If collection ever widens, the page
copy, the FAQ answer and this document change in the same commit.** Shipping a
promise and quietly outgrowing it would cost more than any data is worth — the
honesty is the asset, and on this site it is the one competitors do not have.

"""@Capt.GhostAviator — put the chapter link above the YouTube fold.

DELIBERATELY NOT THE SAME JOB AS plan.py, and that is the design.

plan.py rewrites @PankajPahil titles, descriptions and tags. None of that
transfers to this channel:

  TITLES ARE NOT TOUCHED. plan.py finds a topic by stripping known boilerplate
  from pipe-separated segments ("Ch.91 | Air Law & Regs | topic | ATPL & CPL |
  FREE"). This channel does not use that format at all ("DGCA Air Regulation -
  CH003 - Rules of Air", "Hindi- Air Regulations DGCA Exam (Air Law ) CH#001"),
  so the stripper would hand back the whole title as the "topic" and build
  nonsense. A title is a public claim about what a lecture teaches; it does not
  get rewritten by a script that cannot parse it.

  TAGS ARE PASSED THROUGH VERBATIM. videos.update(part="snippet") replaces the
  entire snippet, so omitting tags DELETES them. Tags are not readable for a
  channel this token does not own, which is one more reason the consent has to
  come before the write rather than after.

  THE DESCRIPTION IS ONLY PREPENDED TO. Everything already written is kept, byte
  for byte, under two new lines. Measured 2026-09-06: 0 of 51 mapped lectures on
  this channel carried ANY link to the site, and the median description is 986
  characters of real writing. The defect is a missing link, not bad prose, so
  the fix adds rather than replaces.

Order:
    python tools/yt/consent.py brand      # the Captain, once, in a browser
    python tools/yt/brand.py snapshot     # rollback FIRST, always
    python tools/yt/brand.py plan         # writes nothing; read the review file
    python tools/yt/brand.py apply        # dry run
    python tools/yt/brand.py apply --write

51 mapped videos x 50 units = 2,550 against the 10,000/day cap, so unlike the
other channel this finishes in a single day.
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
from _yt import client, run, all_uploads, assert_controls, CHANNELS, NL, QuotaExhausted  # noqa: E402

CH = "brand"
SNAP = HERE / "_snapshot-brand.json"
PLAN = HERE / "_plan-brand.json"
REVIEW = HERE / "_plan-brand-review.txt"
FLAGGED = HERE / "_plan-brand-flagged.txt"
DONE = HERE / "_applied-brand.json"
MAP_FILE = ROOT / "tools" / "_video-chapter-map.json"
NAMES_FILE = ROOT / "tools" / "forbidden-source-names.json"

EM = chr(0x2014)
BOOK = chr(0x1F4D6)
ALLOWED = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 -"

FOLD = 160          # YouTube collapses the description at roughly this
DESC_CAP = 5000     # YouTube hard limit
COST = 50
DAILY_UNITS = 10000


def forbidden_names():
    """Iron Rule 2, from the ONE definition shared with scrub-source-names.mjs."""
    names = json.loads(NAMES_FILE.read_text(encoding="utf-8"))["names"]
    for n in names:
        if not n or any(c not in ALLOWED for c in n):
            raise SystemExit("forbidden-source-names.json: bad entry " + repr(n))
    return names


def find_site_link(text):
    """Offset of the first ghostaviator link in `text`, or None."""
    i = text.find("ghostaviator.")
    if i < 0:
        return None
    s = text.rfind("http", 0, i)
    return s if s >= 0 else None


def cmd_snapshot():
    yt = client(CH)
    assert_controls(yt, CH)
    vids = all_uploads(yt, CH)
    snap = {
        # Only a snapshot taken through the authenticated API carries tags, and
        # tags are the thing an update silently destroys. cmd_plan marks a plan
        # built from anything else as simulated, and cmd_apply refuses to write
        # it. See the SIMULATION note in cmd_plan.
        "source": "youtube-api",
        "channel": {k: str(v) for k, v in CHANNELS[CH].items()},
        "videos": [
            {
                "id": v["id"],
                "title": v["snippet"]["title"],
                "description": v["snippet"]["description"],
                "tags": v["snippet"].get("tags", []),
                "categoryId": v["snippet"].get("categoryId"),
                "defaultLanguage": v["snippet"].get("defaultLanguage"),
                "privacyStatus": v["status"]["privacyStatus"],
                "views": int(v["statistics"].get("viewCount", 0)),
            }
            for v in vids
        ],
    }
    SNAP.write_text(json.dumps(snap, indent=2, ensure_ascii=False), encoding="utf-8")
    tagged = sum(1 for v in snap["videos"] if v["tags"])
    print(f"videos snapshotted : {len(snap['videos'])}")
    print(f"carrying tags      : {tagged}  (these MUST survive the update)")
    print(f"wrote {SNAP}")


def cmd_plan():
    if not SNAP.exists():
        raise SystemExit("No snapshot. Run: python tools/yt/brand.py snapshot")
    snap = json.loads(SNAP.read_text(encoding="utf-8"))
    cmap = json.loads(MAP_FILE.read_text(encoding="utf-8"))
    banned = forbidden_names()

    # SIMULATION. The planning logic can be exercised against a snapshot built
    # from public watch pages, which is how it was tested before the Captain had
    # given consent. But a public scrape cannot see tags, and an update that
    # sends an empty tag list DELETES the real ones. So a plan built from
    # anything other than the authenticated API is marked, and cmd_apply refuses
    # to write it. Testing must never be one flag away from data loss.
    simulated = snap.get("source") != "youtube-api"
    if simulated:
        print("!! SIMULATED SNAPSHOT (source=%r) - this plan CANNOT be applied"
              % snap.get("source"))

    plan, flagged, skipped = [], [], []
    for v in snap["videos"]:
        entry = cmap.get(v["id"])
        if not entry:
            skipped.append((v["id"], v["title"], "not mapped to a chapter"))
            continue
        p = entry["primary"]
        desc = v["description"] or ""
        hay = (desc + " " + v["title"]).lower()

        leak = next((n for n in banned if n.lower() in hay), None)
        if leak:
            i = hay.find(leak.lower())
            flagged.append({
                "id": v["id"], "title": v["title"],
                "reason": "IRON RULE 2 - names a source",
                "match": leak,
                "context": desc[max(0, i - 90):i + 90].replace(NL, " "),
            })
            continue

        off_now = find_site_link(desc)
        if off_now is not None and off_now < FOLD:
            skipped.append((v["id"], v["title"], "link already above the fold"))
            continue

        head = (f"{p['chapterTitle']} {EM} DGCA {p['subjectName']}{NL}"
                f"{BOOK} Free notes + practice questions: {p['url']}{NL}{NL}")
        new_desc = head + desc

        if len(new_desc) > DESC_CAP:
            flagged.append({"id": v["id"], "title": v["title"],
                            "reason": f"would exceed the {DESC_CAP}-char limit",
                            "match": str(len(new_desc)), "context": ""})
            continue
        off = find_site_link(new_desc)
        if off is None or off >= FOLD:
            flagged.append({"id": v["id"], "title": v["title"],
                            "reason": "link would still sit below the fold",
                            "match": str(off), "context": head.replace(NL, " / ")})
            continue

        plan.append({
            "id": v["id"], "views": v["views"], "chapter": p["url"],
            "title": v["title"],          # unchanged, passed through
            "tags": v["tags"],            # unchanged, passed through
            "categoryId": v.get("categoryId") or "27",
            "old_desc": desc, "new_desc": new_desc, "link_offset": off,
            "simulated": simulated,
        })

    PLAN.write_text(json.dumps(plan, indent=2, ensure_ascii=False), encoding="utf-8")

    lines = [
        f"PROPOSED DESCRIPTION CHANGES - {CHANNELS[CH]['handle']}",
        f"{len(plan)} to update, {len(flagged)} flagged, {len(skipped)} skipped",
        f"quota: {len(plan) * COST} units of {DAILY_UNITS} per day",
        "TITLES AND TAGS ARE NOT CHANGED BY THIS PASS.",
        "=" * 96, "",
    ]
    for p in plan:
        parts = p["new_desc"].split(NL)
        lines += [f"[{p['id']}]  {p['views']} views  ->  {p['chapter']}",
                  f"  TITLE (unchanged)  {p['title']}",
                  f"  ADDED ABOVE FOLD   {parts[0]}",
                  f"                     {parts[1]}",
                  f"  link at char       {p['link_offset']}", ""]
    if skipped:
        lines += ["", "SKIPPED", "-" * 96]
        lines += [f"  [{i}] {t}  - {why}" for i, t, why in skipped]
    REVIEW.write_text(NL.join(lines), encoding="utf-8")

    if flagged:
        fl = ["FLAGGED - NOTHING APPLIED TO THESE, THEY NEED THE CAPTAIN", "=" * 96, ""]
        for f in flagged:
            fl += [f"[{f['id']}]  {f['title']}",
                   f"  reason  : {f['reason']}",
                   f"  match   : {f['match']}",
                   f"  context : {f['context']}", ""]
        FLAGGED.write_text(NL.join(fl), encoding="utf-8")

    print(f"plan    : {len(plan)}")
    print(f"flagged : {len(flagged)}" + (f"  -> {FLAGGED}" if flagged else ""))
    print(f"skipped : {len(skipped)}")
    print(f"review  : {REVIEW}")


def cmd_apply(write):
    if not PLAN.exists():
        raise SystemExit("No plan. Run: python tools/yt/brand.py plan")
    plan = json.loads(PLAN.read_text(encoding="utf-8"))
    if any(p.get("simulated") for p in plan):
        raise SystemExit(
            "REFUSING: this plan was built from a simulated snapshot, which cannot see "
            "tags.\nApplying it would send an empty tag list and DELETE the real tags.\n"
            "Run: python tools/yt/consent.py brand, then brand.py snapshot, then plan.")
    done = set(json.loads(DONE.read_text(encoding="utf-8"))) if DONE.exists() else set()
    todo = [p for p in plan if p["id"] not in done]
    print(f"plan {len(plan)} | already applied {len(done)} | to do {len(todo)}")
    if not write:
        print("\nDRY RUN - nothing will be written. Re-run with --write.\n")
        for p in todo[:4]:
            print(f"  [{p['id']}] {p['title'][:66]}")
            print(f"        + {p['new_desc'].split(NL)[1][:88]}")
        print(f"  ... and {max(0, len(todo) - 4)} more")
        print(f"quota needed: {len(todo) * COST} units")
        return

    yt = client(CH)
    assert_controls(yt, CH)
    ok = fail = 0
    for i, p in enumerate(todo, 1):
        body = {"id": p["id"], "snippet": {
            "title": p["title"],
            "description": p["new_desc"],
            "tags": p["tags"],          # omitting this DELETES his tags
            "categoryId": p["categoryId"],
        }}
        try:
            run(yt.videos().update(part="snippet", body=body))
            done.add(p["id"])
            ok += 1
            if ok % 10 == 0:
                DONE.write_text(json.dumps(sorted(done), indent=2), encoding="utf-8")
                print(f"  {i}/{len(todo)}  applied {ok}")
        except QuotaExhausted:
            DONE.write_text(json.dumps(sorted(done), indent=2), encoding="utf-8")
            print(f"\nDAILY QUOTA EXHAUSTED after {ok}. Re-run after 12:30 IST; it resumes.")
            break
        except Exception as e:  # noqa: BLE001 - one bad video must not stop the run
            fail += 1
            print(f"  FAILED [{p['id']}] {e}")   # whole error, never truncated
    DONE.write_text(json.dumps(sorted(done), indent=2), encoding="utf-8")
    print(f"\napplied {ok}, failed {fail}, total done {len(done)}/{len(plan)}")


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "snapshot":
        cmd_snapshot()
    elif cmd == "plan":
        cmd_plan()
    elif cmd == "apply":
        cmd_apply("--write" in sys.argv)
    else:
        raise SystemExit("usage: python tools/yt/brand.py [snapshot|plan|apply [--write]]")


if __name__ == "__main__":
    main()

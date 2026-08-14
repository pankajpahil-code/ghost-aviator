"""Apply _plan.json to YouTube. Resumable, idempotent, and quota-aware.

videos.update costs 50 units against a 10,000/day quota, so a full pass over
this channel cannot finish in one day. Every success is appended to _applied.json
immediately, so a quota stop is a checkpoint rather than a half-updated channel:
re-running tomorrow picks up exactly where it left off.

  python tools/yt/apply.py            # dry run, prints what it would do
  python tools/yt/apply.py --write    # actually writes
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))
from _yt import client, run, QuotaExhausted  # noqa: E402

PLAN = HERE / "_plan.json"
DONE = HERE / "_applied.json"

DAILY_UNITS = 10_000
COST = 50


def load_done():
    return set(json.loads(DONE.read_text(encoding="utf-8"))) if DONE.exists() else set()


def save_done(done):
    DONE.write_text(json.dumps(sorted(done), indent=2), encoding="utf-8")


def main():
    write = "--write" in sys.argv
    plan = json.loads(PLAN.read_text(encoding="utf-8"))
    done = load_done()
    todo = [p for p in plan if p["id"] not in done]

    print(f"plan {len(plan)} | already applied {len(done)} | to do {len(todo)}")
    if not write:
        print("\nDRY RUN — nothing will be written. Re-run with --write.\n")
        for p in todo[:5]:
            print(f"  [{p['id']}] {p['old_title']}\n"
                  f"            -> {p['new_title']}")
        print(f"  ... and {max(0, len(todo) - 5)} more")
        print(f"\nquota needed: {len(todo) * COST} units "
              f"(cap {DAILY_UNITS}/day -> {-(-len(todo) * COST // DAILY_UNITS)} day(s))")
        return

    yt = client()
    ok = fail = 0
    for i, p in enumerate(todo, 1):
        body = {
            "id": p["id"],
            "snippet": {
                "title": p["new_title"],
                "description": p["new_desc"],
                "tags": p["new_tags"],
                "categoryId": p["categoryId"],
            },
        }
        try:
            run(yt.videos().update(part="snippet", body=body))
            done.add(p["id"])
            ok += 1
            if ok % 10 == 0:
                save_done(done)
                print(f"  {i}/{len(todo)}  applied {ok}")
        except QuotaExhausted:
            save_done(done)
            print(f"\nDAILY QUOTA EXHAUSTED after {ok} updates.")
            print(f"{len(todo) - ok} remaining. Re-run this same command after "
                  f"midnight US/Pacific — it resumes from _applied.json.")
            break
        except Exception as e:  # noqa: BLE001 - one bad video must not stop the run
            fail += 1
            # Log the WHOLE error. This was [:120], which cut every message off
            # at "...returned "The requ" — so 144 logged failures said only
            # "HttpError 400" and the actual reason (an over-long tags field)
            # had to be reconstructed from the plan data instead of just read.
            # A truncated error log is worse than none: it looks like evidence.
            print(f"  FAILED [{p['id']}] {e}")

    save_done(done)
    print(f"\napplied {ok}, failed {fail}, total done {len(done)}/{len(plan)}")


if __name__ == "__main__":
    main()

"""Tests for consent.py, written after it wasted two of the Captain's clicks.

    python tools/yt/test-consent.py        # exits 0 on pass, 1 on failure

Both defects it now covers shipped on 2026-09-06, one after the other, and both
were only discoverable by RUNNING the function:

  1. The verify call raised 403 quotaExceeded (the day's quota had gone on an
     unrelated pass) and the exception propagated, so a completed browser
     consent was discarded. He clicked, and lost it.
  2. Fixing that by editing the block dropped the `yt = build(...)` line, so the
     next attempt died on `NameError: name 'yt' is not defined`. He clicked
     again, and lost it again.

Neither is a syntax error. `py_compile` passes on both. The only thing that
catches them is executing the path with the network stubbed out, which is what
this file does. No Google call is made and no real token is touched: CHANNELS is
pointed at a temp file for the duration of each case.
"""
import json
import pickle
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))

import consent  # noqa: E402
from googleapiclient.errors import HttpError  # noqa: E402

BRAND_ID = consent.CHANNELS["brand"]["id"]
WRONG_ID = "UCKTxHMHDfh2jBb7rrdTCMkg"   # the personal channel


class FakeCreds:
    """Module-level so pickle can serialise it, like the real credentials."""

    def __init__(self, tag="fake"):
        self.tag = tag


class FakeResp:
    def __init__(self, status):
        self.status = status
        self.reason = "quotaExceeded"


def quota_error():
    return HttpError(
        FakeResp(403),
        json.dumps({"error": {"errors": [{"reason": "quotaExceeded"}],
                              "message": "quota exceeded"}}).encode(),
        uri="https://youtube.googleapis.com/youtube/v3/channels",
    )


def fake_build(channel_id=None, raises=None):
    """Stand in for googleapiclient build(). Never touches the network."""
    class Req:
        def execute(self):
            if raises is not None:
                raise raises
            return {"items": [{"id": channel_id,
                               "snippet": {"title": "stub channel"}}]}

    class Channels:
        def list(self, **_kw):
            return Req()

    class YT:
        def channels(self):
            return Channels()

    return lambda *a, **k: YT()


def fake_flow():
    class Flow:
        def run_local_server(self, **_kw):
            return FakeCreds()

    class Installed:
        @staticmethod
        def from_client_secrets_file(*_a, **_k):
            return Flow()

    return Installed


def run_case(name, *, returns=None, raises=None, pre_existing=False):
    """Run consent.main() for 'brand' with the network stubbed. Returns a dict."""
    with tempfile.TemporaryDirectory() as d:
        tok = Path(d) / "token-test.pickle"
        if pre_existing:
            tok.write_bytes(pickle.dumps(FakeCreds("original")))

        real_token = consent.CHANNELS["brand"]["token"]
        real_flow, real_build, real_argv = (
            consent.InstalledAppFlow, consent.build, sys.argv)
        consent.CHANNELS["brand"]["token"] = tok
        consent.InstalledAppFlow = fake_flow()
        consent.build = fake_build(returns, raises)
        sys.argv = ["consent.py", "brand"]

        code = 0
        try:
            consent.main()
        except SystemExit as e:
            code = e.code if isinstance(e.code, int) else 1
        finally:
            consent.CHANNELS["brand"]["token"] = real_token
            consent.InstalledAppFlow, consent.build, sys.argv = (
                real_flow, real_build, real_argv)

        saved = tok.exists()
        tag = pickle.loads(tok.read_bytes()).tag if saved else None
        return {"name": name, "exit": code, "saved": saved, "tag": tag}


def main():
    checks = []

    r = run_case("right channel -> saved", returns=BRAND_ID)
    checks.append((r["saved"] is True and r["exit"] == 0, r,
                   "must save the token and exit 0"))

    r = run_case("wrong channel -> refused", returns=WRONG_ID)
    checks.append((r["saved"] is False and r["exit"] == 1, r,
                   "must NOT save, and must exit 1"))

    # THE BUG THAT COST HIM CLICK ONE.
    r = run_case("verify unavailable (quota) -> saved anyway", raises=quota_error())
    checks.append((r["saved"] is True and r["exit"] == 0, r,
                   "a failed verification must NOT discard a good consent"))

    # Not an overwrite path: an existing token is left exactly as it was.
    r = run_case("existing token -> untouched", returns=BRAND_ID, pre_existing=True)
    checks.append((r["saved"] is True and r["tag"] == "original" and r["exit"] == 0, r,
                   "must not overwrite an existing token"))

    print()
    bad = 0
    for ok, r, why in checks:
        print(("  PASS  " if ok else "  FAIL  ") + r["name"])
        if not ok:
            bad += 1
            print(f"          expected: {why}")
            print(f"          got     : exit={r['exit']} saved={r['saved']} tag={r['tag']}")
    print()
    if bad:
        print(f"{bad} of {len(checks)} FAILED")
        return 1
    print(f"all {len(checks)} passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())

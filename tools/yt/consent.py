"""One-time OAuth consent for a channel. ONLY the Captain can run this.

A YouTube token is bound to the single channel chosen in Google's chooser at
consent time - verified 2026-09-06 by calling channels.list(mine=True) on the
existing token, which returned exactly one channel. So @Capt.GhostAviator
cannot be reached by borrowing the @PankajPahil token, and no amount of code
gets around that: it needs a Google login, which is his and only his.

    python tools/yt/consent.py brand

A browser opens. Sign in as the owner, and IN THE CHANNEL CHOOSER PICK
"Capt. Pankaj Pahil" (the @Capt.GhostAviator brand channel), not the personal
one. If the wrong channel is picked, this script REFUSES TO SAVE the token and
says so, rather than leaving a credential that would rewrite the wrong videos.

The token is written to the _secrets folder outside any delivery directory
(house rule: no credentials near finished output) and is never printed.
"""
import pickle
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _yt import CHANNELS, CLIENT_SECRETS, SCOPES, NL  # noqa: E402

from google_auth_oauthlib.flow import InstalledAppFlow  # noqa: E402
from googleapiclient.discovery import build  # noqa: E402


def main():
    ch = sys.argv[1] if len(sys.argv) > 1 else ""
    if ch not in CHANNELS:
        raise SystemExit("usage: python tools/yt/consent.py [" + "|".join(CHANNELS) + "]")
    meta = CHANNELS[ch]
    if meta["token"].exists():
        print("A token already exists for " + meta["handle"] + ".")
        print("Delete it first if you really mean to re-consent: " + str(meta["token"]))
        return
    if not CLIENT_SECRETS.exists():
        raise SystemExit("client_secrets.json not found at " + str(CLIENT_SECRETS))

    print(NL.join([
        "",
        "  A browser window is about to open.",
        "  Sign in, then IN THE CHANNEL CHOOSER pick:  " + meta["handle"],
        "  (channel id " + meta["id"] + ")",
        "",
        "  If you pick the wrong one nothing is saved and you can just run it again.",
        "",
    ]))

    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRETS), SCOPES)
    creds = flow.run_local_server(port=0, prompt="consent")

    yt = build("youtube", "v3", credentials=creds)
    items = yt.channels().list(part="id,snippet", mine=True).execute().get("items", [])
    got = [(c["id"], c["snippet"]["title"]) for c in items]

    if meta["id"] not in [g[0] for g in got]:
        print(NL.join([
            "",
            "  NOT SAVED. You picked: " + (str(got) if got else "(no channel)"),
            "  This consent is for:   " + meta["id"] + "  " + meta["handle"],
            "",
            "  Run it again and choose the other channel in the chooser.",
        ]))
        raise SystemExit(1)

    meta["token"].parent.mkdir(parents=True, exist_ok=True)
    with open(meta["token"], "wb") as f:
        pickle.dump(creds, f)
    print(NL.join([
        "",
        "  Consent saved for " + meta["handle"] + ".",
        "  Next:  python tools/yt/brand.py snapshot",
    ]))


if __name__ == "__main__":
    main()

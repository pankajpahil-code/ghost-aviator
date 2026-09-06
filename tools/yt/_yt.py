"""Shared YouTube client for the channel-metadata tools.

Reads the OAuth token the dubbing pipeline already established. Scope on that
token is https://www.googleapis.com/auth/youtube (full read/write) plus upload,
so no new consent is needed for @PankajPahil. The other channel needs its own.
"""
import pickle
import time
from pathlib import Path

from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SECRETS = Path("D:/pk/ATPL Training oxford CBT/_secrets")
CLIENT_SECRETS = SECRETS / "client_secrets.json"
SCOPES = ["https://www.googleapis.com/auth/youtube"]

# A token is bound to the ONE channel selected at consent time. Verified
# 2026-09-06 by calling channels.list(mine=True) on the existing token: it
# returned exactly one channel, "Pankaj Pahil". So the second channel cannot be
# reached by borrowing this token - it needs its own one-time consent, which
# only the Captain can give (Google login + channel picker). See consent.py.
CHANNELS = {
    "pankaj": {
        "id": "UCKTxHMHDfh2jBb7rrdTCMkg",
        "handle": "@PankajPahil",
        "token": SECRETS / "token.pickle",
    },
    "brand": {
        "id": "UCliKc6qVcGs5tnI03yNg6Lg",
        "handle": "@Capt.GhostAviator",
        "token": SECRETS / "token-ghostaviator.pickle",
    },
}

# Back-compat for the scripts written before there were two channels.
TOKEN = CHANNELS["pankaj"]["token"]
CHANNEL_ID = CHANNELS["pankaj"]["id"]


NL = chr(10)


class QuotaExhausted(RuntimeError):
    """The DAILY quota is gone. Resets at midnight US/Pacific."""


def run(request, tries=5):
    """Execute an API request, retrying the burst limit but not the daily cap.

    YouTube reports both a short-window burst limit and the 10,000-unit daily
    cap with reason `quotaExceeded`, so the two are indistinguishable from the
    reason alone. Backing off and retrying tells them apart: the burst limit
    clears in seconds, the daily cap does not. Anything still failing after the
    last retry is treated as the daily cap, which callers must checkpoint on
    rather than plough through.
    """
    delay = 4
    for attempt in range(tries):
        try:
            return request.execute()
        except HttpError as e:
            reason = str(e)
            transient = ("quotaExceeded" in reason or "rateLimitExceeded" in reason
                         or "backendError" in reason or "SERVICE_UNAVAILABLE" in reason)
            if not transient or attempt == tries - 1:
                if "quotaExceeded" in reason:
                    raise QuotaExhausted(
                        "daily quota exhausted — resets at midnight US/Pacific") from e
                raise
            time.sleep(delay)
            delay *= 2


def client(channel="pankaj"):
    tok = CHANNELS[channel]["token"]
    if not tok.exists():
        h = CHANNELS[channel]['handle']
        raise SystemExit(NL.join([
            f"No token for {h} at {tok}.",
            "It needs a one-time consent only the Captain can give:",
            f"    python tools/yt/consent.py {channel}",
        ]))
    with open(tok, "rb") as f:
        creds = pickle.load(f)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open(tok, "wb") as f:
            pickle.dump(creds, f)
    return build("youtube", "v3", credentials=creds)


def assert_controls(yt, channel):
    """Refuse to write unless the token really controls the channel we think.

    A token silently pointing at the wrong channel would rewrite the wrong
    videos, and there is no undo on YouTube beyond the snapshot. This costs
    1 quota unit and removes the whole class of mistake.
    """
    want = CHANNELS[channel]["id"]
    got = [c["id"] for c in run(yt.channels().list(part="id", mine=True)).get("items", [])]
    if want not in got:
        raise SystemExit(NL.join([
            f"REFUSING: this token controls {got or 'nothing'}, not",
            f"{want} ({CHANNELS[channel]['handle']}).",
            "Re-run consent.py and pick the right channel in the Google chooser.",
        ]))
    return True


def all_uploads(yt, channel="pankaj"):
    """Every video on the channel, with the fields we intend to rewrite."""
    ch = run(yt.channels().list(part="contentDetails", id=CHANNELS[channel]["id"]))
    uploads = ch["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]

    ids, token = [], None
    while True:
        r = run(yt.playlistItems().list(
            part="contentDetails", playlistId=uploads, maxResults=50, pageToken=token))
        ids += [i["contentDetails"]["videoId"] for i in r["items"]]
        token = r.get("nextPageToken")
        if not token:
            break

    out = []
    for i in range(0, len(ids), 50):
        r = run(yt.videos().list(
            part="snippet,status,statistics", id=",".join(ids[i:i + 50])))
        out += r["items"]
    return out

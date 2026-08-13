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

SECRETS = Path(r"D:\pk\ATPL Training oxford CBT\_secrets")
TOKEN = SECRETS / "token.pickle"

# @PankajPahil — the channel this token controls.
CHANNEL_ID = "UCKTxHMHDfh2jBb7rrdTCMkg"


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


def client():
    with open(TOKEN, "rb") as f:
        creds = pickle.load(f)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open(TOKEN, "wb") as f:
            pickle.dump(creds, f)
    return build("youtube", "v3", credentials=creds)


def all_uploads(yt):
    """Every video on the channel, with the fields we intend to rewrite."""
    ch = run(yt.channels().list(part="contentDetails", id=CHANNEL_ID))
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

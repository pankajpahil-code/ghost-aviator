"""Snapshot the channel BEFORE any write, so every change is reversible.

Nothing in this directory writes to YouTube until a snapshot exists on disk.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _yt import client, all_uploads, run, CHANNEL_ID  # noqa: E402

OUT = Path(__file__).parent / "_snapshot.json"


def main():
    yt = client()
    vids = all_uploads(yt)

    ch = run(yt.channels().list(part="snippet,brandingSettings,statistics",
                                id=CHANNEL_ID))["items"][0]

    playlists, token = [], None
    while True:
        r = run(yt.playlists().list(part="snippet,contentDetails", channelId=CHANNEL_ID,
                                    maxResults=50, pageToken=token))
        playlists += r["items"]
        token = r.get("nextPageToken")
        if not token:
            break

    snap = {
        "channel": {
            "title": ch["snippet"]["title"],
            "description": ch["snippet"].get("description", ""),
            "keywords": ch.get("brandingSettings", {}).get("channel", {}).get("keywords", ""),
            "statistics": ch["statistics"],
        },
        "playlists": [
            {"id": p["id"], "title": p["snippet"]["title"],
             "count": p["contentDetails"]["itemCount"]}
            for p in playlists
        ],
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
    OUT.write_text(json.dumps(snap, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"channel      : {snap['channel']['title']}")
    print(f"description  : {len(snap['channel']['description'])} chars")
    print(f"keywords     : {snap['channel']['keywords'] or '(none)'}")
    print(f"videos       : {len(snap['videos'])}")
    print(f"playlists    : {len(snap['playlists'])}")
    for p in snap["playlists"]:
        print(f"   {p['id']}  {p['count']:>3} items  {p['title']}")
    ph = [v for v in snap["videos"] if "[PLAYLIST LINK]" in v["description"]]
    print(f"placeholders : {len(ph)} videos carry [PLAYLIST LINK]")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()

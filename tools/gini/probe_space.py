"""
Probe a Hugging Face Space's API so we can call it programmatically instead of
clicking through a Gradio UI in a browser.

    python tools/gini/probe_space.py <space_id>

Prints the callable endpoints and their parameters.
"""

import sys
import traceback

SPACES = [
    "tencent/Hunyuan3D-2",
    "JeffreyXiang/TRELLIS",
    "stabilityai/stable-fast-3d",
]


def probe(space):
    print("=" * 70)
    print(f"SPACE: {space}")
    print("=" * 70)
    try:
        from gradio_client import Client
        c = Client(space, verbose=False)
        info = c.view_api(return_format="dict", print_info=False)
        named = info.get("named_endpoints", {})
        if not named:
            print("  (no named endpoints)")
        for name, spec in named.items():
            params = spec.get("parameters", [])
            rets = spec.get("returns", [])
            print(f"\n  ENDPOINT {name}")
            for p in params:
                print(f"    in : {p.get('parameter_name') or p.get('label')} "
                      f"({p.get('python_type', {}).get('type')}) "
                      f"default={p.get('parameter_default')}")
            for r in rets:
                print(f"    out: {r.get('label')} ({r.get('python_type', {}).get('type')})")
        return True
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {e}")
        traceback.print_exc(limit=2)
        return False


if __name__ == "__main__":
    targets = sys.argv[1:] or SPACES
    for s in targets:
        probe(s)
        print()

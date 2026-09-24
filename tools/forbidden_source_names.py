"""Iron Rule 2 - the ONE compiled form of tools/forbidden-source-names.json, for Python.

Twin of tools/forbidden-source-names.mjs. Both build the SAME pattern string by the
same algorithm; tools/audit/forbidden-names-selftest.mjs fails if they ever differ.
Read that file's header for how a name is matched. Do not compile the names anywhere
else.

Use from a script outside this folder without touching sys.path:

    import importlib.util
    spec = importlib.util.spec_from_file_location(
        'forbidden_source_names', r'D:/pk/ghost-aviator/tools/forbidden_source_names.py')
    fsn = importlib.util.module_from_spec(spec); spec.loader.exec_module(fsn)
    fsn.FORBIDDEN_RX.search(text)
"""
import json
import re
from pathlib import Path

JSON_PATH = Path(__file__).resolve().with_name('forbidden-source-names.json')

FORBIDDEN_DEF = json.loads(JSON_PATH.read_text(encoding='utf-8'))
FORBIDDEN_NAMES = FORBIDDEN_DEF['names']

for _n in FORBIDDEN_NAMES:
    if not isinstance(_n, str) or not re.fullmatch(r'[A-Za-z0-9]+(?:[ -][A-Za-z0-9]+)*', _n):
        raise ValueError('forbidden-source-names.json: %r is not plain text' % (_n,))

SEP = r'[\s.\-]*'


def _token(t):
    if re.fullmatch(r'[A-Z]{2,3}', t):
        return r'[\s.]*'.join(t) + r'\.?'
    return t


def name_pattern(n):
    """The pattern for one name, as a regex source string (no flags)."""
    return r'\b' + SEP.join(_token(t) for t in re.split(r'[ -]+', n))


FORBIDDEN_PATTERN = '(?:' + '|'.join(name_pattern(n) for n in FORBIDDEN_NAMES) + ')'
FORBIDDEN_RX = re.compile(FORBIDDEN_PATTERN, re.I)


def find_forbidden(text):
    """First forbidden name in `text` as it was written, or None."""
    m = FORBIDDEN_RX.search(text or '')
    return m.group(0) if m else None


if __name__ == '__main__':
    # Used by the parity self-test: print the pattern and each probe's verdict.
    import sys
    sys.stdout.reconfigure(encoding='utf-8')   # Windows console default is cp1252
    probes = FORBIDDEN_DEF.get('probes', {})
    out = {'pattern': FORBIDDEN_PATTERN,
           'verdicts': {s: bool(FORBIDDEN_RX.search(s))
                        for s in probes.get('must_match', []) + probes.get('must_not_match', [])
                        + probes.get('known_gaps', [])}}
    sys.stdout.write(json.dumps(out, ensure_ascii=False))

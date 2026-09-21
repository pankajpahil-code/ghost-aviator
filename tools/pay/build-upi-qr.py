"""
Build the UPI payment QR codes shown on /live-classes.

    python tools/pay/build-upi-qr.py

Each QR is generated from the payee fields DECODED from the Captain's own
PhonePe QR (2026-09-21):

    upi://pay?pa=9643961464@axl&pn=PRISHA%20&mc=0000&mode=02&purpose=00

only adding the amount (am), currency (cu) and a note (tn). Every generated
image is then decoded back and the script FAILS unless the payee address and
amount read back exactly. A QR that pays the wrong account is the worst
possible defect on a payment page, so it is proved, not assumed.

Prices must match lib/live-classes.ts. If a price changes there, change it
here and re-run.
"""

import os
import sys
from urllib.parse import quote, urlparse, parse_qs

import qrcode
from qrcode.constants import ERROR_CORRECT_M

VPA = "9643961464@axl"
PAYEE = "PRISHA"
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "pay")

PLANS = [
    ("upi-7999.png", "7999", "DGCA live class - one subject"),
    ("upi-14999.png", "14999", "DGCA live class - Navigation combo"),
]


def uri(amount, note):
    return (
        f"upi://pay?pa={VPA}&pn={quote(PAYEE)}&mc=0000&mode=02&purpose=00"
        f"&am={amount}.00&cu=INR&tn={quote(note)}"
    )


def decode(path):
    import cv2  # opencv-python-headless
    img = cv2.imread(path)
    data, _, _ = cv2.QRCodeDetector().detectAndDecode(img)
    return data


def main():
    os.makedirs(OUT, exist_ok=True)
    failures = 0
    for fname, amount, note in PLANS:
        payload = uri(amount, note)
        qr = qrcode.QRCode(error_correction=ERROR_CORRECT_M, box_size=10, border=4)
        qr.add_data(payload)
        qr.make(fit=True)
        path = os.path.join(OUT, fname)
        qr.make_image(fill_color="black", back_color="white").save(path)

        got = decode(path)
        q = parse_qs(urlparse(got).query) if got else {}
        pa = q.get("pa", [""])[0]
        am = q.get("am", [""])[0]
        ok = got == payload and pa == VPA and am == f"{amount}.00"
        failures += 0 if ok else 1
        print(f"{'OK  ' if ok else 'FAIL'} {fname:14s} pa={pa} am={am}")
        if not ok:
            print(f"     expected: {payload}\n     decoded : {got}")

    print("ALL QR CODES DECODE TO THE RIGHT ACCOUNT" if failures == 0 else f"{failures} FAILED")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())

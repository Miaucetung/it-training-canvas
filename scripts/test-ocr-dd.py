"""Test spatial image assignment and OCR for drag-drop questions."""
import fitz
import json
import sys
from PIL import Image
import pytesseract
import io

sys.stdout.reconfigure(encoding="utf-8")
doc = fitz.open(r"C:\Users\mmuja\llmWiki\ClaudeCodeWiki\raw\00 - FragenBeantwortetKomplett200_301.pdf")

# Test page 48 (Q0133 + Q0134)
page = doc[47]
print("=== Page 48 (Q0133 + Q0134) ===")
for img_info in page.get_images(full=True):
    xref = img_info[0]
    # get image position on page
    try:
        rects = page.get_image_rects(xref)
        print(f"xref={xref} name={img_info[7]} w={img_info[2]} h={img_info[3]} rects={rects}")
    except Exception as e:
        print(f"xref={xref} error: {e}")

print()

# Test page 3 (Q0005) - 2 images  
page5 = doc[2]
print("=== Page 3 (Q0005) ===")
for img_info in page5.get_images(full=True):
    xref = img_info[0]
    try:
        rects = page5.get_image_rects(xref)
        print(f"xref={xref} w={img_info[2]} h={img_info[3]} rects={rects}")
    except Exception as e:
        print(f"xref={xref} error: {e}")

print()

# Test OCR on Q0005-1.png (question state)
print("=== OCR Test on Q0005-1.png ===")
img = Image.open(r"notes/ccna-exam/images/Q0005-1.png")
w, h = img.size
print(f"Image size: {w}x{h}")
mid_x = w // 2

# OCR left half
left_img = img.crop((0, 0, mid_x, h))
left_text = pytesseract.image_to_string(left_img, config="--psm 6").strip()
print("LEFT (drag items):")
for line in left_text.split("\n"):
    if line.strip():
        print(f"  {repr(line.strip())}")

print()

# OCR right half
right_img = img.crop((mid_x, 0, w, h))
right_text = pytesseract.image_to_string(right_img, config="--psm 6").strip()
print("RIGHT (drop targets):")
for line in right_text.split("\n"):
    if line.strip():
        print(f"  {repr(line.strip())}")

print()

# OCR answer image Q0005-2.png right half
print("=== OCR Test on Q0005-2.png (answer) ===")
img2 = Image.open(r"notes/ccna-exam/images/Q0005-2.png")
w2, h2 = img2.size
mid_x2 = w2 // 2
right2 = img2.crop((mid_x2, 0, w2, h2))
right2_text = pytesseract.image_to_string(right2, config="--psm 6").strip()
print("RIGHT (answer placement):")
for line in right2_text.split("\n"):
    if line.strip():
        print(f"  {repr(line.strip())}")

#!/usr/bin/env python3
"""Generate IG-ready 1080x1350 (4:5) promo cards for Anthony's Pasta Night."""
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "IG-PACK", "cards")
os.makedirs(OUT, exist_ok=True)

GREEN = (30, 86, 49)
GREEN2 = (46, 125, 70)
CREAM = (253, 246, 227)
GOLD = (212, 160, 23)
RED = (192, 57, 43)
INK = (28, 28, 28)
WHITE = (255, 255, 255)
W, H = 1080, 1350

F_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
F_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def font(sz, bold=True):
    return ImageFont.truetype(F_BOLD if bold else F_REG, sz)

def center_text(draw, y, text, fnt, fill, x0=0, x1=W):
    tw = draw.textlength(text, font=fnt)
    draw.text(((x0 + x1 - tw) / 2, y), text, font=fnt, fill=fill)

def photo_card(src, top_text, mid_text, bottom_text, fname, overlay_alpha=150):
    """Photo background + dark overlay + gold/white text bands."""
    im = Image.open(src).convert("RGB")
    # cover-crop to 4:5
    scale = max(W / im.width, H / im.height)
    im = im.resize((int(im.width * scale) + 1, int(im.height * scale) + 1), Image.LANCZOS)
    im = im.crop(((im.width - W) // 2, (im.height - H) // 2, (im.width - W) // 2 + W, (im.height - H) // 2 + H))
    overlay = Image.new("RGB", (W, H), (10, 20, 14))
    im = Image.blend(im, overlay, overlay_alpha / 255)
    d = ImageDraw.Draw(im)
    # top brand band
    d.rectangle([0, 0, W, 210], fill=GREEN)
    center_text(d, 40, "ANTHONY'S SUPERMARKET", font(58), GOLD)
    center_text(d, 115, "RUMMO  ·  PASTA NIGHT  ·  NOCHE DE PASTA", font(34), WHITE)
    d.line([60, 198, W - 60, 198], fill=GOLD, width=4)
    # mid headline
    center_text(d, 560, top_text, font(110), GOLD)
    center_text(d, 700, mid_text, font(64), WHITE)
    # bottom
    d.rounded_rectangle([90, 1030, W - 90, 1240], outline=GOLD, width=6, radius=28)
    center_text(d, 1080, bottom_text, font(58), WHITE)
    im.save(fname, quality=92)
    print("saved", fname)

def solid_card(bg, fg, lines, fname, accent=GOLD, title=None):
    im = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 210], fill=GREEN)
    center_text(d, 40, "ANTHONY'S SUPERMARKET", font(58), GOLD)
    center_text(d, 115, "PASTA NIGHT  ·  NOCHE DE PASTA", font(34), WHITE)
    d.line([60, 198, W - 60, 198], fill=accent, width=4)
    if title:
        center_text(d, 320, title, font(88), fg)
    y = 480
    for (txt, sz, bold) in lines:
        fnt = font(sz, bold)
        center_text(d, y, txt, fnt, fg)
        y += int(sz * 1.45)
    d.rounded_rectangle([90, H - 320, W - 90, H - 110], outline=accent, width=6, radius=28)
    center_text(d, H - 250, "WHILE SUPPLIES LAST", font(56), accent)
    im.save(fname, quality=92)
    print("saved", fname)

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "products")

# Card 1 — hero (aisle photo)
photo_card(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "aisle-pasta-sauces.jpg"),
    "ANY 2 FOR $4", "MIX & MATCH ALL SHAPES", "WHILE SUPPLIES LAST",
    os.path.join(OUT, "01-hero-any2for4.jpg"), overlay_alpha=120)

# Card 2 — shapes lineup (solid, Rummo cream)
solid_card(
    CREAM, INK,
    [("Penne Rigate No 66", 46, True), ("Mezzi Rigatoni No 51", 46, True),
     ("Squared Spaghetti No 221", 46, True), ("Farfalle No 85", 46, True),
     ("Egg Fettuccine No 94", 46, True), ("Egg Pappardelle No 101", 46, True),
     ("Lasagne No 83", 46, True)],
    os.path.join(OUT, "02-shapes-lineup.jpg"),
    title="MIX & MATCH ANY 2")

# Card 3 — Sunday sauce (photo: fettuccine w/ $2.79 tag visible is fine; use rigatoni shot)
photo_card(
    os.path.join(SRC, "rummo-mezzi-rigatoni-51.jpg"),
    "SUNDAY GRAVY NIGHT", "Hunt's + Victoria + Goya + Rummo", "SAVE ~28% on pasta",
    os.path.join(OUT, "03-sunday-gravy.jpg"), overlay_alpha=130)

# Card 4 — egg pasta feature (photo)
photo_card(
    os.path.join(SRC, "rummo-egg-fettuccine-94.jpg"),
    "EGG PASTA, 3 MIN", "Free-range Italian eggs", "COOKS IN 3 MINUTES",
    os.path.join(OUT, "04-egg-pasta.jpg"), overlay_alpha=130)

# Card 5 — FOMO closer (solid green)
solid_card(
    GREEN, WHITE,
    [("", 20, False), ("WHEN IT'S GONE", 72, True), ("IT'S GONE.", 72, True),
     ("", 30, False), ("Grab 2 before they fly off", 46, False),
     ("the shelf!", 46, False)],
    os.path.join(OUT, "05-fomo-last-call.jpg"),
    title="2 FOR $4", accent=GOLD)

# Card 6 — lasagne (photo)
photo_card(
    os.path.join(SRC, "rummo-lasagne-83.jpg"),
    "LASAGNE NIGHT", "Oven-ready or classic", "NON-GMO verified",
    os.path.join(OUT, "06-lasagne.jpg"), overlay_alpha=130)

print("ALL CARDS DONE")

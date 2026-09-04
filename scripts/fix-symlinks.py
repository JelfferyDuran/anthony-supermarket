import os

INVOICES = r"C:\Users\Jayto\anthony-supermarket\invoices"
DRIVE = r"G:\My Drive\Anthony's Supermarket"
LINKS = {
    "inbox-ocr": os.path.join(DRIVE, "01-Invoices & Pricing", "inbox-ocr"),
    "pricing": os.path.join(DRIVE, "01-Invoices & Pricing", "pricing"),
}

for name, target in LINKS.items():
    link = os.path.join(INVOICES, name)
    if os.path.islink(link):
        os.remove(link)
        print(f"removed old {name} link")
    os.symlink(target, link, target_is_directory=True)
    ok = os.path.isdir(link)
    print(f"{name} -> {target}  [works: {ok}]")
    assert ok, f"broken symlink: {link}"
print("ALL LINKS OK")

import zipfile, os

base = r"C:\Users\Jayto\anthony-supermarket"
out = os.path.join(base, "ASTRA_HANDOFF_2026-09-05.zip")

files = [
    "docs/ASTRA_PROMPT.md",
    "docs/ASTRA_UPGRADE_PLAN.md",
    "docs/checkpoints/checkpoint-01.md",
    "docs/checkpoints/checkpoint-02.md",
    "docs/checkpoints/LOCAL_FIXES.patch",
    "docs/agent-context/CURRENT_STATE.md",
]

with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for rel in files:
        p = os.path.join(base, rel)
        if not os.path.exists(p):
            print(f"MISSING: {rel}")
            continue
        z.write(p, rel)
        print(f"added: {rel} ({os.path.getsize(p)} bytes)")

print("ZIP:", out, os.path.getsize(out), "bytes")
with zipfile.ZipFile(out) as z:
    print("CONTENTS:", len(z.namelist()), "files")
    for n in z.namelist():
        print(" -", n)

"""NRS POS API fetch — login + download yesterday's item-sales CSV."""
import os, sys, json, re, time, datetime

BASE = "https://pos-papi.nrsplus.com"
NRS = r"C:/Users/Jayto/anthony-supermarket/nrs"
INBOX = os.path.join(NRS, "inbox")

def load_creds():
    creds = {}
    with open(os.path.join(NRS, ".env"), encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                creds[k.strip()] = v.strip()
    return creds.get("NRS_USER", ""), creds.get("NRS_PASS", "")

def main():
    user, pwd = load_creds()
    if not user or not pwd:
        print("NO_CREDS")
        return 1

    target = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()

    import urllib.request, urllib.error
    def req(url, method="GET", data=None, headers=None, timeout=60):
        h = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Origin": "https://mystore.nrsplus.com",
            "Referer": "https://mystore.nrsplus.com/",
        }
        if headers: h.update(headers)
        body = None
        if data is not None:
            body = json.dumps(data).encode()
            h["Content-Type"] = "application/json"
        r = urllib.request.Request(url, data=body, headers=h, method=method)
        try:
            with urllib.request.urlopen(r, timeout=timeout) as resp:
                raw = resp.read()
                return resp.status, raw, dict(resp.headers)
        except urllib.error.HTTPError as e:
            return e.code, e.read(), dict(e.headers)
        except Exception as e:
            return -1, str(e).encode(), {}

    # 1) Login
    st, raw, hdrs = req(f"{BASE}/auth/authenticate", "POST",
                        {"email": user, "pwd": pwd, "check": True})
    print(f"LOGIN status={st}")
    txt = raw.decode("utf-8", errors="replace")
    if st != 200:
        print("LOGIN_BODY:", txt[:500])
        return 2
    try:
        j = json.loads(txt)
    except Exception:
        print("LOGIN_NOT_JSON:", txt[:500])
        return 2
    data = (j.get("data") or {})
    token = data.get("token") or j.get("token")
    print("HAS_TOKEN:", bool(token))
    if not token:
        print("LOGIN_JSON:", json.dumps(j)[:800])
        return 2

    # 2) Find store_id. Login may include stores; otherwise fetch user detail.
    stores = data.get("stores") or data.get("storeList") or data.get("appattrs", {}).get("stores")
    store_id = None
    if isinstance(stores, list) and stores:
        s0 = stores[0]
        store_id = s0.get("store_id") or s0.get("id") if isinstance(s0, dict) else None
        print("STORE_IDS_FROM_LOGIN:", [s.get("store_id") or s.get("id") for s in stores if isinstance(s, dict)][:5])
    if not store_id:
        # try user detail endpoint
        st2, raw2, _ = req(f"{BASE}/{token}/users/current")
        print("USERS_CURRENT status=", st2)
        if st2 == 200:
            try:
                j2 = json.loads(raw2.decode("utf-8", errors="replace"))
                d2 = j2.get("data") or {}
                stores2 = d2.get("stores") or d2.get("storeList") or (d2.get("appattrs") or {}).get("stores")
                if isinstance(stores2, list) and stores2:
                    s0 = stores2[0]
                    store_id = s0.get("store_id") or s0.get("id") if isinstance(s0, dict) else None
            except Exception:
                pass
    if not store_id:
        # probe config/cfg
        for ep in ["/merchant/cfg", "/stores"]:
            st3, raw3, _ = req(f"{BASE}/{token}{ep}" if ep.startswith("/") else f"{BASE}/{token}/{ep}")
            print(f"PROBE {ep} status={st3} len={len(raw3)}")
            if st3 == 200:
                try:
                    j3 = json.loads(raw3.decode("utf-8", errors="replace"))
                    print("  probe json keys:", list(j3.keys())[:10])
                except Exception:
                    pass
        print("NO_STORE_ID")
        return 3

    print("STORE_ID:", store_id)

    # 3) Download item sales CSV for yesterday (day period, same-day range)
    url = f"{BASE}/{token}/pcrhistcsv/{store_id}/itemsales/day/{target}/{target}"
    st4, raw4, hdrs4 = req(url)
    print(f"CSV status={st4} bytes={len(raw4)} ctype={hdrs4.get('Content-Type','')}")
    if st4 != 200 or len(raw4) < 50:
        print("CSV_BODY:", raw4.decode("utf-8", errors="replace")[:500])
        # fallback: try today/yesterday keywords
        for suffix in [f"/yesterday", f"/day/{target}"]:
            u2 = f"{BASE}/{token}/pcrhistcsv/{store_id}/itemsales{suffix}"
            st5, raw5, _ = req(u2)
            print(f"  retry {suffix} status={st5} bytes={len(raw5)}")
            if st5 == 200 and len(raw5) > 50:
                raw4, st4 = raw5, st5
                break
    if st4 != 200 or len(raw4) < 50:
        print("FETCH_FAILED")
        return 4

    out = os.path.join(INBOX, f"nrs_sales_{target}.csv")
    os.makedirs(INBOX, exist_ok=True)
    with open(out, "wb") as f:
        f.write(raw4)
    print("SAVED:", out, len(raw4), "bytes")
    head = raw4[:400].decode("utf-8", errors="replace")
    print("HEAD:", head[:300].replace("\n", " | "))
    return 0

if __name__ == "__main__":
    sys.exit(main())

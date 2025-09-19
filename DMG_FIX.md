# 🚨 "Disk is Damaged" Error Fix

If you get a **"disk is damaged and should be ejected"** error when opening the DMG, this is a macOS security feature, not actual damage.

## Quick Fix (2 commands)

Open Terminal and run these commands:

```bash
# Remove quarantine from the downloaded DMG
xattr -c ~/Downloads/LunaGram-*.dmg

# Open the DMG
open ~/Downloads/LunaGram-*.dmg
```

## Alternative Fix

1. **Right-click** the DMG file in Downloads
2. Select **"Open With" → "DiskImageMounter"**
3. Click **"Open"** when macOS warns you

## Why This Happens

- macOS marks downloaded files as "quarantined"
- Unsigned apps get blocked by Gatekeeper
- This is normal behavior for developer-distributed apps
- The app itself is completely safe

## After Installation

When you first launch LunaGram:
1. **Right-click** the app → **"Open"** (don't double-click)
2. Click **"Open"** in the security dialog
3. After the first launch, you can double-click normally

---

💡 **This only happens once per download** - local builds don't have this issue.
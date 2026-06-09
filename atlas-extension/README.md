# Atlas Session Sync

1. Run `node lc-scripts/install-atlas-cookie-host.mjs` from the widget directory.
2. Open `chrome://extensions` in ChatGPT Atlas.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `atlas-extension` directory.
5. Keep a valid login session on `https://leetcode.cn`.

The extension synchronizes `LEETCODE_SESSION` on startup, whenever the cookie
changes, and every 30 minutes. The session file remains local and is ignored by
Git.

The extension requests cookie access only for `https://leetcode.cn/*`.

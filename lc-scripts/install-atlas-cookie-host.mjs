#!/usr/bin/env node

import { chmodSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const EXTENSION_ID = "fdlmljklbmmcdailhihdonglafdnnlhm";
const HOST_NAME = "com.pzgallium.leetcode_session_sync";
const scriptDir = dirname(fileURLToPath(import.meta.url));
const hostPath = join(scriptDir, "atlas-cookie-host.mjs");
const manifestDir = join(
  process.env.HOME,
  "Library",
  "Application Support",
  "com.openai.atlas",
  "NativeMessagingHosts",
);
const manifestPath = join(manifestDir, `${HOST_NAME}.json`);

mkdirSync(manifestDir, { recursive: true });
chmodSync(hostPath, 0o755);
writeFileSync(
  manifestPath,
  `${JSON.stringify({
    name: HOST_NAME,
    description: "Writes the LeetCode China session to the Übersicht widget",
    path: hostPath,
    type: "stdio",
    allowed_origins: [`chrome-extension://${EXTENSION_ID}/`],
  }, null, 2)}\n`,
  "utf8",
);

console.log(`Installed native host: ${manifestPath}`);

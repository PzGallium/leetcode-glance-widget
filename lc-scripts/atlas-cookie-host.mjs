#!/usr/bin/env node

import { chmodSync, renameSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const widgetDir = dirname(dirname(fileURLToPath(import.meta.url)));
const sessionPath = join(widgetDir, ".leetcode_cn_session");

function sendResponse(response) {
  const payload = Buffer.from(JSON.stringify(response));
  const header = Buffer.alloc(4);
  header.writeUInt32LE(payload.length, 0);
  process.stdout.write(Buffer.concat([header, payload]));
}

function writeSession(session) {
  if (typeof session !== "string" || !/^eyJ[A-Za-z0-9._-]+$/.test(session) || session.length > 4096) {
    throw new Error("Invalid LeetCode session");
  }

  const temporaryPath = `${sessionPath}.tmp`;
  writeFileSync(temporaryPath, `${session}\n`, { encoding: "utf8", mode: 0o600 });
  renameSync(temporaryPath, sessionPath);
  chmodSync(sessionPath, 0o600);
}

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);

try {
  const input = Buffer.concat(chunks);
  if (input.length < 4) throw new Error("Missing native message");

  const messageLength = input.readUInt32LE(0);
  if (messageLength > 8192 || input.length < messageLength + 4) {
    throw new Error("Invalid native message");
  }

  const message = JSON.parse(input.subarray(4, messageLength + 4).toString("utf8"));
  writeSession(message.session);
  sendResponse({ ok: true });
} catch (error) {
  sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) });
  process.exitCode = 1;
}

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const validator = fileURLToPath(new URL("../src/validate-launch-config.js", import.meta.url));
const testKey = `0x${"1".repeat(64)}`;
const placeholder = "0xYOUR_PRIVATE_KEY_HERE";

function validate(t, assignments, env = {}) {
  const cwd = mkdtempSync(join(tmpdir(), "keeper-config-test-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  writeFileSync(join(cwd, ".env"), [
    "RPC_URL=http://127.0.0.1:8545",
    `CONTRACT_ADDRESS=0x${"2".repeat(40)}`,
    ...assignments
  ].join("\n"));

  const result = spawnSync(process.execPath, [validator], { cwd, env, encoding: "utf8" });
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  return result;
}

test("launcher accepts plain and quoted dotenv assignments with inline comments", (t) => {
  for (const key of [testKey, `"${testKey}"`, `'${testKey}'`]) {
    const { status, stderr } = validate(t, [`PRIVATE_KEY=${key} # keeper wallet`]);
    assert.equal(status, 0, stderr);
  }
});

test("launcher validates the last dotenv assignment without printing the value", (t) => {
  const invalidLast = validate(t, [`PRIVATE_KEY=${testKey}`, `PRIVATE_KEY=${placeholder}`]);
  assert.equal(invalidLast.status, 1);
  assert.match(invalidLast.stderr, /PRIVATE_KEY must be/);
  assert.ok(!invalidLast.stderr.includes(placeholder));

  const validLast = validate(t, [`PRIVATE_KEY=${placeholder}`, `PRIVATE_KEY=${testKey}`]);
  assert.equal(validLast.status, 0, validLast.stderr);
});

test("launcher uses the inherited key when it takes precedence over the file", (t) => {
  const result = validate(t, [`PRIVATE_KEY=${testKey}`], { PRIVATE_KEY: placeholder });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /PRIVATE_KEY must be/);
});

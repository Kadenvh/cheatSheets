const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");
const { logHook } = require("./log-util");
logHook("lint-on-edit");

let input;
try {
  input = JSON.parse(fs.readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const filePath = (input.tool_input?.file_path || "").replace(/\\/g, "/");

// Only lint JS/TS files
if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(filePath)) {
  process.exit(0);
}

// Find eslint config by walking up from project root
const projectDir =
  process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "../..");

const eslintConfigs = [
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  ".eslintrc.json",
  ".eslintrc.js",
  ".eslintrc",
];

// Search project root and common subdirectories for eslint config
let eslintDir = null;
const searchDirs = [projectDir];

// Also search parent directories of the edited file within the project
let check = path.dirname(filePath);
while (check.length >= projectDir.length) {
  searchDirs.push(check);
  check = path.dirname(check);
}

for (const dir of searchDirs) {
  for (const config of eslintConfigs) {
    if (fs.existsSync(path.join(dir, config))) {
      eslintDir = dir;
      break;
    }
  }
  if (eslintDir) break;
}

if (!eslintDir) {
  process.exit(0); // No eslint config found, skip
}

try {
  execSync(
    `npx eslint --no-warn-ignored --max-warnings 0 "${filePath}"`,
    {
      cwd: eslintDir,
      encoding: "utf8",
      timeout: 12000,
      stdio: ["pipe", "pipe", "pipe"],
    }
  );
} catch (e) {
  const errors = (e.stdout || e.stderr || e.message)
    .split("\n")
    .slice(0, 15)
    .join("\n");
  process.stderr.write(errors);
  process.exit(2);
}

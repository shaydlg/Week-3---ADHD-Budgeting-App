// Gate-check the Claude Skills vendored into this repo (.claude/skills).
//
// Each skill is a folder with a SKILL.md whose YAML frontmatter must have a
// non-empty `name` and `description`. That frontmatter is what makes a skill
// loadable, so if one goes missing or breaks, this script exits non-zero and CI
// fails the push. (Week 5 requirement: "gate-check the Week 1 skills on every
// push, so a push that breaks them does not pass.")
//
// No dependencies on purpose: it runs anywhere Node runs, including CI.

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(repoRoot, ".claude", "skills");

// The Week 1 skills that must always be present and valid.
const EXPECTED = [
  "architecture-governance",
  "secure-coding",
  "ux-design",
  "web-accessibility",
];

const errors = [];

// Read one field (e.g. "name") out of the top --- ... --- frontmatter block.
function frontmatterField(md, field) {
  const block = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return null;
  const line = block[1]
    .split(/\r?\n/)
    .find((l) => l.trimStart().toLowerCase().startsWith(field + ":"));
  if (!line) return null;
  return line.slice(line.indexOf(":") + 1).trim();
}

if (!existsSync(skillsDir)) {
  errors.push("Skills folder not found: .claude/skills");
} else {
  const found = readdirSync(skillsDir).filter((name) =>
    statSync(join(skillsDir, name)).isDirectory()
  );

  // 1. Every expected skill must still be there.
  for (const name of EXPECTED) {
    if (!found.includes(name)) errors.push(`Missing skill: ${name}`);
  }

  // 2. Every skill present must have a valid SKILL.md with name + description.
  for (const name of found) {
    const file = join(skillsDir, name, "SKILL.md");
    if (!existsSync(file)) {
      errors.push(`${name}: no SKILL.md`);
      continue;
    }
    const md = readFileSync(file, "utf8");
    if (!/^---\r?\n[\s\S]*?\r?\n---/.test(md)) {
      errors.push(`${name}: missing YAML frontmatter (--- ... ---)`);
      continue;
    }
    if (!frontmatterField(md, "name")) {
      errors.push(`${name}: frontmatter is missing a non-empty "name"`);
    }
    if (!frontmatterField(md, "description")) {
      errors.push(`${name}: frontmatter is missing a non-empty "description"`);
    }
  }
}

if (errors.length > 0) {
  console.error("✗ Skill check failed:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}

console.log(`✓ All ${EXPECTED.length} Claude Skills are present and valid.`);

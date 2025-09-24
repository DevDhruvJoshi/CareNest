import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../../../../');

function readFileSafe(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

export function loadIdeMasterPrompt(): { full: string; masterBlock: string } {
  const promptPath = path.join(repoRoot, 'Prompts', 'IDE_AI_IMPLEMENTATION_PROMPT.md');
  const content = readFileSafe(promptPath);
  if (!content) {
    return { full: '', masterBlock: '' };
  }
  // Extract the first fenced code block after the heading that starts with
  // "## 🧠 ONE‑SHOT SETUP MASTER PROMPT" (allowing any trailing text)
  const lines = content.split(/\r?\n/);
  const headingRegex = /^##\s*🧠\s*ONE‑SHOT SETUP MASTER PROMPT.*$/; // allow extra text after heading
  let startLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headingRegex.test(lines[i])) {
      startLineIndex = i;
      break;
    }
  }
  if (startLineIndex === -1) {
    return { full: content, masterBlock: '' };
  }
  // Search for the next fenced code block after the heading
  const after = lines.slice(startLineIndex + 1).join('\n');
  const codeBlockMatch = after.match(/```[\w-]*\n([\s\S]*?)\n```/);
  const masterBlock = codeBlockMatch ? codeBlockMatch[1].trim() : '';
  return { full: content, masterBlock };
}



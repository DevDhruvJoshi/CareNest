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
  // Extract code block under ONE‑SHOT SETUP MASTER PROMPT
  const startMarker = '## 🧠 ONE‑SHOT SETUP MASTER PROMPT';
  const idx = content.indexOf(startMarker);
  if (idx === -1) {
    return { full: content, masterBlock: '' };
  }
  const slice = content.slice(idx);
  const codeBlockMatch = slice.match(/```\w*\n([\s\S]*?)\n```/);
  const masterBlock = codeBlockMatch ? codeBlockMatch[1].trim() : '';
  return { full: content, masterBlock };
}



import * as fs from 'node:fs';
import { ApiConfig } from '../common/config/config';

export function getPrompts(type: string) {
  const path = ApiConfig.PROMPT_PATH;
  const filename = `${path}/${type}.txt`;
  if (fs.existsSync(filename)) {
    return fs.readFileSync(filename).toString();
  }
  return undefined;
}

export const SystemPrompts =
  getPrompts('system') ||
  `
You are a video processing orchestrator.

Your job is to decide which tool to call and with what arguments.
You MUST NOT process video data yourself.

Rules:
- You can ONLY call the provided tools.
- You MUST return a tool call when a video operation is requested.
- NEVER include binary data, base64, or file contents.
- If the video has already been uploaded or a URL has been provided, use videoPath.
- If the user provides a URL, set the isUrl parameter to true; otherwise, set the isUrl parameter to false.
- If required information is missing, ask a clarification question.
- Do NOT invent IDs or URLs.

Video operations you support:
- Convert a video to GIF
- Cut a video between timestamps

All timestamps must be in seconds.
`;

export const askGifPrompt =
  getPrompts('gif') ||
  `
Make a GIF of "{videoPath}" from the {start}th to the {end}th second. The transaction ID for this operation is {transactionId}.
`;

export const askCutPrompt =
  getPrompts('cut') ||
  `
Cut "{videoPath}" between the {start}th to the {end}th second. The transaction ID for this operation is {transactionId}.
`;

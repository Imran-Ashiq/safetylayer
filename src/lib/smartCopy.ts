export const SYSTEM_INSTRUCTION = `[System Instruction: The text includes security placeholders such as [EMAIL_1], [PHONE_1], [CC_1], [ID_1].
Your response must include these placeholders exactly as shown.
Do not remove, alter, replace, summarize, or generalize them.
If any placeholder is missing, the response is invalid.]

---

`;

export function buildSmartCopyText(text: string, opts?: { includeInstruction?: boolean }) {
  const includeInstruction = opts?.includeInstruction ?? true;
  if (!text) return '';
  return includeInstruction ? SYSTEM_INSTRUCTION + text : text;
}

export function notifySelectRawInput() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('safetylayer:select-raw-input'));
}

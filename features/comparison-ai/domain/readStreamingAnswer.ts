// Only expose complete JSON escapes; the final tool object is validated separately.
export function readStreamingAnswer(json: string): string | null {
  const match = json.match(
    /^\s*\{\s*"answer"\s*:\s*"((?:[^"\\\u0000-\u001f]|\\(?:["\\/bfnrt]|u[\da-fA-F]{4}))*)/u,
  );
  if (!match) return null;
  const answer: string = JSON.parse(`"${match[1]}"`);
  // A surrogate pair can arrive in separate provider chunks.
  const last = answer.charCodeAt(answer.length - 1);
  return last >= 0xd800 && last <= 0xdbff ? answer.slice(0, -1) : answer;
}

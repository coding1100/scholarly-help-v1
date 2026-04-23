export function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}


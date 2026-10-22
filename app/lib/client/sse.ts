"use client";

/**
 * Reads a Server-Sent Events response and calls `onEvent` with each parsed
 * `data:` payload. Comment lines (keep-alive pings) are ignored and the
 * `[DONE]` sentinel ends the read. Errors thrown by `onEvent` propagate.
 */
export async function readSse(
  response: Response,
  onEvent: (data: unknown) => void,
): Promise<void> {
  if (!response.body) throw new Error("The stream response has no body.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  // Returns true once the [DONE] sentinel has been seen.
  const handleBlock = (block: string): boolean => {
    for (const line of block.split("\n")) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data) continue;
      if (data === "[DONE]") return true;
      onEvent(JSON.parse(data));
    }
    return false;
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() ?? "";
      for (const block of blocks) {
        if (handleBlock(block)) return;
      }
    }
    buffer += decoder.decode();
    if (buffer.trim()) handleBlock(buffer);
  } finally {
    reader.releaseLock();
  }
}

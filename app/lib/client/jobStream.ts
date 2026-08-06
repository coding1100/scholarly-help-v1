export type JobStatus<T> = {
  status: "queued" | "processing" | "completed" | "failed" | string;
  progress?: number;
  result?: T;
  error?: string;
};

type Options<T> = {
  eventsUrl: string;
  pollUrl: string;
  headers?: HeadersInit;
  signal: AbortSignal;
  parse: (payload: unknown) => JobStatus<T>;
  onProgress?: (job: JobStatus<T>) => void;
  timeoutMs?: number;
};

async function consumeSse<T>(response: Response, options: Options<T>): Promise<T> {
  if (!response.body) throw new Error("Streaming response has no body.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";
    for (const event of events) {
      const data = event.split("\n").filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim()).join("\n");
      if (!data || data === "[DONE]") continue;
      const job = options.parse(JSON.parse(data));
      options.onProgress?.(job);
      if (job.status === "completed" && job.result !== undefined) return job.result;
      if (job.status === "failed") throw new Error(job.error || "Job failed.");
    }
  }
  throw new Error("Event stream ended before the job completed.");
}

/** Uses SSE when available, falling back to bounded adaptive polling. */
export async function waitForJob<T>(options: Options<T>): Promise<T> {
  const deadline = Date.now() + (options.timeoutMs ?? 240_000);
  try {
    const response = await fetch(options.eventsUrl, {
      headers: { Accept: "text/event-stream", ...options.headers },
      signal: options.signal,
      cache: "no-store",
    });
    if (response.ok && response.headers.get("content-type")?.includes("text/event-stream")) {
      return await consumeSse(response, options);
    }
  } catch (error) {
    if (options.signal.aborted) throw error;
  }

  let delay = 1500;
  while (Date.now() < deadline) {
    await new Promise<void>((resolve, reject) => {
      const onAbort = () => { clearTimeout(timer); reject(options.signal.reason); };
      const timer = setTimeout(() => { options.signal.removeEventListener("abort", onAbort); resolve(); }, delay);
      options.signal.addEventListener("abort", onAbort, { once: true });
    });
    const response = await fetch(options.pollUrl, {
      headers: options.headers,
      signal: options.signal,
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Job status request failed (${response.status}).`);
    const job = options.parse(await response.json());
    options.onProgress?.(job);
    if (job.status === "completed" && job.result !== undefined) return job.result;
    if (job.status === "failed") throw new Error(job.error || "Job failed.");
    delay = Math.min(8000, Math.round(delay * 1.35));
  }
  throw new Error("The job timed out. You can safely try again.");
}

export async function cancelJob(url: string, headers?: HeadersInit) {
  const response = await fetch(url, { method: "DELETE", headers, keepalive: true });
  if (!response.ok && response.status !== 404 && response.status !== 405) {
    throw new Error("The server could not cancel this job.");
  }
}

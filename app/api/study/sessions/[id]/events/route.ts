import { NextRequest } from "next/server";
import { getSession, listSources } from "@/app/lib/server/study/repo";
import { getAuthenticatedUserId } from "@/app/lib/server/study/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = getAuthenticatedUserId(request);
  const session = userId ? await getSession(params.id) : null;
  if (!session || session.userId !== userId) return new Response("Unauthorized", { status: 401 });
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stream = new ReadableStream({
    async start(controller) {
      const startedAt = Date.now();
      const emit = async () => {
        if (request.signal.aborted) { controller.close(); return; }
        try {
          const sources = await listSources(params.id);
          const statuses = sources.map((source) => ({ id: String(source._id), name: source.name, indexStatus: source.indexStatus }));
          controller.enqueue(encoder.encode(`event: source-status\ndata: ${JSON.stringify(statuses)}\n\n`));
          if (!statuses.some((source) => source.indexStatus === "pending") || Date.now() - startedAt > 180_000) { controller.close(); return; }
          timer = setTimeout(emit, 3000);
        } catch (error) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: error instanceof Error ? error.message : "Status stream failed" })}\n\n`));
          controller.close();
        }
      };
      controller.enqueue(encoder.encode(": connected\n\n"));
      await emit();
    },
    cancel() { if (timer) clearTimeout(timer); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
}

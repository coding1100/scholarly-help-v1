import { ObjectId } from "mongodb";
import { getMongoDb } from "@/app/lib/mongodb";
import {
  StudyArtifactType,
  StudySession,
  StudySourceIndexStatus,
  StudySourceKind,
  TutorMessage,
  TutorMessageImageAttachment,
} from "@/app/lib/server/study/types";
import { chunkText, normalizeText } from "@/app/lib/server/study/text";
import {
  currentEmbedderId,
  indexStudySourceInBackground,
  reindexStudySource,
  removeStudySessionFromIndex,
  StudyIndexOutcome,
} from "@/app/lib/server/study/studyRag";

const COLLECTIONS = {
  sessions: "study_sessions",
  sources: "study_sources",
  artifacts: "study_artifacts",
  tutorMessages: "study_tutor_messages",
} as const;

type MemorySession = StudySession & { _id: string };
type MemorySource = {
  _id: string;
  sessionId: string;
  kind: StudySourceKind;
  name: string;
  text: string;
  chunks: string[];
  createdAt: Date;
  indexStatus?: StudySourceIndexStatus;
  indexedAt?: Date;
  embedderId?: string;
};
type MemoryArtifact = {
  _id: string;
  sessionId: string;
  type: StudyArtifactType;
  content: unknown;
  createdAt: Date;
  updatedAt: Date;
};
type MemoryTutorMessage = {
  _id: string;
  sessionId: string;
  role: "user" | "assistant";
  message: string;
  citations: number[];
  provenance?: "source" | "general" | "image";
  attachments?: TutorMessageImageAttachment[];
  createdAt: Date;
};

const globalStudyStore = global as typeof globalThis & {
  __studyMemoryStore?: {
    sessions: Map<string, MemorySession>;
    sources: Map<string, MemorySource>;
    artifacts: Map<string, MemoryArtifact>;
    tutorMessages: Map<string, MemoryTutorMessage>;
  };
};

const memoryStore =
  globalStudyStore.__studyMemoryStore ||
  (globalStudyStore.__studyMemoryStore = {
    sessions: new Map<string, MemorySession>(),
    sources: new Map<string, MemorySource>(),
    artifacts: new Map<string, MemoryArtifact>(),
    tutorMessages: new Map<string, MemoryTutorMessage>(),
  });

async function getDbSafe() {
  const globalAny = global as typeof globalThis & {
    __studyMongoDownUntil?: number;
  };
  const now = Date.now();
  if (
    typeof globalAny.__studyMongoDownUntil === "number" &&
    globalAny.__studyMongoDownUntil > now
  ) {
    return null;
  }

  try {
    return await getMongoDb();
  } catch {
    globalAny.__studyMongoDownUntil = Date.now() + 30_000;
    return null;
  }
}

function createMemoryId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function toObjectId(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid session id");
  }
  return new ObjectId(id);
}

export async function createSession(userId: string, title: string) {
  const db = await getDbSafe();
  const now = new Date();
  const payload: Omit<StudySession, "_id"> = {
    userId: normalizeText(userId || "anonymous"),
    title: normalizeText(title || "Untitled session"),
    createdAt: now,
    updatedAt: now,
  };

  if (!db) {
    const _id = createMemoryId("session");
    const session = { ...payload, _id };
    memoryStore.sessions.set(_id, session);
    return session;
  }

  const result = await db.collection(COLLECTIONS.sessions).insertOne(payload);
  return { ...payload, _id: result.insertedId.toString() };
}

/**
 * Re-key a guest's study sessions onto a real account after sign-up. Sources,
 * artifacts and tutor messages are keyed by sessionId, so only the session
 * ownership needs to move. Idempotent and a no-op if the ids match or the guest
 * had no data. Returns the number of sessions migrated.
 */
export async function claimGuestSessions(
  guestUserId: string,
  realUserId: string,
): Promise<number> {
  const from = normalizeText(guestUserId || "");
  const to = normalizeText(realUserId || "");
  if (!from || !to || from === to) return 0;

  const db = await getDbSafe();
  if (!db) {
    let count = 0;
    for (const [id, session] of memoryStore.sessions.entries()) {
      if (session.userId === from) {
        memoryStore.sessions.set(id, { ...session, userId: to });
        count += 1;
      }
    }
    return count;
  }

  const result = await db
    .collection(COLLECTIONS.sessions)
    .updateMany({ userId: from }, { $set: { userId: to } });
  return result.modifiedCount ?? 0;
}

export async function listSessions(userId: string) {
  const db = await getDbSafe();
  if (!db) {
    return Array.from(memoryStore.sessions.values())
      .filter((item) => item.userId === normalizeText(userId || "anonymous"))
      .sort((a, b) => +b.updatedAt - +a.updatedAt)
      .slice(0, 50);
  }
  const items = await db
    .collection(COLLECTIONS.sessions)
    .find({ userId: normalizeText(userId || "anonymous") })
    .sort({ updatedAt: -1 })
    .limit(50)
    .toArray();

  return items.map((item) => ({ ...item, _id: item._id.toString() }));
}

export async function getSession(
  sessionId: string,
): Promise<(StudySession & { _id: string }) | null> {
  const db = await getDbSafe();
  if (!db) {
    return memoryStore.sessions.get(sessionId) || null;
  }
  const session = await db
    .collection(COLLECTIONS.sessions)
    .findOne({ _id: toObjectId(sessionId) });
  if (!session) return null;
  return { ...(session as unknown as StudySession), _id: session._id.toString() };
}

export async function updateSessionTitle(sessionId: string, title: string) {
  const db = await getDbSafe();
  const now = new Date();
  if (!db) {
    const existing = memoryStore.sessions.get(sessionId);
    if (!existing) return null;
    const updated = {
      ...existing,
      title: normalizeText(title),
      updatedAt: now,
    };
    memoryStore.sessions.set(sessionId, updated);
    return updated;
  }

  await db.collection(COLLECTIONS.sessions).updateOne(
    { _id: toObjectId(sessionId) },
    {
      $set: {
        title: normalizeText(title),
        updatedAt: now,
      },
    },
  );

  const updated = await db
    .collection(COLLECTIONS.sessions)
    .findOne({ _id: toObjectId(sessionId) });

  if (!updated) return null;
  return { ...updated, _id: updated._id.toString() };
}

export async function deleteSession(sessionId: string) {
  const db = await getDbSafe();
  if (!db) {
    const existing = memoryStore.sessions.get(sessionId);
    if (!existing) return false;
    memoryStore.sessions.delete(sessionId);
    for (const [sourceId, source] of memoryStore.sources.entries()) {
      if (source.sessionId === sessionId) {
        memoryStore.sources.delete(sourceId);
      }
    }
    for (const [artifactId, artifact] of memoryStore.artifacts.entries()) {
      if (artifact.sessionId === sessionId) {
        memoryStore.artifacts.delete(artifactId);
      }
    }
    for (const [messageId, message] of memoryStore.tutorMessages.entries()) {
      if (message.sessionId === sessionId) {
        memoryStore.tutorMessages.delete(messageId);
      }
    }
    await removeStudySessionFromIndex(sessionId);
    return true;
  }

  const objectId = toObjectId(sessionId);
  const [sessionDelete] = await Promise.all([
    db.collection(COLLECTIONS.sessions).deleteOne({ _id: objectId }),
    db.collection(COLLECTIONS.sources).deleteMany({ sessionId: objectId }),
    db.collection(COLLECTIONS.artifacts).deleteMany({ sessionId: objectId }),
    db.collection(COLLECTIONS.tutorMessages).deleteMany({ sessionId: objectId }),
    removeStudySessionFromIndex(sessionId),
  ]);

  return sessionDelete.deletedCount > 0;
}

/**
 * Persist the durable RAG index status for a single source. Best-effort: a
 * failure here must never break upload or retrieval, so it swallows errors.
 * `sourceId` is the string id returned by addSource (Mongo ObjectId hex or a
 * memory id).
 */
export async function setSourceIndexStatus(
  sourceId: string,
  outcome: StudyIndexOutcome,
): Promise<void> {
  const now = new Date();
  try {
    const db = await getDbSafe();
    if (!db) {
      const existing = memoryStore.sources.get(sourceId);
      if (existing) {
        memoryStore.sources.set(sourceId, {
          ...existing,
          indexStatus: outcome.status,
          indexedAt: now,
          embedderId: outcome.embedderId,
        });
      }
      return;
    }
    if (!ObjectId.isValid(sourceId)) return;
    await db.collection(COLLECTIONS.sources).updateOne(
      { _id: new ObjectId(sourceId) },
      {
        $set: {
          indexStatus: outcome.status,
          indexedAt: now,
          ...(outcome.embedderId ? { embedderId: outcome.embedderId } : {}),
        },
      },
    );
  } catch (error) {
    console.error("study.repo.set_index_status_failed", { sourceId, error });
  }
}

export async function addSource(
  sessionId: string,
  kind: StudySourceKind,
  name: string,
  text: string,
) {
  const db = await getDbSafe();
  const now = new Date();
  const normalizedText = normalizeText(text);
  const chunks = chunkText(normalizedText);

  // A new source starts "pending"; invalidate any "recently clean" marker so the
  // next tutor query re-evaluates and picks it up if its background index failed.
  reindexCleanUntil.delete(sessionId);

  const payload = {
    sessionId: db ? toObjectId(sessionId) : sessionId,
    kind,
    name: normalizeText(name || "Source"),
    text: normalizedText,
    chunks,
    createdAt: now,
    // Marked pending until background indexing reports a terminal status.
    indexStatus: "pending" as StudySourceIndexStatus,
  };

  if (!db) {
    const _id = createMemoryId("source");
    memoryStore.sources.set(_id, {
      _id,
      sessionId,
      kind,
      name: payload.name,
      text: normalizedText,
      chunks,
      createdAt: now,
      indexStatus: "pending",
    });
    const session = memoryStore.sessions.get(sessionId);
    if (session) {
      memoryStore.sessions.set(sessionId, { ...session, updatedAt: now });
    }
    for (const [artifactId, artifact] of memoryStore.artifacts.entries()) {
      if (artifact.sessionId === sessionId) {
        memoryStore.artifacts.delete(artifactId);
      }
    }
    for (const [messageId, message] of memoryStore.tutorMessages.entries()) {
      if (message.sessionId === sessionId) {
        memoryStore.tutorMessages.delete(messageId);
      }
    }
    // Background RAG indexing — does not block the upload response. The
    // callback persists the terminal status so it can be recovered later.
    indexStudySourceInBackground(
      sessionId,
      _id,
      normalizedText,
      payload.name,
      (outcome) => setSourceIndexStatus(_id, outcome),
    );
    return {
      _id,
      sessionId,
      kind,
      name: payload.name,
      chunkCount: chunks.length,
      createdAt: now,
      indexStatus: "pending" as StudySourceIndexStatus,
    };
  }

  const result = await db.collection(COLLECTIONS.sources).insertOne(payload);
  await db
    .collection(COLLECTIONS.sessions)
    .updateOne({ _id: toObjectId(sessionId) }, { $set: { updatedAt: now } });
  await Promise.all([
    db.collection(COLLECTIONS.artifacts).deleteMany({ sessionId: toObjectId(sessionId) }),
    db
      .collection(COLLECTIONS.tutorMessages)
      .deleteMany({ sessionId: toObjectId(sessionId) }),
  ]);

  // Background RAG indexing — does not block the upload response. The callback
  // persists the terminal status so it can be recovered later.
  const sourceId = result.insertedId.toString();
  indexStudySourceInBackground(
    sessionId,
    sourceId,
    normalizedText,
    payload.name,
    (outcome) => setSourceIndexStatus(sourceId, outcome),
  );

  return {
    _id: sourceId,
    sessionId,
    kind,
    name: payload.name,
    chunkCount: chunks.length,
    createdAt: now,
    indexStatus: "pending" as StudySourceIndexStatus,
  };
}

export async function getSessionSourceText(sessionId: string) {
  const db = await getDbSafe();
  if (!db) {
    const sources = Array.from(memoryStore.sources.values())
      .filter((s) => s.sessionId === sessionId)
      .sort((a, b) => +a.createdAt - +b.createdAt);
    return {
      mergedText: sources.map((s) => String(s.text || "")).join("\n\n"),
      chunks: sources.flatMap((s) => s.chunks || []),
    };
  }
  const sources = await db
    .collection(COLLECTIONS.sources)
    .find({ sessionId: toObjectId(sessionId) })
    .sort({ createdAt: 1 })
    .toArray();

  const chunks = sources.flatMap((s) =>
    Array.isArray(s.chunks) ? (s.chunks as string[]) : [],
  );
  const mergedText = sources.map((s) => String(s.text || "")).join("\n\n");

  return { mergedText, chunks };
}

/**
 * Re-index any of a session's sources whose vectors are missing or stale.
 *
 * Fixes the "silent permanent vector-blindness" gap: a source that stored
 * keyword-only (embed failed / no key at the time) or whose background index
 * never finished (process stopped mid-embed → stuck "pending") would otherwise
 * degrade to BM25 forever with no recovery. Called on the read path (tutor) so
 * retrieval self-heals without a cron. Awaited but bounded, and a no-op when
 * embeddings can't be produced (no API key) so it never blocks pointlessly.
 *
 * Returns the number of sources re-indexed.
 */
const globalReindexCooldown = global as typeof globalThis & {
  __studyReindexCleanUntil?: Map<string, number>;
};
const reindexCleanUntil =
  globalReindexCooldown.__studyReindexCleanUntil ||
  (globalReindexCooldown.__studyReindexCleanUntil = new Map<string, number>());
// After a sweep finds nothing to do, skip re-scanning this session for a while
// so the common (all-indexed) case doesn't refetch sources on every tutor turn.
const REINDEX_CLEAN_TTL_MS = 5 * 60 * 1000;

export async function reindexStaleStudySources(
  sessionId: string,
): Promise<number> {
  // Without an API key there are no embeddings to gain — don't churn.
  if (!process.env.GEMINI_API_KEY) return 0;

  const cleanUntil = reindexCleanUntil.get(sessionId) ?? 0;
  if (cleanUntil > Date.now()) return 0;

  const db = await getDbSafe();
  const RECOVERABLE: StudySourceIndexStatus[] = [
    "pending",
    "keyword_only",
    "failed",
  ];
  const embedderId = currentEmbedderId();

  type Candidate = {
    _id: string;
    name: string;
    text: string;
    indexStatus?: StudySourceIndexStatus;
    embedderId?: string;
  };

  let candidates: Candidate[] = [];
  if (!db) {
    candidates = Array.from(memoryStore.sources.values())
      .filter((s) => s.sessionId === sessionId)
      .map((s) => ({
        _id: s._id,
        name: s.name,
        text: s.text,
        indexStatus: s.indexStatus,
        embedderId: s.embedderId,
      }));
  } else {
    const rows = await db
      .collection(COLLECTIONS.sources)
      .find({ sessionId: toObjectId(sessionId) })
      .toArray();
    candidates = rows.map((s) => ({
      _id: s._id.toString(),
      name: String(s.name || "Source"),
      text: String(s.text || ""),
      indexStatus: s.indexStatus as StudySourceIndexStatus | undefined,
      embedderId: s.embedderId as string | undefined,
    }));
  }

  // A source needs re-indexing when its status is recoverable, or when it was
  // indexed with a different embedder (model drift). Legacy sources predating
  // this field (indexStatus undefined) are left alone — they were indexed under
  // the old path and re-checking every one on each query would be wasteful; the
  // recoverable statuses cover everything written since.
  const stale = candidates.filter((s) => {
    if (!s.text.trim()) return false;
    if (s.indexStatus && RECOVERABLE.includes(s.indexStatus)) return true;
    if (s.indexStatus === "indexed" && s.embedderId && s.embedderId !== embedderId) {
      return true;
    }
    return false;
  });
  if (stale.length === 0) {
    reindexCleanUntil.set(sessionId, Date.now() + REINDEX_CLEAN_TTL_MS);
    return 0;
  }
  // There is work to do — don't trust a stale "clean" marker.
  reindexCleanUntil.delete(sessionId);

  // Bounded per call so the tutor read path stays responsive even if many
  // sources are stale; the next query picks up the remainder.
  const MAX_PER_SWEEP = 3;
  const batch = stale.slice(0, MAX_PER_SWEEP);
  let reindexed = 0;
  for (const source of batch) {
    const outcome = await reindexStudySource(
      sessionId,
      source._id,
      source.text,
      source.name,
    );
    await setSourceIndexStatus(source._id, outcome);
    if (outcome.status === "indexed") reindexed += 1;
  }
  return reindexed;
}

export async function listSources(sessionId: string) {
  const db = await getDbSafe();
  if (!db) {
    return Array.from(memoryStore.sources.values())
      .filter((s) => s.sessionId === sessionId)
      .sort((a, b) => +b.createdAt - +a.createdAt)
      .map((item) => ({
        _id: item._id,
        sessionId: item.sessionId,
        kind: item.kind,
        name: item.name,
        text: item.text,
        chunks: item.chunks,
        createdAt: item.createdAt,
        indexStatus: item.indexStatus,
        indexedAt: item.indexedAt,
      }));
  }
  const sources = await db
    .collection(COLLECTIONS.sources)
    .find({ sessionId: toObjectId(sessionId) })
    .sort({ createdAt: -1 })
    .toArray();

  return sources.map((item) => ({
    _id: item._id.toString(),
    sessionId,
    kind: item.kind,
    name: item.name,
    text: item.text,
    chunks: Array.isArray(item.chunks) ? item.chunks : [],
    createdAt: item.createdAt,
    indexStatus: item.indexStatus as StudySourceIndexStatus | undefined,
    indexedAt: item.indexedAt as Date | undefined,
  }));
}

export async function upsertArtifact(
  sessionId: string,
  type: StudyArtifactType,
  content: unknown,
) {
  const db = await getDbSafe();
  const now = new Date();
  if (!db) {
    const existing = Array.from(memoryStore.artifacts.values()).find(
      (item) => item.sessionId === sessionId && item.type === type,
    );
    if (existing) {
      memoryStore.artifacts.set(existing._id, {
        ...existing,
        content,
        updatedAt: now,
      });
    } else {
      const _id = createMemoryId("artifact");
      memoryStore.artifacts.set(_id, {
        _id,
        sessionId,
        type,
        content,
        createdAt: now,
        updatedAt: now,
      });
    }
    const session = memoryStore.sessions.get(sessionId);
    if (session) {
      memoryStore.sessions.set(sessionId, { ...session, updatedAt: now });
    }
    return;
  }

  await db.collection(COLLECTIONS.artifacts).updateOne(
    { sessionId: toObjectId(sessionId), type },
    {
      $set: {
        content,
        updatedAt: now,
      },
      $setOnInsert: {
        sessionId: toObjectId(sessionId),
        type,
        createdAt: now,
      },
    },
    { upsert: true },
  );
  await db
    .collection(COLLECTIONS.sessions)
    .updateOne({ _id: toObjectId(sessionId) }, { $set: { updatedAt: now } });
}

export async function listArtifacts(sessionId: string) {
  const db = await getDbSafe();
  if (!db) {
    return Array.from(memoryStore.artifacts.values())
      .filter((item) => item.sessionId === sessionId)
      .sort((a, b) => +b.updatedAt - +a.updatedAt)
      .map((item) => ({
        ...item,
        sessionId: item.sessionId,
      }));
  }
  const items = await db
    .collection(COLLECTIONS.artifacts)
    .find({ sessionId: toObjectId(sessionId) })
    .sort({ updatedAt: -1 })
    .toArray();

  return items.map((item) => ({
    ...item,
    _id: item._id.toString(),
    sessionId,
  }));
}

export async function saveTutorMessage(input: TutorMessage) {
  const db = await getDbSafe();
  if (!db) {
    const _id = createMemoryId("tutor");
    memoryStore.tutorMessages.set(_id, {
      _id,
      sessionId: input.sessionId,
      role: input.role,
      message: input.message,
      citations: input.citations,
      provenance: input.provenance,
      attachments: input.attachments,
      createdAt: input.createdAt,
    });
    return _id;
  }
  const payload = {
    sessionId: toObjectId(input.sessionId),
    role: input.role,
    message: input.message,
    citations: input.citations,
    provenance: input.provenance,
    ...(input.attachments?.length ? { attachments: input.attachments } : {}),
    createdAt: input.createdAt,
  };
  const result = await db.collection(COLLECTIONS.tutorMessages).insertOne(payload);
  return result.insertedId.toString();
}

export async function listTutorMessages(sessionId: string) {
  const db = await getDbSafe();
  if (!db) {
    return Array.from(memoryStore.tutorMessages.values())
      .filter((item) => item.sessionId === sessionId)
      .sort((a, b) => +a.createdAt - +b.createdAt)
      .map((item) => ({
        _id: item._id,
        sessionId: item.sessionId,
        role: item.role,
        message: item.message,
        citations: item.citations || [],
        provenance: item.provenance,
        attachments: item.attachments,
        createdAt: item.createdAt,
      }));
  }
  const items = await db
    .collection(COLLECTIONS.tutorMessages)
    .find({ sessionId: toObjectId(sessionId) })
    .sort({ createdAt: 1 })
    .toArray();

  return items.map((item) => ({
    _id: item._id.toString(),
    sessionId,
    role: item.role,
    message: item.message,
    citations: item.citations || [],
    provenance: item.provenance,
    attachments: Array.isArray(item.attachments) ? item.attachments : undefined,
    createdAt: item.createdAt,
  }));
}

import { ObjectId } from "mongodb";
import { getMongoDb } from "@/app/lib/mongodb";
import {
  StudyArtifactType,
  StudySession,
  StudySourceKind,
  TutorMessage,
  TutorMessageImageAttachment,
} from "@/app/lib/server/study/types";
import { chunkText, normalizeText } from "@/app/lib/server/study/text";

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
    return true;
  }

  const objectId = toObjectId(sessionId);
  const [sessionDelete] = await Promise.all([
    db.collection(COLLECTIONS.sessions).deleteOne({ _id: objectId }),
    db.collection(COLLECTIONS.sources).deleteMany({ sessionId: objectId }),
    db.collection(COLLECTIONS.artifacts).deleteMany({ sessionId: objectId }),
    db.collection(COLLECTIONS.tutorMessages).deleteMany({ sessionId: objectId }),
  ]);

  return sessionDelete.deletedCount > 0;
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

  const payload = {
    sessionId: db ? toObjectId(sessionId) : sessionId,
    kind,
    name: normalizeText(name || "Source"),
    text: normalizedText,
    chunks,
    createdAt: now,
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
    return {
      _id,
      sessionId,
      kind,
      name: payload.name,
      chunkCount: chunks.length,
      createdAt: now,
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

  return {
    _id: result.insertedId.toString(),
    sessionId,
    kind,
    name: payload.name,
    chunkCount: chunks.length,
    createdAt: now,
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

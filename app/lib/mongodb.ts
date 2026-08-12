import { MongoClient, Db, MongoClientOptions, Document, FindOptions } from 'mongodb';
import { unstable_cache } from 'next/cache';

const uri = process.env.DATABASE_URL;
const options: MongoClientOptions = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    retryReads: true,
    retryWrites: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Connection pool - reused across requests
const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
};

async function connectWithRetry(retries = 2): Promise<MongoClient> {
    if (!uri) {
        throw new Error('DATABASE_URL is not set');
    }
    let lastError: unknown;
    for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
        try {
            client = new MongoClient(uri, options);
            return await client.connect();
        } catch (error) {
            lastError = error;
            console.error(`MongoDB connection failed (attempt ${attempt})`, error);
            if (attempt <= retries) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
    throw lastError;
}

/**
 * IMPORTANT:
 * Don't connect to MongoDB at module-import time.
 * Next.js may import server modules during build-time "Collecting page data",
 * and a hard DB connect here can break builds in environments without DB access.
 */
if (uri) {
    // Create a client instance immediately (no network), connect only on-demand.
    client = new MongoClient(uri, options);
    clientPromise = Promise.resolve(client);
} else {
    console.warn('DATABASE_URL is missing; MongoDB connection disabled.');
    // Dummy promise to keep default export stable
    clientPromise = Promise.reject(new Error('DATABASE_URL is not set'));
}

async function getConnectedClient(): Promise<MongoClient | null> {
    if (!uri) return null;
    try {
        // Connect only when DB is actually requested.
        if (!globalWithMongo._mongoClientPromise) {
            globalWithMongo._mongoClientPromise = connectWithRetry();
        }
        return await globalWithMongo._mongoClientPromise;
    } catch (error) {
        console.error('Failed to get MongoDB connection:', error);
        return null;
    }
}

// Get database instance
async function getDb(): Promise<Db | null> {
    const connectedClient = await getConnectedClient();
    return connectedClient?.db('scholarly_help') ?? null;
}

export async function getMongoDb(): Promise<Db | null> {
    return getDb();
}

export async function getMongoDatabase(databaseName: string): Promise<Db | null> {
    const connectedClient = await getConnectedClient();
    return connectedClient?.db(databaseName) ?? null;
}

// Cached home data fetcher - dramatically improves TTFB
export const getHomeData = unstable_cache(
    async () => {
        try {
            const db = await getDb();
            if (!db) return null;
            
            const query = { 
                $or: [
                    { id: "home_page" }, 
                    { id: "home" },
                    { id: "main" },
                    { slug: "home_page" },
                    { slug: "home" },
                    { slug: "main" }
                ]
            };
            
            const content = await db.collection('home').findOne(query);
            return content as any;
        } catch (error) {
            console.error('Error fetching home data:', error);
            return null;
        }
    },
    ['home-page-data'],
    { 
        revalidate: 60, // Cache for 60 seconds
        tags: ['home-page']
    }
);

// Generic page data fetcher with caching
export async function getPageData(
    collection: string,
    query: Document,
    options?: FindOptions<Document>
) {
    try {
        const db = await getDb();
        if (!db) return null;
        
        const content = await db.collection(collection).findOne(query, options);
        return content as any;
    } catch (error) {
        console.error(`Error fetching ${collection} data:`, error);
        return null;
    }
}

export default clientPromise!;

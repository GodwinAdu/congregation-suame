import { connectToDB } from "@/lib/mongoose";
import mongoose from "mongoose";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Collections to search
const SEARCHABLE_COLLECTIONS = [
  "users",
  "activities",
  "assignmenthistories",
  "assignments",
  "attendances",
  "biblestudies",
  "cleaningtasks",
  "coreports",
  "covisits",
  "broadcasts",
  "dailyfieldservices",
  "documents",
  "duties",
  "events",
  "expenses",
  "families",
  "fieldservicemeetings",
  "fieldservicereports",
  "groupschedules",
  "groups",
  "histories",
  "literatures",
  "notifications",
  "overseerreports",
  "privileges",
  "publictalks",
  "publicwitnesses",
  "publishergoals",
  "publisherrecords",
  "pushsubscriptions",
  "readerassignments",
  "roles",
  "schoolstudents",
  "shepherdingcalls",
  "smslogs",
  "territories",
  "transportconfigs",
  "transportfees",
];

export async function vectorSearch(query: string, limit: number = 10) {
  try {
    await connectToDB();

    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search across all collections
    const results = await Promise.all(
      SEARCHABLE_COLLECTIONS.map(async (collectionName) => {
        try {
          const collection = mongoose.connection.db.collection(collectionName);

          // Vector search aggregation
          const docs = await collection
            .aggregate([
              {
                $vectorSearch: {
                  index: "vector_index",
                  path: "embedding",
                  queryVector: queryEmbedding,
                  numCandidates: 100,
                  limit: 5,
                },
              },
              {
                $project: {
                  _id: 1,
                  score: { $meta: "vectorSearchScore" },
                  document: "$$ROOT",
                },
              },
            ])
            .toArray();

          return docs.map((doc) => ({
            collection: collectionName,
            score: doc.score,
            data: doc.document,
          }));
        } catch (error) {
          console.log(`No vector index for ${collectionName}`);
          return [];
        }
      })
    );

    // Flatten and sort by score
    const allResults = results.flat().sort((a, b) => b.score - a.score);

    return allResults.slice(0, limit);
  } catch (error) {
    console.error("Vector search error:", error);
    throw error;
  }
}

export async function generateEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

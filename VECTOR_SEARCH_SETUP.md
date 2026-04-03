# Vector Search Setup Guide

This guide will help you set up semantic search across all congregation data using MongoDB Atlas Vector Search and OpenAI embeddings.

## Prerequisites

- MongoDB Atlas cluster (M10 or higher for vector search)
- OpenAI API key in `.env` file
- Node.js installed

## Setup Steps

### 1. Install Dependencies

```bash
npm install openai
```

### 2. Generate Embeddings for Existing Data

Run the embedding generator script:

```bash
node lib/utils/generate-embeddings.js
```

This will:
- Connect to your MongoDB database
- Generate embeddings for up to 100 documents per collection
- Add `embedding` and `embeddingText` fields to documents
- Show instructions for creating vector indexes

### 3. Create Vector Search Indexes in MongoDB Atlas

**Option A: Using Atlas UI (Recommended)**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to your cluster → **Search** tab
3. Click **"Create Search Index"**
4. Select **"JSON Editor"**
5. Choose your database
6. Use this configuration:

```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "type": "knnVector",
        "dimensions": 1536,
        "similarity": "cosine"
      }
    }
  }
}
```

7. Name it: `vector_index`
8. Repeat for each collection:
   - users
   - attendances
   - fieldservicereports
   - territories
   - groups
   - events
   - shepherdingcalls
   - publisherrecords
   - biblestudies
   - communications

**Option B: Using MongoDB Shell**

Connect to your cluster and run:

```javascript
db.users.createSearchIndex({
  name: "vector_index",
  type: "vectorSearch",
  definition: {
    fields: [{
      type: "vector",
      path: "embedding",
      numDimensions: 1536,
      similarity: "cosine"
    }]
  }
});

// Repeat for other collections...
```

### 4. Test Semantic Search

Open your AI assistant and try queries like:

- "Show me everything about John Smith"
- "Find all information related to field service last month"
- "What do we have about territory assignments?"
- "Tell me about recent shepherding calls"

The AI will now use semantic search to find relevant data across ALL collections!

## How It Works

1. **Embeddings**: Each document is converted to a 1536-dimension vector using OpenAI's `text-embedding-3-small` model
2. **Vector Search**: When you ask a question, it's converted to a vector and compared to all document vectors
3. **Semantic Matching**: Results are ranked by similarity, not just keyword matching
4. **Cross-Collection**: Searches across all collections simultaneously

## Automatic Embedding Generation (Optional)

To automatically generate embeddings for new documents, add this to your model schemas:

```typescript
// Example: In user.models.ts
schema.pre('save', async function(next) {
  if (this.isModified('fullName') || this.isModified('email')) {
    const text = `${this.fullName} ${this.email}`;
    this.embedding = await generateEmbedding(text);
    this.embeddingText = text;
  }
  next();
});
```

## Benefits

✅ **Semantic Understanding**: Finds related content even with different wording
✅ **Cross-Collection Search**: Search all data at once
✅ **No Token Limits**: Vector search doesn't count against OpenAI token limits
✅ **Better Context**: AI gets more relevant information
✅ **Natural Language**: Ask questions naturally, no need to know collection names

## Troubleshooting

**Error: "No vector index found"**
- Make sure you created the `vector_index` in MongoDB Atlas
- Wait 5-10 minutes after creating indexes for them to build

**Error: "Embedding generation failed"**
- Check your `OPENAI_API_KEY` is set correctly
- Ensure you have API credits available

**Slow searches**
- Vector search is fast, but first-time index building takes time
- Consider limiting to fewer collections if needed

## Cost Considerations

- **Embedding Generation**: ~$0.02 per 1M tokens (very cheap)
- **Storage**: Embeddings add ~6KB per document
- **MongoDB Atlas**: Vector search requires M10+ cluster ($57/month)

For a typical congregation with 1000 documents:
- One-time embedding cost: ~$0.10
- Storage: ~6MB additional
- Ongoing: Only new documents need embeddings

## Next Steps

1. Run the embedding generator
2. Create vector indexes in Atlas
3. Test semantic search in AI assistant
4. Optionally set up automatic embedding for new data
5. Monitor usage and adjust collections as needed

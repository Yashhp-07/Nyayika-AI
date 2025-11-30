# Chatbot Setup Guide

## Overview

The Nyayika AI chatbot uses ChromaDB as a vector database to store and query the Indian Constitution. It implements a Retrieval-Augmented Generation (RAG) architecture to provide accurate, context-aware responses about Indian law.

## Architecture

### Backend Components

1. **ChromaDB Integration** (`utils.py`)

   - `query_constitution()`: Queries ChromaDB for relevant constitutional articles
   - `generate_chat_response_stream()`: Streams AI-generated responses using retrieved context
   - ChromaDB Cloud client connection with vector embeddings

2. **API Endpoint** (`views.py`)
   - `/chatbot/`: POST endpoint that accepts questions and streams responses
   - Server-Sent Events (SSE) for real-time streaming
   - Error handling and validation

### Frontend Components

1. **Chat Widget** (`HeroHome.js`)
   - Floating chat button with toggle animation
   - Real-time message display with streaming responses
   - Quick question buttons for common queries
   - Typing indicators and error handling

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in `backend/nyayika/` with:

```env
GOOGLE_API_KEY=your_google_gemini_api_key
CHROMA_API_KEY=your_chroma_api_key
CHROMA_TENANT=your_chroma_tenant_id
CHROMA_DATABASE=COI_KnowledgeBase
```

### 2. Install Dependencies

```bash
# Backend
cd backend/nyayika
pip install -r ../../requirements.txt

# Ensure chromadb is installed
pip install chromadb==0.5.23
```

### 3. Load Constitution Data

If you haven't already loaded the constitution data into ChromaDB:

```bash
python load_COI.py
```

### 4. Test ChromaDB Connection

```bash
python test_query_COI.py
```

### 5. Start the Backend Server

```bash
cd backend/nyayika
python manage.py runserver
```

### 6. Configure Frontend

Ensure `NEXT_PUBLIC_BACKEND_URL` is set in your frontend environment:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 7. Start Frontend

```bash
cd frontend
npm run dev
```

## How It Works

### RAG Pipeline

1. **User Query**: User asks a question about Indian Constitution
2. **Vector Search**: ChromaDB searches for relevant articles using semantic similarity
3. **Context Retrieval**: Top 3 most relevant constitutional articles are retrieved
4. **Response Generation**: Gemini 2.5 Flash generates response using retrieved context
5. **Streaming**: Response is streamed back to frontend in real-time

### API Flow

```
Frontend → POST /chatbot/ → ChromaDB Query → LLM Processing → SSE Stream → Frontend
```

### Message Format

```javascript
// Context message (sent first)
{
  type: 'context',
  articles: [
    { article: 'Article 14', title: 'Equality before law', content: '...' }
  ]
}

// Response chunks (streamed)
{
  type: 'response',
  chunk: 'The Constitution provides...'
}

// Completion
{
  type: 'done',
  done: true
}

// Error
{
  type: 'error',
  error: 'Error message'
}
```

## Features

### Current Features

- ✅ Real-time streaming responses
- ✅ RAG-based context retrieval
- ✅ Constitutional article citations
- ✅ Quick question buttons
- ✅ Typing indicators
- ✅ Error handling
- ✅ Responsive chat UI

### Potential Enhancements

- [ ] Chat history persistence
- [ ] Multi-turn conversations with context
- [ ] Article links and references
- [ ] Voice input
- [ ] Export chat transcript
- [ ] Rate limiting
- [ ] User authentication

## Testing

### Test Queries

Try these sample questions:

- "What is Article 14?"
- "Tell me about fundamental rights"
- "What are property rights in India?"
- "Explain the right to equality"
- "What is Article 21?"

### Troubleshooting

**ChromaDB Connection Failed**

- Verify API key, tenant, and database name in `.env`
- Check if constitution data is loaded: `python test_query_COI.py`

**Empty Responses**

- Ensure Gemini API key is valid
- Check backend logs for errors
- Verify ChromaDB returns results

**Streaming Issues**

- Check browser console for SSE errors
- Ensure CORS is properly configured
- Verify BACKEND_URL environment variable

**Import Errors**

- Run `pip install chromadb` in the backend environment
- Check Python version (3.8+ required)

## Security Notes

- Never commit `.env` files
- Use environment variables for all credentials
- Implement rate limiting for production
- Add authentication for sensitive queries
- Monitor API usage and costs

## Performance Optimization

- ChromaDB vector search: ~100-200ms
- LLM response generation: 2-5 seconds (streaming)
- Total response time: 2-5 seconds with real-time updates

## API Rate Limits

- Gemini API: Check your quota
- ChromaDB Cloud: Check your plan limits
- Consider implementing request throttling

## License

This chatbot implementation is part of the Nyayika AI project.

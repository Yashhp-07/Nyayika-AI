# Nyayika AI ⚖️

**Nyayika AI** is an intelligent legal assistant designed to make the Indian Constitution and legal documents accessible to everyone. It combines a Retrieval-Augmented Generation (RAG) chatbot, a legal document analyzer, and a multi-language translation engine — all in one platform.

---

## ✨ Features

### 🤖 AI-Powered Constitutional Chatbot
- Ask questions about the Indian Constitution in plain English
- Retrieves the top 3 most relevant constitutional articles using semantic vector search (ChromaDB)
- Automatically rewrites and enriches user queries for better retrieval accuracy
- Streams AI-generated, context-aware answers in real-time via Server-Sent Events (SSE)
- Cites specific Article numbers and titles in every response
- Floating chat widget with typing indicators and quick-question shortcuts

### 📄 Legal Document Analyzer
- Upload PDF legal documents (drag-and-drop or file picker)
- Extracts text from PDFs using `pdfplumber`
- Supports image-based documents via OCR (`pytesseract` + `Pillow`)
- Generates a structured, bullet-point summary streamed in real-time
- Results page displays extracted text, summary, and translation side-by-side

### 🌐 Multi-Language Translation
- Translates extracted legal document text into:
  - Hindi (`hi`)
  - Gujarati (`gu`)
  - Marathi (`mr`)
  - Tamil (`ta`)
  - English (`en`)
- Translation streams in real-time using SSE
- Preserves legal terminology, structure, and formatting

### 🎨 Indian Legal UI Theme
- Color palette inspired by the Indian national flag and legal tradition:
  - Justice Navy (`#1B365D`), Saffron Gold (`#FF9933`), Ashok Green (`#138808`), Constitution Maroon (`#800020`)
- Fully responsive design for mobile and desktop
- Poppins font for clean, professional readability

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│                  Frontend                   │
│         Next.js 16 + Tailwind CSS 4         │
│                                             │
│  HeroHome (Upload + Chat) ──► Result Page   │
│  ChatWidget (SSE streaming chatbot)         │
└───────────────┬─────────────────────────────┘
                │ HTTP / SSE
┌───────────────▼─────────────────────────────┐
│                  Backend                    │
│            Django 5.2 REST API              │
│                                             │
│  /analyze/          → PDF text extraction   │
│  /stream_summary/   → AI summary (SSE)      │
│  /stream_translation/ → Translation (SSE)  │
│  /chatbot/          → RAG chatbot (SSE)     │
└───────────┬──────────────────┬──────────────┘
            │                  │
┌───────────▼──────┐  ┌────────▼──────────────┐
│   ChromaDB Cloud │  │  Google Gemini 2.5     │
│  Vector Database │  │  Flash (LLM)           │
│  (COI Articles)  │  │  via LangChain         │
└──────────────────┘  └───────────────────────┘
```

### RAG Pipeline (Chatbot)
1. **User Query** → query rewriting via Gemini + LangChain (`query_writer`)
2. **Vector Search** → ChromaDB semantic search over all constitutional articles
3. **Context Retrieval** → Top 3 relevant articles returned
4. **Response Generation** → Gemini 2.5 Flash streams an answer grounded in the retrieved articles
5. **Streaming** → Response chunks delivered to the frontend via SSE

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.0.1 | React framework (App Router) |
| [React](https://react.dev/) | 19.2.0 | UI component library |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first styling |
| [Poppins](https://fonts.google.com/specimen/Poppins) | — | Google Font via `next/font` |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| [Django](https://www.djangoproject.com/) | 5.2.8 | Web framework & REST API |
| [django-cors-headers](https://github.com/adamchainz/django-cors-headers) | 4.9.0 | CORS handling |
| [LangChain](https://www.langchain.com/) | 0.3.7 | LLM orchestration & prompt templates |
| [langchain-google-genai](https://python.langchain.com/docs/integrations/chat/google_generative_ai/) | 1.0.7 | Google Gemini integration |
| [google-generativeai](https://ai.google.dev/) | 0.8.5 | Gemini 2.5 Flash LLM |
| [ChromaDB](https://www.trychroma.com/) | 0.5.23 | Vector database (Cloud) for RAG |
| [pdfplumber](https://github.com/jsvine/pdfplumber) | 0.11.8 | PDF text extraction |
| [pytesseract](https://github.com/madmaze/pytesseract) | 0.3.13 | OCR for image-based documents |
| [Pillow](https://python-pillow.org/) | 12.0.0 | Image processing |
| [python-docx](https://python-docx.readthedocs.io/) | 1.2.0 | Word document support |
| [deep-translator](https://github.com/nidhaloff/deep-translator) | 1.11.4 | Multi-language translation |
| [Pydantic](https://docs.pydantic.dev/) | 2.12.4 | Data validation |
| [requests](https://requests.readthedocs.io/) | 2.32.5 | HTTP client |

### Infrastructure & Data
| Component | Details |
|---|---|
| **LLM** | Google Gemini 2.5 Flash (`temperature=0.3`) |
| **Vector DB** | ChromaDB Cloud — `COI_KnowledgeBase` collection |
| **Knowledge Base** | Full Constitution of India (`constitution_of_india.json`) — all articles and the Preamble |
| **Streaming** | Server-Sent Events (SSE) for real-time response delivery |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- A [ChromaDB Cloud](https://www.trychroma.com/) account

### 1. Clone the Repository
```bash
git clone https://github.com/Yashhp-07/Nyayika-AI.git
cd Nyayika-AI
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create the backend environment file
cp backend/nyayika/.env.example backend/nyayika/.env
# Then edit .env and fill in your credentials (see Environment Variables below)

# Load the Constitution of India into ChromaDB (first-time only)
python load_COI.py

# Start the Django development server
cd backend/nyayika
python manage.py runserver
```

### 3. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Create the frontend environment file
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local

# Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

### Backend (`backend/nyayika/.env`)
```env
GOOGLE_API_KEY=your_google_gemini_api_key
CHROMA_API_KEY=your_chroma_api_key
CHROMA_TENANT=your_chroma_tenant_id
CHROMA_DATABASE=COI_KnowledgeBase
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/analyze/` | Upload a PDF/image and extract text |
| `POST` | `/stream_summary/` | Stream an AI-generated summary (SSE) |
| `POST` | `/stream_translation/` | Stream a translated version of text (SSE) |
| `POST` | `/chatbot/` | RAG chatbot — query the Constitution (SSE) |

---

## 🗂️ Project Structure

```
Nyayika-AI/
├── backend/
│   └── nyayika/
│       ├── main/
│       │   ├── views.py        # API endpoints
│       │   ├── utils.py        # LLM, ChromaDB, RAG logic
│       │   └── urls.py         # URL routing
│       └── nyayika/
│           └── settings.py     # Django settings
├── frontend/
│   └── app/
│       ├── components/
│       │   ├── HeroHome.js     # Main upload + hero section
│       │   ├── ChatWidget.js   # Floating AI chatbot widget
│       │   ├── FileUpload.js   # PDF upload component
│       │   └── Footer.js       # Page footer
│       ├── result/[id]/
│       │   └── page.js         # Document analysis results page
│       ├── layout.js           # Root layout (font, footer)
│       └── page.js             # Home page
├── constitution_of_india.json  # Full COI knowledge base
├── load_COI.py                 # Script to load COI into ChromaDB
├── test_query_COI.py           # Script to test ChromaDB queries
├── requirements.txt            # Python dependencies
└── CHATBOT_SETUP.md            # Detailed chatbot setup guide
```

---

## 🧪 Testing

```bash
# Test ChromaDB connection and vector search
python test_query_COI.py
```

Sample questions to try in the chatbot:
- *"What is Article 14?"*
- *"Tell me about fundamental rights"*
- *"What is Article 21 about?"*
- *"Explain the right to equality"*
- *"What are property rights in India?"*

---

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use environment variables for all API keys and credentials
- Add rate limiting and authentication before deploying to production
- The Django `SECRET_KEY` and `DEBUG=True` settings must be changed for production

---

## 🗺️ Roadmap

- [ ] Chat history persistence
- [ ] Multi-turn conversation context
- [ ] Article deep-links and references
- [ ] Voice input support
- [ ] Export chat transcript
- [ ] User authentication
- [ ] Rate limiting
- [ ] Support for `.docx` legal document uploads

---

## 📄 License

This project is part of the Nyayika AI initiative. See [CHATBOT_SETUP.md](./CHATBOT_SETUP.md) for detailed chatbot architecture and setup documentation.

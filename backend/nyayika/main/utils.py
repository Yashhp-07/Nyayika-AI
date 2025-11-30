import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
import chromadb

# Load .env file from the correct location
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

GEMINI_KEY = os.environ.get("GOOGLE_API_KEY")

llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=GEMINI_KEY,
            temperature=0.3
)

if not GEMINI_KEY:
    print("Api key not found")
else:
    print("API key connected")

# Initialize ChromaDB Cloud Client
CHROMA_API_KEY = os.environ.get("CHROMA_API_KEY", "ck-2uBdu4pFW2WN4JeMt9CG3hhCMWzQ4a5P1G4URyvmMXfj")
CHROMA_TENANT = os.environ.get("CHROMA_TENANT", "92add8b6-0761-4da6-91f7-3665e71e3c72")
CHROMA_DATABASE = os.environ.get("CHROMA_DATABASE", "COI_KnowledgeBase")

try:
    chroma_client = chromadb.CloudClient(
        api_key=CHROMA_API_KEY,
        tenant=CHROMA_TENANT,
        database=CHROMA_DATABASE
    )
    constitution_collection = chroma_client.get_collection(name="constitution_of_india")
    print("ChromaDB connected successfully")
except Exception as e:
    print(f"ChromaDB connection error: {str(e)}")
    constitution_collection = None

def translate_text(text, target_language):
    prompt = f"""
    You are a professional legal translator specializing in accurate, faithful, and context-preserving translation.

    YOUR TASK:
    Translate the following legal document into the language: <b>{target_language}</b>

    TRANSLATION RULES:
    - Translate EXACTLY, without summarizing or shortening.
    - Preserve all legal meaning, tone, terminology, structure, parties, dates, case numbers, and monetary amounts.
    - Translate the text into clear, well-structured BULLET POINTS starting with the symbol •
    - After each bullet point, insert <br><br> for clean formatting.
    - Use <b>HTML bold tags</b> *very sparingly* and ONLY for:
        • Case numbers  
        • Party names  
        • Important dates  
        • Key legal sections  
        • Monetary amounts  
    - DO NOT bold random nouns or common words.
    - DO NOT introduce new content or assumptions.
    - Maintain the natural paragraph flow—convert each logical idea into a bullet point.

    OUTPUT FORMAT (must follow exactly):
    • First translated point with a carefully placed <b>critical detail</b>.<br><br>
    • Second translated point with another <b>important element</b>.<br><br>
    • Third translated point, etc.<br><br>

    TEXT TO TRANSLATE:
    {text}

    Now produce the FULL translation in bullet-point format following all rules above:
    """
    translated_text = llm.invoke(prompt)
    return translated_text.content


def translate_text_stream(text: str, target_language: str):
    """Generator that yields translation chunks using LangChain streaming"""
    try:
        prompt = f"""
        You are a professional legal translator specializing in accurate, faithful, and context-preserving translation.

        YOUR TASK:
        Translate the following legal document into the language: <b>{target_language}</b>

        TRANSLATION RULES:
        - Translate EXACTLY, without summarizing or shortening.
        - Preserve all legal meaning, tone, terminology, structure, parties, dates, case numbers, and monetary amounts.
        - Translate the text into clear, well-structured BULLET POINTS starting with the symbol •
        - After each bullet point, insert <br><br> for clean formatting.
        - Use <b>HTML bold tags</b> *very sparingly* and ONLY for:
            • Case numbers  
            • Party names  
            • Important dates  
            • Key legal sections  
            • Monetary amounts  
        - DO NOT bold random nouns or common words.
        - DO NOT introduce new content or assumptions.
        - Maintain the natural paragraph flow—convert each logical idea into a bullet point.

        OUTPUT FORMAT (must follow exactly):
        • First translated point with a carefully placed <b>critical detail</b>.<br><br>
        • Second translated point with another <b>important element</b>.<br><br>
        • Third translated point, etc.<br><br>

        TEXT TO TRANSLATE:
        {text}

        Now produce the FULL translation in bullet-point format following all rules above:
        """
        
        # Stream the response
        for chunk in llm.stream(prompt):
            if hasattr(chunk, 'content'):
                yield chunk.content
            elif isinstance(chunk, str):
                yield chunk
                
    except Exception as e:
        yield f"Error translating text: {str(e)}"




def generate_summary(text: str) -> str:
    print("Generating summary...")
    """
    Generate a key summary of the provided text using Gemini 2.5 Flash model.
    
    Args:
        text: The extracted text to summarize
        
    Returns:
        A summary of the text
    """
    try:
        # api_key = os.getenv("GOOGLE_API_KEY")
        # if not api_key:
        #     return "Error: GOOGLE_API_KEY not found in environment variables"
                
        # Create prompt template
        prompt_template = PromptTemplate(
            input_variables=["text"],
            template="""You are a legal document analyzer. Provide a well-structured, concise summary of the following text.

            FORMATTING INSTRUCTIONS:
            - Use <b>text</b> HTML tags SPARINGLY to bold ONLY the most critical terms: case numbers, key legal terms, specific names of parties, important dates, and monetary amounts
            - Do NOT bold common words or entire phrases - be selective and bold only 2-3 key words per bullet point
            - Organize the summary into clear bullet points using • symbol
            - Put each bullet point on a NEW LINE with <br><br> tags between them for proper spacing
            - Keep each point concise (1-2 sentences maximum)
            - Start with the document type/purpose if identifiable
            - Focus on: parties involved, case numbers, dates, amounts, obligations, and key outcomes
            - Do not use any markdown formatting (**, ##, etc.) - only HTML tags
            
            EXAMPLE FORMAT:
            • First point with <b>only key term</b> bolded.<br><br>
            • Second point with <b>important detail</b> highlighted.<br><br>
            • Third point mentioning <b>critical information</b>.<br><br>

            Text: {text}

            Provide a structured summary:"""
        )
        
        # Create chain using LCEL
        chain = prompt_template | llm | StrOutputParser()
        
        # Generate summary
        summary = chain.invoke({"text": text})
        
        return summary.strip()
        
    except Exception as e:
        return f"Error generating summary: {str(e)}"
    

def generate_summary_stream(text: str):
    """Generator that yields summary chunks using LangChain streaming"""
    try:
        # Create prompt template
        prompt_template = PromptTemplate(
            input_variables=["text"],
            template="""You are a legal document analyzer. Provide a well-structured, concise summary of the following text.

            FORMATTING INSTRUCTIONS:
            - Use <b>text</b> HTML tags SPARINGLY to bold ONLY the most critical terms: case numbers, key legal terms, specific names of parties, important dates, and monetary amounts
            - Do NOT bold common words or entire phrases - be selective and bold only 2-3 key words per bullet point
            - Organize the summary into clear bullet points using • symbol
            - Put each bullet point on a NEW LINE with <br><br> tags between them for proper spacing
            - Keep each point concise (1-2 sentences maximum)
            - Start with the document type/purpose if identifiable
            - Focus on: parties involved, case numbers, dates, amounts, obligations, and key outcomes
            - Do not use any markdown formatting (**, ##, etc.) - only HTML tags
            
            EXAMPLE FORMAT:
            • First point with <b>only key term</b> bolded.<br><br>
            • Second point with <b>important detail</b> highlighted.<br><br>
            • Third point mentioning <b>critical information</b>.<br><br>

            Text: {text}

            Provide a structured summary:"""
        )
        
        # Create chain using LCEL
        chain = prompt_template | llm
        
        # Stream the response
        for chunk in chain.stream({"text": text}):
            if hasattr(chunk, 'content'):
                yield chunk.content
            elif isinstance(chunk, str):
                yield chunk
                
    except Exception as e:
        yield f"Error generating summary: {str(e)}"


def query_constitution(question: str, n_results: int = 3) -> dict:
    """
    Query the Constitution of India knowledge base using ChromaDB.
    
    Args:
        question: The user's question about Indian Constitution
        n_results: Number of relevant results to retrieve
        
    Returns:
        Dictionary containing relevant articles and their content
    """
    try:
        if constitution_collection is None:
            return {"error": "ChromaDB not connected"}
        
        # Query the collection
        results = constitution_collection.query(
            query_texts=[question],
            n_results=n_results
        )
        
        # Format the results
        formatted_results = []
        for i, doc in enumerate(results['documents'][0]):
            metadata = results['metadatas'][0][i]
            formatted_results.append({
                'article': metadata.get('article', 'N/A'),
                'title': metadata.get('title', 'N/A'),
                'content': doc
            })
        
        return {
            'success': True,
            'results': formatted_results,
            'count': len(formatted_results)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f"Error querying constitution: {str(e)}"
        }


def generate_chat_response(question: str, context: list) -> str:
    """
    Generate a simple, easy-to-understand chatbot response based on the user's question
    and retrieved context. If the provided context does not contain relevant info,
    strictly state that and do not guess.
    """
    try:
        # If no context or no usable content, return a clear simple message
        if not context or all(not (item.get('content') or "").strip() for item in context):
            return "I don't have enough information in the provided documents to answer this question. Please provide more context or try a different query."

        # Build context string from retrieved articles
        context_str = "\n\n".join([
            f"Article {item.get('article','N/A')}: {item.get('title','N/A')}\n{item.get('content','')}"
            for item in context
        ])

        prompt = f"""You are a clear and simple AI assistant who explains the Indian Constitution in plain language for common people in India.
Answer the user's question ONLY using the constitutional text given below. Do NOT add any outside information or guesses.

USER QUESTION:
{question}

PROVIDED CONSTITUTIONAL TEXT:
{context_str}

INSTRUCTIONS:
- Use very simple, everyday English that a common person in India can understand.
- Keep sentences short and clear.
- Reference specific Article numbers when you mention them (e.g., "Article 21 says ...").
- If the provided text does not contain enough information to answer, say exactly:
  "I don't have enough information in the provided documents to answer this question."
  and do not make up anything.
- If you can answer, be brief and to the point. Use a couple of bullet points or short paragraphs.

Now provide the answer:"""

        response = llm.invoke(prompt)
        return response.content

    except Exception as e:
        return f"Error generating response: {str(e)}"
    

def query_writer(query: str) -> str:
    """
    Rewrites the user query using Gemini 2.5 Flash and LangChain.
    """
    rewrite_prompt = PromptTemplate(
    input_variables=["query"],
    template="""
        You are a query rewriting system for a semantic search engine.
        Rewrite the user query to add clarity, context, and missing details.
        The rewritten query MUST preserve the user's intention.

        If the input includes an article number (e.g., "article 7"), 
        rewrite it to explicitly reference the content that article covers.

        Examples:
        User: "explain article 21"
        Rewrite: "Explain Article 21 of the Constitution of India, which deals with the protection of life and personal liberty."

        User: "article 7 meaning"
        Rewrite: "Explain Article 7 of the Constitution of India, which covers rights of citizenship for persons migrating to Pakistan."

        User Query: "{query}"

        Rewrite:
        """,
        )
    
    rewritten = llm.invoke(rewrite_prompt.format(query=query)).content
    return rewritten.strip()


def generate_chat_response_stream(question: str, context: list):
    """
    Stream chatbot response based on the user's question and retrieved context.
    
    Args:
        question: The user's question
        context: List of relevant articles from ChromaDB
        
    Yields:
        Chunks of the AI-generated response
    """
    try:
        # Build context string from retrieved articles
        context_str = "\n\n".join([
            f"**Article {item['article']}: {item['title']}**\n{item['content']}"
            for item in context
        ])
        
        prompt = f"""You are a knowledgeable AI assistant specializing in the Indian Constitution. 
You help users understand their constitutional rights, laws, and legal provisions.

USER QUESTION:
{question}

RELEVANT CONSTITUTIONAL PROVISIONS:
{context_str}

FORMATTING INSTRUCTIONS:
- Structure your response with clear sections and bullet points
- Use **bold** for key terms like: Article numbers, legal terms, important rights, dates, and critical provisions
- Use bullet points (•) for listing items or provisions
- Add line breaks between sections for better readability
- Use numbered lists (1., 2., 3.) for step-by-step explanations or sequential information
- Highlight important provisions or rights
- Use subheadings when appropriate (e.g., **Key Points:**, **Important Rights:**, **Safeguards:**, **Definitions:**)

CONTENT INSTRUCTIONS:
- Answer based ONLY on the provided constitutional provisions
- Be clear, concise, and accurate
- Use simple, accessible language
- If the context doesn't contain enough information, state this honestly
- Always reference specific Article numbers when mentioning provisions
- Explain legal terms in simple language when first mentioned

EXAMPLE FORMAT:
**Answer:**

Based on the constitutional provisions, here's what you need to know:

**Key Points:**
• **Article X** states that [explanation]
• **Article Y** provides for [explanation]

**Important Rights:**
1. **Right to [X]** - [explanation]
2. **Right to [Y]** - [explanation]

**Safeguards:**
• [Point 1]
• [Point 2]

**Definitions:**
• **Term X:** [definition]
• **Term Y:** [definition]

Provide your well-structured response:"""
        
        # Stream the response
        for chunk in llm.stream(prompt):
            if hasattr(chunk, 'content'):
                yield chunk.content
            elif isinstance(chunk, str):
                yield chunk
                
    except Exception as e:
        yield f"Error generating response: {str(e)}"

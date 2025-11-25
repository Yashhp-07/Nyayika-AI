import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

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

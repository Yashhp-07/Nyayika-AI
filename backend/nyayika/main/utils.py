import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Load environment variables
load_dotenv()

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
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return "Error: GOOGLE_API_KEY not found in environment variables"
        
        # Initialize Gemini 2.5 Flash model
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0.3
        )
        
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

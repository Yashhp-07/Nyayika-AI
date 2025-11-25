import chromadb
import json
from typing import List, Dict


# Initialize ChromaDB Cloud Client
client = chromadb.CloudClient(
    api_key='ck-2uBdu4pFW2WN4JeMt9CG3hhCMWzQ4a5P1G4URyvmMXfj',
    tenant='92add8b6-0761-4da6-91f7-3665e71e3c72',
    database='COI_KnowledgeBase'
)

def main():
    collection_name = "constitution_of_india"
    try:
        collection = client.get_collection(name=collection_name)
        print(f"Using existing collection: {collection_name}")
    except:
        print(f"Collection {collection_name} does not exist. Please upload data first.")
        return

    print("Testing RAG Query")
    print("="*60)
    
    test_query = "What are the rights for the migrations from pakistan to India?"
    print(f"\nQuery: {test_query}")
    
    results = collection.query(
        query_texts=[test_query],
        n_results=3
    )
    
    for i, doc in enumerate(results['documents'][0]):
        metadata = results['metadatas'][0][i]
        print(f"\nResult {i+1}:")
        print(f"Article: {metadata['article']}, Title: {metadata['title']}")
        print(f"Content:\n{doc}")
        print("-"*40)

if __name__ == "__main__":
    main()
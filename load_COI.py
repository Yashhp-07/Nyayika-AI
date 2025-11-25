import chromadb
import json
from typing import List, Dict

# Initialize ChromaDB Cloud Client
client = chromadb.CloudClient(
    api_key='ck-2uBdu4pFW2WN4JeMt9CG3hhCMWzQ4a5P1G4URyvmMXfj',
    tenant='92add8b6-0761-4da6-91f7-3665e71e3c72',
    database='COI_KnowledgeBase'
)

def load_constitution_data(file_path: str) -> List[Dict]:
    """Load Constitution of India JSON data"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def upload_to_chromadb(collection_name: str = "constitution_of_india"):
    """Upload Constitution of India to ChromaDB for RAG"""
    
    # Load the constitution data
    print("Loading Constitution of India data...")
    coi_data = load_constitution_data('constitution_of_india.json')
    print(f"Loaded {len(coi_data)} articles")
    
    # Get or create collection
    try:
        collection = client.get_collection(name=collection_name)
        print(f"Using existing collection: {collection_name}")
    except:
        collection = client.create_collection(
            name=collection_name,
            metadata={"description": "Constitution of India - Full text for RAG"}
        )
        print(f"Created new collection: {collection_name}")
    
    # Prepare documents, metadatas, and ids
    documents = []
    metadatas = []
    ids = []
    
    for item in coi_data:
        article_num = item.get('article', 0)
        title = item.get('title', '')
        description = item.get('description', '')
        
        # Create a comprehensive document for better RAG retrieval
        document_text = f"Article {article_num}: {title}\n\n{description}"
        
        documents.append(document_text)
        metadatas.append({
            'article': str(article_num),
            'title': title,
            'type': 'Preamble' if article_num == 0 else 'Article'
        })
        ids.append(f"article_{article_num}")
    
    # Upload in batches (ChromaDB recommends batch size of ~100-500)
    batch_size = 100
    total_batches = (len(documents) + batch_size - 1) // batch_size
    
    print(f"\nUploading {len(documents)} documents in {total_batches} batches...")
    
    for i in range(0, len(documents), batch_size):
        batch_end = min(i + batch_size, len(documents))
        batch_num = (i // batch_size) + 1
        
        collection.add(
            documents=documents[i:batch_end],
            metadatas=metadatas[i:batch_end],
            ids=ids[i:batch_end]
        )
        
        print(f"Uploaded batch {batch_num}/{total_batches} ({batch_end}/{len(documents)} documents)")
    
    print(f"\n✅ Successfully uploaded {len(documents)} articles to ChromaDB!")
    print(f"Collection: {collection_name}")
    print(f"Total count in collection: {collection.count()}")
    
    return collection

def test_query(collection):
    """Test the RAG with a sample query"""
    print("\n" + "="*60)
    print("Testing RAG Query")
    print("="*60)
    
    test_query = "What are the rights of citizens migrating to India from Pakistan?"
    print(f"\nQuery: {test_query}")
    
    results = collection.query(
        query_texts=[test_query],
        n_results=3
    )
    
    print("\nTop 3 Results:")
    for i, (doc, metadata) in enumerate(zip(results['documents'][0], results['metadatas'][0]), 1):
        print(f"\n{i}. Article {metadata['article']}: {metadata['title']}")
        print(f"   {doc[:200]}...")
    
    return results

if __name__ == "__main__":
    # Upload Constitution of India to ChromaDB
    collection = upload_to_chromadb()
    
    # Test with a sample query
    test_query(collection)
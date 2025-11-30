#!/usr/bin/env python3
"""
Test script to diagnose the chatbot endpoint error
"""
import sys
import os

# Add the backend path
sys.path.insert(0, '/Users/sanketpatel/Desktop/Nyayika-AI/backend/nyayika')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nyayika.settings')

import django
django.setup()

# Now test the imports
try:
    print("Testing imports...")
    from main.utils import query_writer, query_constitution, generate_chat_response_stream
    print("✓ All imports successful")
    
    # Test query_writer
    print("\nTesting query_writer...")
    test_question = "What is Article 21?"
    rewritten = query_writer(test_question)
    print(f"Original: {test_question}")
    print(f"Rewritten: {rewritten}")
    
    # Test query_constitution
    print("\nTesting query_constitution...")
    result = query_constitution(rewritten, n_results=3)
    print(f"Query result success: {result.get('success')}")
    if result.get('success'):
        print(f"Number of results: {result.get('count')}")
        print(f"First article: {result['results'][0]['article']}")
    else:
        print(f"Error: {result.get('error')}")
    
    print("\n✓ All tests passed!")
    
except Exception as e:
    print(f"\n✗ Error occurred: {type(e).__name__}")
    print(f"Error message: {str(e)}")
    import traceback
    traceback.print_exc()

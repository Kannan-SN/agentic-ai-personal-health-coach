from backend.config import main as config
from typing import List
import numpy as np
from langchain_google_genai import GoogleGenerativeAIEmbeddings

embedding_model = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", 
    google_api_key=config.GEMINI_API_KEY
)

def get_text_embedding(text: str) -> List[float]:
    """
    Generates an embedding for health-related text content.
    Useful for exercise similarity, meal matching, etc.
    """
    return embedding_model.embed_query(text)

def get_batch_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Generates embeddings for multiple health content items.
    """
    return embedding_model.embed_documents(texts)

def calculate_similarity(embedding1: List[float], embedding2: List[float]) -> float:
    """
    Calculate cosine similarity between two embeddings.
    Useful for finding similar exercises or meals.
    """
    np_emb1 = np.array(embedding1)
    np_emb2 = np.array(embedding2)
    
    dot_product = np.dot(np_emb1, np_emb2)
    norm1 = np.linalg.norm(np_emb1)
    norm2 = np.linalg.norm(np_emb2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return dot_product / (norm1 * norm2)

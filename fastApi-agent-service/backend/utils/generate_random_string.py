# backend/utils/generate_random_string.py
import random
import string

def generate_random_string(n: int) -> str:
    """Generate random string for health plan IDs, session tokens, etc."""
    characters = string.ascii_letters + string.digits  # a-zA-Z0-9
    return ''.join(random.choices(characters, k=n)).upper()

def generate_plan_code(length: int = 8) -> str:
    """Generate a unique code for health plans"""
    return "HP-" + generate_random_string(length)

def generate_workout_id(length: int = 6) -> str:
    """Generate unique workout identifiers"""
    return "WO-" + generate_random_string(length)

def generate_meal_id(length: int = 6) -> str:
    """Generate unique meal identifiers"""
    return "ML-" + generate_random_string(length)

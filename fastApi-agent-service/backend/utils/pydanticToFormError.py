import json
from pprint import pprint

def pydantic_to_form_error(json_data):
    """
    Converts Pydantic validation errors to frontend-friendly format
    Useful for health form validations
    """
    if isinstance(json_data, str):
        json_data = json.loads(json_data)

    error = {}
    for item in json_data:
        loc = item.get("loc")
        msg = item.get("msg")
        type = item.get("type")

        for l in loc:
            error[l] = msg

    return error

def format_health_validation_error(error_dict: dict) -> dict:
    """
    Format health-specific validation errors with helpful messages
    """
    formatted_errors = {}
    
    health_field_messages = {
        "age": "Please provide a valid age between 13 and 100",
        "current_activity_level": "Please select your current activity level",
        "primary_goal": "Please select your primary health goal",
        "time_availability_minutes": "Please specify available workout time (10-120 minutes)",
        "dietary_restrictions": "Please select any applicable dietary restrictions",
        "health_conditions": "Please list any relevant health conditions for safety"
    }
    
    for field, error in error_dict.items():
        if field in health_field_messages:
            formatted_errors[field] = health_field_messages[field]
        else:
            formatted_errors[field] = error
            
    return formatted_errors
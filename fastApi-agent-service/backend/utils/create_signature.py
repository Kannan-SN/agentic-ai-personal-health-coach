import json
import hmac
import hashlib
from datetime import datetime

from backend.config import main as config


def create_hmac_signature(body: dict = {}, query: dict = {}, mode: str = "body"):
    timestamp = int(datetime.timestamp(datetime.utcnow()) * 1000)

    if mode == "body":
        message = json.dumps(body, separators=(",", ":")) + str(timestamp)
    elif mode == "query":
        message = json.dumps(query, separators=(",", ":")) + str(timestamp)
    elif mode == "both":
        message = json.dumps(query, separators=(",", ":")) + json.dumps(body) + str(timestamp)
    else:
        raise ValueError("Invalid mode for signature creation")
    
    message = message.encode('utf-8')
    
    signature = hmac.new(config.HMAC_AGENT_KEY.encode('utf-8'), message, hashlib.sha256).hexdigest()
    return {"signature": signature, "timestamp": timestamp}
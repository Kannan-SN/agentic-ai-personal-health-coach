import mimetypes
import fitz  
from docx import Document
from io import BytesIO

def read_file_safely_from_bytes(file_bytes: bytes, filename: str) -> str:
    """
    Safely extract text from uploaded health documents (medical reports, etc.)
    """
    mime_type, _ = mimetypes.guess_type(filename)
    ext = filename.lower().split('.')[-1]

    if mime_type is None:
        if ext == "pdf":
            return extract_text_from_pdf(BytesIO(file_bytes))
        elif ext == "docx":
            return extract_text_from_docx(BytesIO(file_bytes))
        else:
            return extract_text_from_generic(BytesIO(file_bytes))

    if mime_type.startswith("text"):
        return extract_text_from_generic(BytesIO(file_bytes))
    elif mime_type == "application/pdf":
        return extract_text_from_pdf(BytesIO(file_bytes))
    elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return extract_text_from_docx(BytesIO(file_bytes))
    else:
        return extract_text_from_generic(BytesIO(file_bytes))

def extract_text_from_generic(file_stream: BytesIO) -> str:
    raw = file_stream.read()
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        try:
            return raw.decode("latin1")
        except UnicodeDecodeError:
            return raw.decode("utf-8", errors="replace")

def extract_text_from_pdf(file_stream: BytesIO) -> str:
    doc = fitz.open(stream=file_stream, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text.strip()

def extract_text_from_docx(file_stream: BytesIO) -> str:
    doc = Document(file_stream)
    return "\n".join([para.text for para in doc.paragraphs]).strip()

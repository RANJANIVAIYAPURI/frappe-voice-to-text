import frappe
import os
import requests
from frappe.model.document import Document

class VoiceRecording(Document):
    pass

@frappe.whitelist()
def transcribe_audio(docname):
    from faster_whisper import WhisperModel
    import os

    doc = frappe.get_doc("Voice Recording", docname)

    if not doc.audio_file:
        frappe.throw("No audio file found attached to this document.")

    file_path = frappe.get_site_path(
        "public",
        doc.audio_file.lstrip("/")
    )

    if not os.path.exists(file_path):
        frappe.throw(f"Audio file not found: {file_path}")

    try:
        doc.status = "Processing"
        doc.save()
        frappe.db.commit()

        # Voice Recording.language is a Link to the Language DocType.
        # Get the Whisper language code from the selected Language record.
        language_code = "en"

        if doc.language:
            language_doc = frappe.get_doc("Language", doc.language)
            language_code = language_doc.language_code or doc.language

        frappe.log_error(
            title="Voice Transcription",
            message=f"Starting local Whisper transcription | Language: {doc.language} | Code: {language_code} | File: {file_path}"
        )

        model = WhisperModel(
            "tiny",
            device="cpu",
            compute_type="int8"
        )

        segments, info = model.transcribe(
            file_path,
            language=language_code,
            task="transcribe"
        )

        transcript = " ".join(
            segment.text.strip()
            for segment in segments
        ).strip()

        doc.transcript = transcript
        doc.status = "Completed"
        doc.save()
        frappe.db.commit()

        return {
            "status": "Completed",
            "language": doc.language,
            "language_code": language_code,
            "detected_language": info.language,
            "transcript": transcript
        }

    except Exception as e:
        doc.status = "Failed"
        doc.transcript = str(e)
        doc.save()
        frappe.db.commit()

        frappe.log_error(
            title="Local Transcription Failed",
            message=frappe.get_traceback()
        )

        frappe.throw(str(e))


import base64
import frappe
from frappe.utils.file_manager import save_file

@frappe.whitelist()
def upload_voice_recording(file_name, filedata, doctype, docname):
    # Strip the data URL prefix if present (e.g. "data:audio/webm;base64,...")
    if "," in filedata:
        filedata = filedata.split(",")[1]
        
    # Decode base64 to binary
    file_bytes = base64.b64decode(filedata)
    
    # Securely save the file and attach it to the document
    saved_file = save_file(
        fname=file_name,
        content=file_bytes,
        dt=doctype,
        dn=docname,
        is_private=0
    )
    
    return saved_file

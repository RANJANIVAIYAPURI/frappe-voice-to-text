import base64

import frappe
from frappe.model.document import Document
from frappe.utils.file_manager import save_file


class VoiceRecording(Document):
    pass


@frappe.whitelist()
def upload_voice_recording(file_name, filedata, docname):
    """
    Save a base64 encoded voice recording and attach it
    to the current Voice Recording document.
    """

    if not file_name:
        frappe.throw("File name is required")

    if not filedata:
        frappe.throw("File data is required")

    if not docname:
        frappe.throw("Voice Recording document name is required")

    # Remove data URL prefix:
    # data:audio/webm;base64,XXXX
    if "," in filedata:
        filedata = filedata.split(",", 1)[1]

    try:
        file_bytes = base64.b64decode(filedata)
    except Exception:
        frappe.throw("Invalid base64 audio data")

    saved_file = save_file(
        fname=file_name,
        content=file_bytes,
        dt="Voice Recording",
        dn=docname,
        is_private=0
    )

    return {
        "name": saved_file.name,
        "file_url": saved_file.file_url,
        "file_name": saved_file.file_name
    }

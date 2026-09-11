Absolutely. For your GitHub repository **`frappe-voice-to-text`**, you can use the following detailed `README.md`.

It is written so that another developer can understand the project, install it, configure it, and use the Voice Recording API without needing to know your previous setup.

````markdown
# Frappe Voice-to-Text

A custom Frappe Framework application that provides audio recording, audio upload, and speech-to-text transcription using **Faster-Whisper** locally.

The application is designed to work with Frappe/ERPNext/Healthcare-based systems and provides a custom **Voice Recording** DocType with backend APIs for audio upload and transcription.

---

## Features

- Custom Frappe application for Voice-to-Text
- Custom `Voice Recording` DocType
- Audio file attachment support
- Local speech-to-text transcription
- Uses Faster-Whisper
- No OpenAI API dependency
- CPU-based transcription support
- Multiple language support
- Uses the existing Frappe `Language` DocType
- Stores transcription result in the document
- Processing status tracking
- Backend API for audio upload
- Backend API for transcription
- Frappe permission and authentication support
- Can be integrated with web, mobile, or other frontend applications

---

# Architecture

The application follows a simple backend-driven architecture.

```text
Frontend / Mobile App
        |
        | Frappe API
        v
Frappe Framework
        |
        v
Voice Recording DocType
        |
        +-------------------+
        |                   |
        v                   v
   Audio File          Language DocType
        |
        v
 Faster-Whisper
        |
        v
   Transcript
````

The frontend is responsible for:

* Sending API requests
* Uploading audio
* Selecting language
* Displaying processing status
* Displaying the transcription
* Handling API errors

The backend is responsible for:

* Validating the request
* Saving the audio file
* Reading the selected language
* Running Faster-Whisper
* Generating the transcript
* Updating document status
* Storing the transcript

Business logic should remain in the Frappe backend.

---

# Technology Stack

| Technology           | Purpose                    |
| -------------------- | -------------------------- |
| Frappe Framework v16 | Backend framework          |
| Python               | Backend programming        |
| Faster-Whisper       | Speech-to-text             |
| CTranslate2          | Whisper inference engine   |
| MariaDB              | Database                   |
| Redis                | Frappe background services |
| FFmpeg               | Audio processing           |
| Frappe REST/RPC API  | Frontend integration       |

---

# Application Information

Application name:

```text
voice_to_text
```

Repository name:

```text
frappe-voice-to-text
```

Current application version:

```text
0.0.1
```

Compatible Frappe branch:

```text
version-16
```

---

# Requirements

Before installing the application, make sure the server has:

* Ubuntu/Linux server
* Python
* Node.js
* MariaDB
* Redis
* Frappe Bench
* Frappe Framework v16
* FFmpeg

The application is designed for a Frappe v16 environment.

---

# FFmpeg Installation

Faster-Whisper requires audio processing support.

Install FFmpeg:

```bash
sudo apt-get update
sudo apt-get install -y ffmpeg
```

Verify:

```bash
ffmpeg -version
```

---

# Faster-Whisper Installation

Install Faster-Whisper inside the Frappe Bench Python environment:

```bash
cd ~/frappe-bench

./env/bin/pip install faster-whisper
```

Verify the installation:

```bash
./env/bin/python -c "from faster_whisper import WhisperModel; print('faster-whisper OK')"
```

Expected output:

```text
faster-whisper OK
```

---

# Installation

## 1. Go to the Frappe Bench

```bash
cd ~/frappe-bench
```

---

## 2. Get the application

If the repository is hosted on GitHub:

```bash
bench get-app https://github.com/<your-username>/frappe-voice-to-text.git
```

Replace:

```text
<your-username>
```

with your GitHub username.

---

## 3. Install the application on the site

```bash
bench --site healthcare.in install-app voice_to_text
```

Replace `healthcare.in` with your Frappe site name if required.

---

## 4. Check installed applications

```bash
bench --site healthcare.in list-apps
```

You should see:

```text
frappe
erpnext
healthcare
voice_to_text
```

---

# Application Structure

The application follows the Frappe app structure.

```text
voice_to_text/
│
├── README.md
├── setup.py
├── license.txt
│
└── voice_to_text/
    │
    ├── hooks.py
    ├── modules.txt
    ├── __init__.py
    │
    └── voice_to_text/
        │
        ├── __init__.py
        │
        └── doctype/
            │
            └── voice_recording/
                │
                ├── __init__.py
                ├── voice_recording.py
                ├── voice_recording.js
                └── voice_recording.json
```

> The exact folder structure may differ depending on how the Frappe app was initially created. The important part is that the `Voice Recording` DocType is located inside the active Frappe module.

---

# Voice Recording DocType

The application provides a custom DocType:

```text
Voice Recording
```

The DocType stores the audio file and its transcription result.

---

# Voice Recording Fields

| Field             | Type         | Purpose                                             |
| ----------------- | ------------ | --------------------------------------------------- |
| Title             | Data         | Name/title of the recording                         |
| Language          | Link         | Selects a language from Frappe's `Language` DocType |
| Status            | Select       | Tracks transcription state                          |
| Audio Recorder UI | HTML         | Recording interface area                            |
| Audio File        | Attach Audio | Stores uploaded audio                               |
| Transcript        | Text Editor  | Stores the generated transcription                  |
| Transcribe        | Button       | Starts transcription                                |

---

# Status Flow

The Voice Recording document follows this status flow:

```text
Draft
  |
  v
Processing
  |
  +-------> Completed
  |
  +-------> Failed
```

## Draft

The document has been created but transcription has not started.

## Processing

Faster-Whisper is currently processing the audio.

## Completed

Transcription completed successfully.

## Failed

An error occurred during transcription.

---

# Language Support

The `Language` field is a Link field connected to Frappe's existing:

```text
Language
```

DocType.

The application does not create a separate language master.

The selected Language record is used to obtain the language code required by Faster-Whisper.

For example:

| Language  | Code |
| --------- | ---- |
| English   | `en` |
| Tamil     | `ta` |
| Hindi     | `hi` |
| Telugu    | `te` |
| Kannada   | `kn` |
| Malayalam | `ml` |
| Marathi   | `mr` |
| Bengali   | `bn` |
| Gujarati  | `gu` |
| Urdu      | `ur` |
| Arabic    | `ar` |
| Spanish   | `es` |
| French    | `fr` |
| German    | `de` |

Faster-Whisper supports many additional languages.

The actual available language list is controlled by the Frappe `Language` DocType and Faster-Whisper language support.

---

# How Language Mapping Works

When a user selects a language:

```text
Voice Recording
       |
       v
Language
       |
       v
Language DocType
       |
       v
language_code
       |
       v
Faster-Whisper
```

For example:

```text
Selected Language:
Tamil

Language Code:
ta
```

The backend sends:

```python
language="ta"
```

to Faster-Whisper.

For Hindi:

```python
language="hi"
```

For Telugu:

```python
language="te"
```

For Kannada:

```python
language="kn"
```

For Malayalam:

```python
language="ml"
```

---

# Faster-Whisper

This application uses:

```text
Faster-Whisper
```

instead of the OpenAI Whisper API.

This means transcription can run locally on the server.

---

# Why Faster-Whisper?

Advantages:

* No external transcription API required
* No OpenAI API key required
* No external API credit required
* Audio remains on the server
* Supports multiple languages
* Can run on CPU
* Can use GPU when available
* Suitable for self-hosted applications

---

# Current Whisper Model

The current implementation uses:

```python
WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8"
)
```

The `tiny` model is selected for lower resource usage and faster testing.

Other Faster-Whisper models can be used later:

```text
tiny
base
small
medium
large-v3
```

Larger models generally provide better transcription quality but require more CPU/GPU resources and memory.

---

# Transcription Process

The backend transcription flow is:

```text
1. User creates Voice Recording
        |
        v
2. Audio file is attached
        |
        v
3. User selects language
        |
        v
4. User clicks Transcribe
        |
        v
5. Frappe API is called
        |
        v
6. Backend validates audio
        |
        v
7. Status = Processing
        |
        v
8. Language code is retrieved
        |
        v
9. Faster-Whisper loads
        |
        v
10. Audio is transcribed
        |
        v
11. Transcript is generated
        |
        v
12. Transcript is saved
        |
        v
13. Status = Completed
```

If an error occurs:

```text
Processing
    |
    v
Error
    |
    v
Failed
```

---

# Backend API

The application exposes backend methods through Frappe's API mechanism.

The main methods are:

```text
upload_voice_recording
```

and

```text
transcribe_audio
```

---

# Audio Upload API

Method:

```text
upload_voice_recording
```

Python method:

```python
@frappe.whitelist()
def upload_voice_recording(
    file_name,
    filedata,
    doctype,
    docname
):
    ...
```

The API accepts:

| Parameter   | Description                   |
| ----------- | ----------------------------- |
| `file_name` | Name of the audio file        |
| `filedata`  | Base64 encoded audio          |
| `doctype`   | Frappe DocType                |
| `docname`   | Voice Recording document name |

---

# Upload API Example

Endpoint:

```text
/api/method/voice_to_text.voice_to_text.doctype.voice_recording.voice_recording.upload_voice_recording
```

Example:

```bash
curl -X POST \
  "https://your-site/api/method/voice_to_text.voice_to_text.doctype.voice_recording.voice_recording.upload_voice_recording" \
  -H "Authorization: token API_KEY:API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "recording.webm",
    "filedata": "<BASE64_AUDIO_DATA>",
    "doctype": "Voice Recording",
    "docname": "VR-0001"
  }'
```

---

# Transcription API

Method:

```text
transcribe_audio
```

Python method:

```python
@frappe.whitelist()
def transcribe_audio(docname):
    ...
```

Endpoint:

```text
/api/method/voice_to_text.voice_to_text.doctype.voice_recording.voice_recording.transcribe_audio
```

---

# Transcription API Example

```bash
curl -X POST \
  "https://your-site/api/method/voice_to_text.voice_to_text.doctype.voice_recording.voice_recording.transcribe_audio" \
  -H "Authorization: token API_KEY:API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "docname": "VR-0001"
  }'
```

---

# Example Response

A successful transcription returns information similar to:

```json
{
  "status": "Completed",
  "language": "Tamil",
  "language_code": "ta",
  "detected_language": "ta",
  "transcript": "வணக்கம் இது ஒரு குரல் பதிவு."
}
```

---

# Frappe Authentication

The API can use Frappe API Key and API Secret authentication.

Header:

```text
Authorization: token API_KEY:API_SECRET
```

Example:

```text
Authorization: token abc123:def456
```

Do not commit API keys or API secrets into Git.

---

# Frontend Integration

A frontend application can communicate with the Voice-to-Text backend through Frappe APIs.

The frontend should:

```text
Create Voice Recording
        |
        v
Upload Audio
        |
        v
Save Audio File
        |
        v
Call Transcription API
        |
        v
Wait for Response
        |
        v
Display Transcript
```

The frontend does not need to implement transcription logic.

It only communicates with the backend.

---

# Business Logic

The backend owns the transcription business logic.

The frontend should not:

* Load Whisper
* Run speech-to-text
* Decide Whisper language codes
* Update transcription status manually
* Implement transcription validation
* Store API keys
* Implement backend business rules

The Frappe backend handles these operations.

---

# File Storage

Audio files are saved using Frappe's file manager:

```python
from frappe.utils.file_manager import save_file
```

The file is attached to:

```text
Voice Recording
```

The `Audio File` field stores the file reference.

---

# Audio Formats

The current recording/upload flow can work with browser-generated formats such as:

```text
WebM
OGG
```

FFmpeg provides audio format support required by the transcription pipeline.

Additional formats can be supported depending on the server's FFmpeg configuration.

---

# Error Handling

The backend validates that:

1. A Voice Recording document exists.
2. An audio file is attached.
3. The audio file exists on the server.
4. A valid language can be determined.
5. Faster-Whisper can process the file.

If transcription fails:

```text
Status = Failed
```

The error is also logged using Frappe's error logging mechanism.

---

# Logging

The application uses Frappe logging for transcription errors and processing information.

Logs can be viewed using Frappe's standard error log mechanisms.

For example:

```python
frappe.log_error(
    title="Voice Transcription",
    message="..."
)
```

---

# Development Setup

Clone the repository:

```bash
git clone https://github.com/<your-username>/frappe-voice-to-text.git
```

Go into the repository:

```bash
cd frappe-voice-to-text
```

For development inside an existing Frappe Bench, place/install the app through:

```bash
bench get-app /path/to/frappe-voice-to-text
```

or:

```bash
bench get-app https://github.com/<your-username>/frappe-voice-to-text.git
```

---

# Clear Cache After Changes

After modifying DocType or backend code:

```bash
bench --site healthcare.in clear-cache
```

If required, restart the Frappe services:

```bash
bench restart
```

For a development environment:

```bash
bench start
```

---

# Checking the Application

Check installed applications:

```bash
bench --site healthcare.in list-apps
```

Check versions:

```bash
bench version
```

Check the application:

```bash
bench --site healthcare.in list-apps | grep voice_to_text
```

---

# Testing Faster-Whisper

Verify Python package:

```bash
./env/bin/python -c "from faster_whisper import WhisperModel; print('faster-whisper OK')"
```

Verify FFmpeg:

```bash
ffmpeg -version
```

---

# Testing the DocType

Open:

```text
Voice Recording
```

Create a new document.

Example:

```text
Title:
Tamil Test Recording

Language:
Tamil

Status:
Draft
```

Attach an audio file.

Then click:

```text
Transcribe
```

The expected status flow is:

```text
Draft
→ Processing
→ Completed
```

After completion, the transcript should appear in:

```text
Transcript
```

---

# Troubleshooting

## 1. Faster-Whisper is not installed

Error:

```text
ModuleNotFoundError: No module named 'faster_whisper'
```

Install:

```bash
cd ~/frappe-bench
./env/bin/pip install faster-whisper
```

Verify:

```bash
./env/bin/python -c "from faster_whisper import WhisperModel; print('faster-whisper OK')"
```

---

## 2. FFmpeg is missing

Install:

```bash
sudo apt-get update
sudo apt-get install -y ffmpeg
```

Verify:

```bash
ffmpeg -version
```

---

## 3. No audio file found

Error:

```text
No audio file found attached to this document.
```

Make sure the `Audio File` field contains an uploaded audio file.

---

## 4. Audio file does not exist

The backend checks the file path before starting transcription.

Verify that the file exists inside the Frappe site's public files directory.

---

## 5. Transcription status is Failed

Check Frappe Error Log.

Also inspect the backend traceback.

Useful commands:

```bash
bench --site healthcare.in clear-cache
```

Then restart:

```bash
bench restart
```

---

## 6. Language is not working

The `Language` field must point to the Frappe:

```text
Language
```

DocType.

The selected Language record should contain a valid:

```text
language_code
```

Example:

```text
Tamil → ta
Hindi → hi
Telugu → te
Kannada → kn
Malayalam → ml
English → en
```

---


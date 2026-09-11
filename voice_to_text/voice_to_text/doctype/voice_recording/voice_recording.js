frappe.ui.form.on("Voice Recording", {
    refresh(frm) {
        setup_voice_recorder(frm);
    },

    transcribe(frm) {
        if (!frm.doc.name) {
            frappe.msgprint("Please save the Voice Recording document first.");
            return;
        }

        if (!frm.doc.audio_file) {
            frappe.msgprint("Please record and save audio first.");
            return;
        }

        frappe.call({
            method: "voice_to_text.voice_to_text.doctype.voice_recording.voice_recording.transcribe_audio",
            args: {
                docname: frm.doc.name
            },
            freeze: true,
            freeze_message: "Transcribing audio..."
        }).then(r => {
            if (r.message) {
                frappe.show_alert({
                    message: "Transcription completed",
                    indicator: "green"
                });
                frm.reload_doc();
            }
        }).catch(error => {
            console.error("Transcription failed:", error);

            frappe.msgprint({
                title: "Transcription Failed",
                message: "Unable to transcribe the audio.",
                indicator: "red"
            });
        });
    }
});


function setup_voice_recorder(frm) {
    const wrapper = frm.fields_dict.audio_recorder_ui?.$wrapper;

    if (!wrapper) {
        console.error("audio_recorder_ui field not found");
        return;
    }

    wrapper.html(`
        <div style="padding: 15px 0;">
            <button type="button" class="btn btn-primary start-recording">
                🎙️ Start Recording
            </button>

            <button type="button"
                    class="btn btn-danger stop-recording"
                    style="display:none;">
                ⏹️ Stop Recording
            </button>

            <div class="recording-status" style="margin-top:10px;"></div>

            <audio class="recorded-audio"
                   controls
                   style="display:none; width:100%; margin-top:15px;">
            </audio>
        </div>
    `);

    let mediaRecorder = null;
    let audioChunks = [];
    let audioStream = null;

    const startButton = wrapper.find(".start-recording");
    const stopButton = wrapper.find(".stop-recording");
    const status = wrapper.find(".recording-status");
    const audio = wrapper.find(".recorded-audio");

    startButton.on("click", async function () {
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            audioChunks = [];

            const mimeType = "audio/webm;codecs=opus";

            if (!MediaRecorder.isTypeSupported(mimeType)) {
                frappe.throw("This browser does not support WebM/Opus recording.");
                return;
            }

            mediaRecorder = new MediaRecorder(audioStream, {
                mimeType: mimeType
            });

            console.log("Recorder MIME:", mediaRecorder.mimeType);

            mediaRecorder.ondataavailable = function (event) {
                if (event.data && event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async function () {
                const recordedBlob = new Blob(audioChunks, {
                    type: mediaRecorder.mimeType
                });

                console.log("Blob MIME:", recordedBlob.type);
                console.log("Blob size:", recordedBlob.size);

                const playbackUrl = URL.createObjectURL(recordedBlob);

                audio.attr("src", playbackUrl);
                audio.show();

                status.html(
                    `<span style="color:green;">
                        Recording ready (${Math.round(recordedBlob.size / 1024)} KB)
                    </span>`
                );

                if (audioStream) {
                    audioStream.getTracks().forEach(track => track.stop());
                    audioStream = null;
                }

                await upload_recording(frm, recordedBlob);
            };

            mediaRecorder.start();

            startButton.hide();
            stopButton.show();

            status.html(
                `<span style="color:red;">
                    🔴 Recording...
                </span>`
            );

        } catch (error) {
            console.error("Microphone error:", error);

            frappe.msgprint({
                title: "Recording Error",
                message: error.message || "Unable to access microphone.",
                indicator: "red"
            });
        }
    });

    stopButton.on("click", function () {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }

        stopButton.hide();
        startButton.show();

        status.html("Processing recording...");
    });
}


async function upload_recording(frm, blob) {
    const mimeType = blob.type || "audio/webm";

    let extension = "webm";

    if (mimeType.includes("ogg")) {
        extension = "ogg";
    }

    const fileName = `voice_recording.${extension}`;

    console.log("Uploading:", fileName);
    console.log("MIME:", mimeType);
    console.log("Size:", blob.size);

    const base64data = await blob_to_base64(blob);

    return new Promise((resolve, reject) => {
        frappe.call({
            method:
                "voice_to_text.voice_to_text.doctype.voice_recording.voice_recording.upload_voice_recording",

            args: {
                file_name: fileName,
                filedata: base64data,
                doctype: frm.doc.doctype,
                docname: frm.doc.name
            },

            freeze: true,
            freeze_message: "Uploading audio..."

        }).then(r => {

            console.log("Upload response:", r);

            if (!r.message) {
                reject(new Error("Upload failed."));
                return;
            }

            const fileUrl = r.message.file_url;

            console.log("Uploaded file:", fileUrl);

            frm.set_value("audio_file", fileUrl);

            frm.save().then(() => {

                frappe.show_alert({
                    message: "Audio saved successfully",
                    indicator: "green"
                });

                resolve(r.message);

            }).catch(error => {
                console.error("Document save failed:", error);
                reject(error);
            });

        }).catch(error => {
            console.error("Upload failed:", error);
            reject(error);
        });
    });
}


function blob_to_base64(blob) {
    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onloadend = function () {
            resolve(reader.result);
        };

        reader.onerror = function () {
            reject(new Error("Unable to read audio data."));
        };

        reader.readAsDataURL(blob);
    });
}

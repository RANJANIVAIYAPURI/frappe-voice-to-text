frappe.ui.form.on("Voice Recording", {
    refresh: function(frm) {

        let wrapper = frm.fields_dict["audio_recorder_ui"].$wrapper;

        wrapper.html(`
            <div style="
                padding: 15px;
                background: #f8f9fa;
                border: 1px solid #d1d8dd;
                border-radius: 6px;
            ">

                <div style="
                    margin-bottom: 12px;
                    font-weight: 600;
                    color: #36414c;
                ">
                    <i class="fa fa-microphone"></i>
                    Voice Recording
                </div>

                <div style="
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    flex-wrap: wrap;
                ">

                    <button
                        type="button"
                        id="start-record"
                        class="btn btn-danger btn-sm"
                    >
                        <i class="fa fa-circle"></i>
                        Record
                    </button>

                    <button
                        type="button"
                        id="stop-record"
                        class="btn btn-default btn-sm"
                        disabled
                    >
                        <i class="fa fa-stop"></i>
                        Stop
                    </button>

                    <span
                        id="recording-status"
                        style="
                            font-size: 13px;
                            color: #6c757d;
                            margin-left: 10px;
                        "
                    >
                        Ready
                    </span>

                </div>

                <div style="margin-top: 15px;">
                    <audio
                        id="audio-playback"
                        controls
                        style="width: 100%; display: none;"
                    ></audio>
                </div>

            </div>
        `);

        let mediaRecorder = null;
        let audioChunks = [];

        // Show existing audio file
        if (frm.doc.audio_file) {
            wrapper
                .find("#audio-playback")
                .attr("src", frm.doc.audio_file)
                .show();
        }

        // START RECORDING
        wrapper.find("#start-record").on("click", async function() {

            if (frm.is_new()) {
                frappe.msgprint(
                    __("Please save the Voice Recording document before recording.")
                );
                return;
            }

            try {

                audioChunks = [];

                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });

                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = function(event) {

                    if (event.data && event.data.size > 0) {
                        audioChunks.push(event.data);
                    }

                };

                mediaRecorder.onstop = function() {

                    const audioBlob = new Blob(
                        audioChunks,
                        {
                            type: "audio/webm"
                        }
                    );

                    const audioUrl =
                        URL.createObjectURL(audioBlob);

                    wrapper
                        .find("#audio-playback")
                        .attr("src", audioUrl)
                        .show();

                    const reader = new FileReader();

                    reader.onloadend = function() {

                        const base64data = reader.result;

                        wrapper
                            .find("#recording-status")
                            .text("Uploading...");

                        frappe.call({

                            method:
                                "voice_to_text.voice_to_text.doctype.voice_recording.voice_recording.upload_voice_recording",

                            args: {

                                file_name:
                                    "voice_recording.webm",

                                filedata:
                                    base64data,

                                docname:
                                    frm.doc.name

                            },

                            callback: function(r) {

                                if (r.exc) {

                                    console.error(
                                        "Voice upload failed:",
                                        r.exc
                                    );

                                    wrapper
                                        .find("#recording-status")
                                        .text("Upload failed");

                                    frappe.msgprint(
                                        __("Voice recording upload failed.")
                                    );

                                    return;
                                }

                                if (
                                    r.message &&
                                    r.message.file_url
                                ) {

                                    frm.set_value(
                                        "audio_file",
                                        r.message.file_url
                                    );

                                    frm.save();

                                    wrapper
                                        .find("#audio-playback")
                                        .attr(
                                            "src",
                                            r.message.file_url
                                        )
                                        .show();

                                    wrapper
                                        .find("#recording-status")
                                        .text("Saved successfully");

                                    frappe.show_alert({
                                        message:
                                            __("Voice recording saved successfully"),
                                        indicator: "green"
                                    });

                                } else {

                                    wrapper
                                        .find("#recording-status")
                                        .text("Upload failed");

                                    frappe.msgprint(
                                        __("File was uploaded but no file URL was returned.")
                                    );
                                }

                            },

                            error: function(err) {

                                console.error(
                                    "Voice upload error:",
                                    err
                                );

                                wrapper
                                    .find("#recording-status")
                                    .text("Upload failed");

                                frappe.msgprint(
                                    __("Unable to upload voice recording.")
                                );

                            }

                        });

                    };

                    reader.readAsDataURL(audioBlob);
                };

                mediaRecorder.start();

                wrapper
                    .find("#start-record")
                    .prop("disabled", true);

                wrapper
                    .find("#stop-record")
                    .prop("disabled", false);

                wrapper
                    .find("#recording-status")
                    .text("Recording...");

            } catch (err) {

                console.error(
                    "Microphone error:",
                    err
                );

                frappe.msgprint(
                    __("Microphone access denied or not available.")
                );

            }

        });


        // STOP RECORDING
        wrapper.find("#stop-record").on("click", function() {

            if (mediaRecorder) {

                mediaRecorder.stop();

                mediaRecorder.stream
                    .getTracks()
                    .forEach(function(track) {
                        track.stop();
                    });

                mediaRecorder = null;
            }

            wrapper
                .find("#start-record")
                .prop("disabled", false);

            wrapper
                .find("#stop-record")
                .prop("disabled", true);

            wrapper
                .find("#recording-status")
                .text("Recording stopped. Uploading...");

        });

    }
});

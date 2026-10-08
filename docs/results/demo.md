# Demo provenance

`docs/demo.gif` is a real terminal recording of this portal working, captured with official asciinema 2.4.0 in WSL and rendered with agg 1.9.0. The original `docs/demo.cast` is retained. The recorded Windows PowerShell command runs [scripts/demo.ps1](../../scripts/demo.ps1) against the production app.

The recording shows actual HTTP responses for list/create/update/delete, a real Chromium scan returning screenshot/raw/axe evidence, and the actual passing Vitest output. The defect is explicitly synthetic and is deleted during the demo. No responses or counts were inserted into the recording.

Measured GIF duration: 33.2 seconds, 15 frames, 985×784 pixels. The cast's final event is at 33.260153 seconds; GIF timing is quantised to centiseconds. The encoder uses Consolas, the GitHub dark theme, a 12 fps cap and a 10-second idle limit. It preserves the paced demo timing. The final frame was extracted and visually inspected to verify readable responses and the real 32-test output.

The complete app runs locally: it needs a Node server, writable JSON/artifact storage and installed Chromium. The existing Vercel preview has a reduced legacy browser fallback and is not presented as an equivalent live demo. App screenshots and the inspected Windows HTML reports are in `docs/img/`; GitHub Actions artifacts provide the exact CI reports.

`docs/social-preview.png` is a 1280×640 image rendered from the project's own HTML/CSS. GitHub's `gh` CLI does not provide social-preview upload; Nazmul can upload it in repository Settings → General → Social preview.

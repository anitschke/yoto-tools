# RFC: Audio Ingestion, ZIP Extraction, and Upload Concurrency Pipeline

- **Date:** 2026-09-17
- **Status:** Accepted
- **Author:** Antigravity Agent & Andrew Nitschke

---

## 1. Summary

This proposal outlines the client-side audio ingestion engine for `yoto-tools`. It defines how local folders and ZIP archives are processed, how audio tags are extracted, how temporary storage is managed via the Origin Private File System (OPFS), and how concurrent S3 uploads are throttled to ensure browser and network stability.

---

## 2. Ingestion Sources & Libraries

Users can drag-and-drop or file-pick:
- Direct audio files (`.mp3`, `.m4a`, `.aac`).
- Folders of tracks (via HTML5 folder drag-and-drop / `webkitdirectory`).
- Compressed `.zip` archives containing albums or story collections.

### Selected Libraries
1. **ZIP Extraction:** **`@zip.js/zip.js`**
   - High performance, streamable ZIP archive decompression running natively in modern browsers and Web Workers without memory blowouts.
2. **Audio Metadata & ID3 Parsing:** **`music-metadata-browser`**
   - Pure JavaScript/TypeScript audio parser. Extracts ID3v1, ID3v2, MP4, and Vorbis tags (track numbers, titles, artists, chapter markers) directly from files in the browser.

---

## 3. Storage Architecture: OPFS (Origin Private File System)

When users drop multi-hundred-megabyte ZIP archives or high-bitrate albums:
- **Avoid Memory Bloat:** Do not store all extracted audio binaries in JavaScript heap memory.
- **OPFS Sandbox:** Extracted audio streams are written directly into the browser's **Origin Private File System** (`navigator.storage.getDirectory()`).
- **Benefits:**
  - Near-native filesystem I/O speeds.
  - Files persist if the tab is accidentally reloaded.
  - Temporary files are cleaned up automatically once uploads and transcodes finish.

---

## 4. Controlled Upload Concurrency (Max 3–4 Parallel Streams)

To prevent saturating home broadband and hitting browser HTTP/2 connection throttling:
- **Concurrency Ceiling:** The upload queue executes a maximum of **3 to 4 concurrent uploads** simultaneously.
- **Pipeline Per Track:**
  ```mermaid
  flowchart LR
      Hash["1. SHA-256 Hash (Web Crypto)"] --> Check["2. Deduplication Check (GET /media/transcode/...)"]
      Check -->|Exists| Skip["Skip Upload (Link ID)"]
      Check -->|New| Upload["3. PUT to S3 (Max 3-4 Parallel)"]
      Upload --> Poll["4. Transcode Polling (GET /transcoded)"]
  ```
- **Resilience:** Upload failures trigger exponential backoff retries with progress events propagated to Lit context and `<yoto-progress-bar>` widgets.

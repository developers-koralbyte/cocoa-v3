// src/utils/upload.ts
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { auth, storage } from "./firebase";

type UploadFolder = "avatars" | "documents" | "images";
type UploadOpts = {
  folder?: UploadFolder;      // default: infer from file.type
  uid?: string;               // default: auth.currentUser?.uid
  filename?: string;          // default: timestamped original name
  onProgress?: (pct: number) => void;
};

const sanitize = (name: string) => name.replace(/[^\w.\-]/g, "_");

export default function upload(file: File, opts: UploadOpts = {}): Promise<string> {
  if (!file) return Promise.reject(new Error("upload(file): file is required"));

  // derive uid safely (your rules require it in the path)
  const uid = opts.uid ?? auth.currentUser?.uid ?? "";
  if (!uid) return Promise.reject(new Error("upload(file): uid is required (user not signed in?)"));

  // derive folder safely
  const folder: UploadFolder =
    opts.folder ??
    (file.type?.startsWith("image/") ? "images" : "documents"); // default by type

  const safeName = sanitize(file.name || "file");
  const name = opts.filename ?? `${Date.now()}_${safeName}`;

  // build a path that matches your rules
  // avatars/{uid}  (single object)  OR change your rules if you want avatars/{uid}/{file}
  const path =
    folder === "avatars"
      ? `avatars/${uid}` // single object key; overwrite on each upload
      : `${folder}/${uid}/${name}`;

  const fileRef = ref(storage, path);
  const task = uploadBytesResumable(fileRef, file, { contentType: file.type });

  return new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      (s) => opts.onProgress?.((s.bytesTransferred / s.totalBytes) * 100),
      (err) => reject(err),
      async () => resolve(await getDownloadURL(task.snapshot.ref))
    );
  });
}

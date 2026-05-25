import { useState, useRef } from "react";

export default function UploadZone({ onImage, loading }) {
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState(null);
  const ref = useRef(null);

  const handle = (file) => {
    if (!file?.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = (e) => {
      const u = e.target.result;
      setPreview(u);
      onImage(u.split(",")[1], file.type);
    };
    r.readAsDataURL(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer?.files?.[0]); }}
      onClick={() => !loading && ref.current?.click()}
      className={`upload-zone ${drag ? "upload-zone-drag" : ""}`}
      style={{ padding: preview ? 8 : "24px 20px" }}
    >
      <input ref={ref} type="file" accept="image/*" onChange={(e) => handle(e.target.files?.[0])} style={{ display: "none" }} />

      {loading && (
        <div className="upload-loading">
          <div className="spinner" />
          <p className="loading-title">Analyzing tab...</p>
          <p className="loading-sub">Extracting frets, strings, and technique notation</p>
        </div>
      )}

      {preview ? (
        <div>
          <img src={preview} alt="Tab screenshot" className="upload-preview" style={{ opacity: loading ? 0.3 : 1 }} />
          {!loading && <p className="upload-hint">Click or drop to replace</p>}
        </div>
      ) : (
        <div>
          <p className="upload-title">Drop a tab screenshot here</p>
          <p className="upload-sub">or click to browse — PNG, JPG, WEBP</p>
          <div className="upload-tags">
            {["Ultimate Guitar", "Songsterr", "Guitar Pro", "PDF tabs", "Handwritten"].map((s) => (
              <span key={s} className="upload-tag">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

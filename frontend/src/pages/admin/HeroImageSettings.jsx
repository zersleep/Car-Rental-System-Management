import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { settingsAPI } from "@/services/settingsAPI";
import { useToast } from "@/lib/toastCore";

export default function HeroImageSettings() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [externalUrl, setExternalUrl] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    settingsAPI
      .getSettings()
      .then((res) => {
        setPreview(res.data.hero_image || null);
        setUpdatedAt(res.data.hero_image_updated_at || null);
      })
      .catch(() => {});
  }, []);

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    // client-side validation: must be an image and under 5MB
    if (!f.type || !f.type.startsWith("image/")) {
      setFile(null);
      addToast("Selected file is not an image", "error");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setFile(null);
      addToast("Image must be smaller than 5 MB", "error");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return addToast("Please choose an image to upload", "error");
    const form = new FormData();
    form.append("image", file);
    setLoading(true);
    setProgress(0);
    try {
      const res = await settingsAPI.uploadHeroImage(form, {
        onUploadProgress: (ev) => {
          if (ev.total) setProgress(Math.round((ev.loaded * 100) / ev.total));
        },
      });
      // ensure we bust caches when showing new preview
      const url = res.data.hero_image ? `${res.data.hero_image}` : null;
      setPreview(url);
      setUpdatedAt(res.data.hero_image_updated_at || null);
      try {
        if (url) localStorage.setItem("hero_image", url);
      } catch (e) {}
      addToast("Image updated", "success");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors &&
          Object.values(err.response.data.errors)[0][0]) ||
        "Upload failed";
      addToast(msg, "error");
    } finally {
      setLoading(false);
      setProgress(0);
      setFile(null);
    }
  };

  const handleSetExternal = async () => {
    if (!externalUrl) return addToast("Please enter an image URL", "error");
    try {
      const res = await settingsAPI.setHeroExternal(externalUrl);
      const url = res.data.hero_image || externalUrl;
      setPreview(url);
      setUpdatedAt(res.data.hero_image_updated_at || null);
      try {
        if (url) localStorage.setItem("hero_image", url);
      } catch (e) {
        // ignore storage errors
      }
      addToast("Image updated", "success");
      setExternalUrl("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to set URL";
      addToast(msg, "error");
    }
  };

  const handleReset = async () => {
    try {
      const res = await settingsAPI.deleteHeroImage();
      setPreview(null);
      setUpdatedAt(res.data.hero_image_updated_at || null);
      try {
        localStorage.removeItem("hero_image");
      } catch (e) {}
      addToast("Image reset to default", "success");
    } catch (err) {
      addToast("Failed to reset Image", "error");
    }
  };

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Image upload Settings</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            <div className="w-full flex flex-col gap-4">
              {preview ? (
                <div className="w-full h-56 bg-gray-200 overflow-hidden rounded-md">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-56 bg-muted/40 flex items-center justify-center text-sm rounded-md">
                  No Image configured
                </div>
              )}

              <div className="flex items-center gap-4">
                <input type="file" accept="image/*" onChange={onFile} />
                <div className="flex-1 text-sm text-muted-foreground">
                  {file
                    ? `${file.name} — ${(file.size / 1024).toFixed(0)} KB`
                    : "Choose a local image to upload"}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Accepted: JPG, PNG, WEBP — Max size: 5 MB
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Or enter an external image URL"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="flex-1 rounded-md border px-3 py-2"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSetExternal}
                >
                  Use URL
                </Button>
              </div>

              {progress > 0 && (
                <div className="w-full bg-muted/20 rounded-md overflow-hidden">
                  <div
                    className="bg-primary h-1"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {updatedAt && (
                <div className="text-xs text-muted-foreground">
                  Last updated: {updatedAt}
                </div>
              )}

              <div className="flex gap-2">
                <div className="flex-1" />
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset to Default
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading || !file}>
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

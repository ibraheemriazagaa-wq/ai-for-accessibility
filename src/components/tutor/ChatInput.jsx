import { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Camera, Paperclip, X, FlipHorizontal } from "lucide-react";

export default function ChatInput({ onSend, isLoading, placeholder }) {
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState("user"); // "user" = front, "environment" = back
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Cleanup stream on unmount or close
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCameraError(null);
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach((t) => t.stop());
    };
  }, [cameraStream]);

  const startCameraStream = useCallback(async (facing) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
      });
      setCameraStream(stream);
      return stream;
    } catch (err) {
      setCameraError("Could not access camera. Please check permissions.");
      setShowCamera(false);
      return null;
    }
  }, []);

  const openCamera = async () => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.onchange = handleFilePicked;
      input.click();
      return;
    }
    setCameraError(null);
    setShowCamera(true);
    setFacingMode("user");
    await startCameraStream("user");
  };

  const flipCamera = async () => {
    // Stop current stream
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    const stream = await startCameraStream(newFacing);
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  // Wire up video element to stream
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
      stopCamera();
      setUploading(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const text = input.trim() || "📷 Photo";
        onSend(text, [file_url]);
        setInput("");
      } catch (_) {
        // upload failed silently
      } finally {
        setUploading(false);
      }
    }, "image/jpeg");
  };

  const handleSend = () => {
    if (!input.trim() || isLoading || uploading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFilePicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const text = input.trim() || "📎 File";
      onSend(text, [file_url]);
      setInput("");
    } catch (_) {
      // upload failed silently
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const busy = isLoading || uploading;

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={handleFilePicked}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Desktop webcam modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-heading font-semibold text-foreground text-sm">Take a photo</h3>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={flipCamera}
                  className="rounded-lg h-8 w-8"
                  title="Flip camera"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={stopCamera} className="rounded-lg h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            <div className="p-4 flex justify-center">
              <Button
                onClick={capturePhoto}
                className="rounded-full w-16 h-16 bg-white hover:bg-gray-200 border-4 border-primary shadow-lg"
                disabled={!cameraStream}
              >
                <span className="w-10 h-10 rounded-full bg-white" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-destructive text-destructive-foreground text-sm px-4 py-2 rounded-xl shadow-lg">
          {cameraError}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-xl text-muted-foreground hover:text-foreground flex-shrink-0"
          onClick={openCamera}
          disabled={busy}
          title="Take a photo"
        >
          <Camera className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-xl text-muted-foreground hover:text-foreground flex-shrink-0"
          onClick={() => fileRef.current?.click()}
          title="Attach a file"
          disabled={busy}
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ask your question..."}
          className="min-h-[48px] max-h-32 resize-none bg-card rounded-xl border-border text-sm"
          rows={1}
          disabled={busy}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || busy}
          size="icon"
          className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 flex-shrink-0"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </>
  );
}
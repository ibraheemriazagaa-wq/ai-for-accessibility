import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Camera, Paperclip } from "lucide-react";

export default function ChatInput({ onSend, isLoading, placeholder }) {
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef(null);
  const fileRef = useRef(null);

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
      const text = input.trim() || (e.target === cameraRef.current ? "📷 Photo" : "📎 File");
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
    <div className="flex gap-2 items-end">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFilePicked}
      />
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={handleFilePicked}
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-xl text-muted-foreground hover:text-foreground flex-shrink-0"
        onClick={() => cameraRef.current?.click()}
        disabled={busy}
      >
        <Camera className="w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-xl text-muted-foreground hover:text-foreground flex-shrink-0"
        onClick={() => fileRef.current?.click()}
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
  );
}
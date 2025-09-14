import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, X, Image, Video } from "lucide-react";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStoryModal = ({ isOpen, onClose }: CreateStoryModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      const isImage = selectedFile.type.startsWith('image/');
      const isVideo = selectedFile.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: "Only image and video files are allowed",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!user || !file) {
      toast({
        title: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);
      
      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: data.publicUrl,
          media_type: file.type.startsWith('image/') ? 'image' : 'video',
        });
        
      if (error) throw error;
      
      toast({
        title: "Story uploaded successfully!",
      });
      
      setFile(null);
      setPreview("");
      onClose();
      
    } catch (error: any) {
      toast({
        title: "Error uploading story",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Your Story</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!file ? (
            <div>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="story-file"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('story-file')?.click()}
                className="w-full h-40 border-dashed"
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8" />
                  <span>Choose photo or video</span>
                  <span className="text-xs text-muted-foreground">
                    Stories disappear after 24 hours
                  </span>
                </div>
              </Button>
            </div>
          ) : (
            <div className="relative">
              {file.type.startsWith('image/') ? (
                <img src={preview} alt="Preview" className="w-full h-60 object-cover rounded" />
              ) : (
                <video src={preview} className="w-full h-60 object-cover rounded" controls />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setPreview("");
                }}
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={uploading || !file}
            className="flex-1"
          >
            {uploading ? "Uploading..." : "Share Story"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
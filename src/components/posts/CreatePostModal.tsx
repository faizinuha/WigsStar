import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, X, Image, Video, Laugh } from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("post");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        return isImage || isVideo;
      });
      
      if (validFiles.length !== selectedFiles.length) {
        toast({
          title: "Invalid files detected",
          description: "Only image and video files are allowed",
          variant: "destructive",
        });
      }
      
      setFiles(prev => [...prev, ...validFiles].slice(0, 10)); // Max 10 files
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (bucket: string) => {
    if (!user) return [];
    
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
        
      return {
        url: data.publicUrl,
        type: file.type.startsWith('image/') ? 'image' : 'video'
      };
    });
    
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!user || files.length === 0) {
      toast({
        title: "Please select at least one file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const bucket = activeTab === "meme" ? "memes" : "posts";
      const uploadedFiles = await uploadFiles(bucket);
      
      if (activeTab === "meme") {
        // For memes, we only support single file
        const { error } = await supabase
          .from('memes')
          .insert({
            user_id: user.id,
            caption,
            media_url: uploadedFiles[0].url,
            media_type: uploadedFiles[0].type,
          });
          
        if (error) throw error;
      } else {
        // For posts, create post first then add media
        const { data: post, error: postError } = await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            caption,
            location: location || null,
          })
          .select()
          .single();
          
        if (postError) throw postError;
        
        // Add media files
        const mediaInserts = uploadedFiles.map((file, index) => ({
          post_id: post.id,
          media_url: file.url,
          media_type: file.type,
          order_index: index,
        }));
        
        const { error: mediaError } = await supabase
          .from('post_media')
          .insert(mediaInserts);
          
        if (mediaError) throw mediaError;
      }
      
      toast({
        title: `${activeTab === "meme" ? "Meme" : "Post"} created successfully!`,
      });
      
      // Reset form
      setCaption("");
      setLocation("");
      setFiles([]);
      onClose();
      
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Content</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="post" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Post
            </TabsTrigger>
            <TabsTrigger value="meme" className="flex items-center gap-2">
              <Laugh className="h-4 w-4" />
              Meme
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="post" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="post-files">Select Images/Videos</Label>
                <div className="mt-2">
                  <input
                    id="post-files"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('post-files')?.click()}
                    className="w-full h-32 border-dashed"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8" />
                      <span>Choose files or drag and drop</span>
                      <span className="text-xs text-muted-foreground">
                        Images and videos up to 10MB each
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  placeholder="Add location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="meme" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="meme-file">Select Meme Image/Video</Label>
                <div className="mt-2">
                  <input
                    id="meme-file"
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFiles([e.target.files[0]]);
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('meme-file')?.click()}
                    className="w-full h-32 border-dashed"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Laugh className="h-8 w-8" />
                      <span>Choose your meme</span>
                      <span className="text-xs text-muted-foreground">
                        Single image or video up to 10MB
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="meme-caption">Caption</Label>
                <Textarea
                  id="meme-caption"
                  placeholder="Add a funny caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* File Preview */}
        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files ({files.length}/{activeTab === "meme" ? 1 : 10})</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <Card key={index} className="relative p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {file.type.startsWith('image/') ? (
                        <Image className="h-4 w-4" />
                      ) : (
                        <Video className="h-4 w-4" />
                      )}
                      <span className="text-xs truncate">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={uploading || files.length === 0}
            className="flex-1"
          >
            {uploading ? "Uploading..." : `Create ${activeTab === "meme" ? "Meme" : "Post"}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
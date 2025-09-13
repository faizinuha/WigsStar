import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ImageIcon, 
  Video, 
  MapPin, 
  Hash, 
  AtSign, 
  X,
  Upload
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const CreatePost = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const addHashtag = (tag: string) => {
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handlePost = () => {
    // Here you would handle the actual posting logic
    console.log({
      content,
      image: selectedImage,
      location,
      hashtags,
      mentions
    });
    
    // Reset form
    setContent("");
    setSelectedImage(null);
    setImagePreview(null);
    setLocation("");
    setHashtags([]);
    setMentions([]);
    setIsOpen(false);
  };

  return (
    <>
      {/* Quick Create */}
      <Card className="p-4 animate-fade-in">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face" />
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <div className="flex-1 bg-secondary rounded-full px-4 py-3 text-muted-foreground cursor-pointer hover:bg-secondary/80 transition-colors">
                What's on your mind?
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face" />
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Create New Post</p>
                    <p className="text-sm text-muted-foreground font-normal">@yourname</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Content Input */}
                <div>
                  <Textarea
                    placeholder="What's happening?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-32 text-lg border-none resize-none focus-visible:ring-0 p-0"
                  />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full max-h-96 object-cover rounded-2xl"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="Add location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                {/* Hashtags */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Hash className="h-4 w-4" />
                    <span>Hashtags</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="flex items-center space-x-1"
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={() => removeHashtag(tag)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add hashtags..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const value = e.currentTarget.value.replace('#', '').trim();
                        if (value) {
                          addHashtag(value);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>

                {/* Media Upload Options */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-4">
                    <label className="cursor-pointer">
                      <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
                        <span>
                          <ImageIcon className="h-5 w-5 text-green-600" />
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    
                    <label className="cursor-pointer">
                      <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
                        <span>
                          <Video className="h-5 w-5 text-blue-600" />
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-muted-foreground">
                      {content.length}/500
                    </span>
                    <Button
                      onClick={handlePost}
                      disabled={!content.trim() && !selectedImage}
                      className="gradient-button"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </>
  );
};
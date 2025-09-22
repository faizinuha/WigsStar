import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, Video, MapPin, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useCreatePost } from "@/hooks/usePosts";

export const CreatePost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  
  const { data: userProfile } = useProfile();
  const createPostMutation = useCreatePost();

  useEffect(() => {
    if (createPostMutation.isSuccess) {
      toast({
        title: "Success",
        description: "Your post has been created!",
      });
      // Reset form
      setContent("");
      setSelectedImage(null);
      setImagePreview(null);
      setLocation("");
      setIsOpen(false);
      createPostMutation.reset();
    }

    if (createPostMutation.isError) {
      toast({
        title: "Error creating post",
        description: createPostMutation.error.message,
        variant: "destructive",
      });
    }
  }, [createPostMutation.isSuccess, createPostMutation.isError, createPostMutation.error, toast, createPostMutation]);

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

  const handleSubmit = () => {
    createPostMutation.mutate({
      content,
      selectedImage,
      location,
    });
  };

  return (
    <>
      <Card className="p-4 animate-fade-in">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10"> 
            <AvatarImage src={userProfile?.avatar_url || '/assets/placeholder/cewek.png'} />
            <AvatarFallback>{userProfile?.username?.charAt(0) || 'U'}</AvatarFallback>
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
                   <AvatarImage src={userProfile?.avatar_url || '/assets/placeholder/cewek.png'} />
                    <AvatarFallback>{userProfile?.username?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Create New Post</p>
                    <p className="text-sm text-muted-foreground font-normal">@{userProfile?.username || 'yourname'}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <Textarea
                    placeholder="What's happening? Use #hashtags to categorize your post."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-32 text-lg border-none resize-none focus-visible:ring-0 p-0"
                  />
                </div>

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
                        // onChange={handleVideoSelect} // Add a handler for video
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-muted-foreground">
                      {content.length}/500
                    </span>
                    <Button
                      onClick={handleSubmit}
                      disabled={(!content.trim() && !selectedImage) || createPostMutation.isPending}
                      className="gradient-button"
                    >
                      {createPostMutation.isPending ? "Posting..." : "Post"}
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

import { Badge as BadgeUI } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LocationInput } from '@/components/ui/location-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useBadges } from '@/hooks/useMemes';
import { useTrendingTags } from '@/hooks/useTags';
import supabase from '@/lib/supabase.ts';
import { Image, Laugh, Loader2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('post');

  const [selectedBadges, setSelectedBadges] = useState<number[]>([]);
  const { data: availableBadges, isLoading: isLoadingBadges } = useBadges();

  // Hashtag suggest
  const { data: trendingTags = [] } = useTrendingTags(10);
  const [showTagSuggest, setShowTagSuggest] = useState(false);
  const [tagQuery, setTagQuery] = useState('');

  // Reset state when tab changes
  useEffect(() => {
    setFiles([]);
    setPreviews([]);
    setCaption('');
    setLocation('');
    setSelectedBadges([]);
  }, [activeTab]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const filesToProcess =
        activeTab === 'meme'
          ? selectedFiles.slice(0, 1)
          : [...files, ...selectedFiles].slice(0, 10);

      setFiles(filesToProcess);

      const newPreviews = filesToProcess.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviews(newPreviews);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const toggleBadge = (badgeId: number) => {
    setSelectedBadges((prev) =>
      prev.includes(badgeId)
        ? prev.filter((id) => id !== badgeId)
        : [...prev, badgeId]
    );
  };

  const resetFormAndClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setCaption('');
    setLocation('');
    setFiles([]);
    setPreviews([]);
    setSelectedBadges([]);
    // activeTab is reset via useEffect
  };

  const handleSubmit = async () => {
    if (!user || files.length === 0) {
      toast({
        title: 'Please select at least one file',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const bucket = activeTab === 'meme' ? 'memes' : 'posts';

      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        return {
          url: data.publicUrl,
          type: file.type.startsWith('image/') ? 'image' : 'video',
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      if (activeTab === 'meme') {
        const { data: meme, error: memeError } = await supabase
          .from('memes')
          .insert({
            user_id: user.id,
            caption,
            media_url: uploadedFiles[0].url,
            media_type: uploadedFiles[0].type,
          })
          .select('id')
          .single();

        if (memeError) throw memeError;

        if (selectedBadges.length > 0) {
          const memeBadges = selectedBadges.map((badgeId) => ({
            meme_id: meme.id,
            badge_id: badgeId,
          }));
          const { error: badgeError } = await supabase
            .from('meme_badges')
            .insert(memeBadges);
          if (badgeError) console.error('Error adding badges:', badgeError);
        }
      } else {
        const { data: post, error: postError } = await supabase
          .from('posts')
          .insert({ user_id: user.id, caption, location: location || null })
          .select('id')
          .single();

        if (postError) throw postError;

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

        // --- START HASHTAG PROCESSING ---
        const hashtags = caption
          .match(/#(\w+)/g)
          ?.map((tag) => tag.substring(1).toLowerCase());
        if (hashtags && hashtags.length > 0) {
          const uniqueHashtags = [...new Set(hashtags)];

          // 1. Upsert tags and get their IDs
          const { data: tags, error: tagsError } = await supabase
            .from('tags')
            .upsert(
              uniqueHashtags.map((name) => ({ name })),
              { onConflict: 'name' }
            )
            .select('id, name');

          if (tagsError) {
            console.error('Error upserting tags:', tagsError);
          } else if (tags) {
            // 2. Link tags to the post
            const postTags = tags.map((tag) => ({
              post_id: post.id,
              tag_id: tag.id,
            }));
            const { error: postTagsError } = await supabase
              .from('post_tags')
              .insert(postTags);
            if (postTagsError) {
              console.error('Error creating post tags:', postTagsError);
            }

            // 3. Increment tag counts via RPC
            try {
              const { error: rpcError } = await supabase.rpc(
                'increment_tag_counts',
                { tag_names: uniqueHashtags }
              );
              if (rpcError)
                console.error('Error incrementing tag counts:', rpcError);
            } catch (e) {
              console.error('RPC Error:', e);
            }
          }
        }
        // --- END HASHTAG PROCESSING ---
      }

      toast({
        title: `${
          activeTab === 'meme' ? 'Meme' : 'Post'
        } created successfully!`,
      });
      resetFormAndClose();
    } catch (error: any) {
      toast({
        title: 'Error creating content',
        description: error.message,
        variant: 'destructive',
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

          <TabsContent value="post" className="space-y-4 pt-4">
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
                    onClick={() =>
                      document.getElementById('post-files')?.click()
                    }
                    className="w-full h-32 border-dashed"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8" />
                      <span>Choose files or drag and drop</span>
                      <span className="text-xs text-muted-foreground">
                        Up to 10 images/videos
                      </span>
                    </div>
                  </Button>
                </div>
                {/* Preview appears directly below select button */}
                {previews.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <Label>
                      Preview ({files.length}/{activeTab === 'meme' ? 1 : 10})
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 bg-muted/50 rounded-lg">
                      {previews.map((preview, index) => (
                        <Card key={index} className="relative group">
                          <div className="aspect-square overflow-hidden rounded-md">
                            {files[index]?.type.startsWith('image/') ? (
                              <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={preview}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="caption">Caption</Label>
                <div className="relative">
                  <Textarea
                    id="caption"
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => {
                      setCaption(e.target.value);
                      // Detect if user is typing hashtag
                      const match = e.target.value.match(/#(\w*)$/);
                      if (match) {
                        setTagQuery(match[1].toLowerCase());
                        setShowTagSuggest(true);
                      } else {
                        setShowTagSuggest(false);
                        setTagQuery('');
                      }
                    }}
                    className="mt-2"
                  />
                  {/* Hashtag suggest dropdown */}
                  {showTagSuggest && tagQuery.length > 0 && (
                    <div className="absolute left-0 right-0 z-10 bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto">
                      {trendingTags
                        .filter((tag) =>
                          tag.hashtag.toLowerCase().includes(tagQuery)
                        )
                        .map((tag) => (
                          <button
                            key={tag.hashtag}
                            type="button"
                            className="block w-full text-left px-3 py-2 hover:bg-muted"
                            onClick={() => {
                              // Replace last hashtag in caption with selected
                              setCaption((prev) =>
                                prev.replace(/#(\w*)$/, `#${tag.hashtag} `)
                              );
                              setShowTagSuggest(false);
                              setTagQuery('');
                            }}
                          >
                            #{tag.hashtag}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {tag.post_count} posts
                            </span>
                          </button>
                        ))}
                      {/* If no match, show info */}
                      {trendingTags.filter((tag) =>
                        tag.hashtag.toLowerCase().includes(tagQuery)
                      ).length === 0 && (
                        <div className="px-3 py-2 text-muted-foreground text-xs">
                          No trending hashtag found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <LocationInput
                  value={location}
                  onChange={setLocation}
                  placeholder="Add location..."
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="meme" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="meme-file">Select Meme Image/Video</Label>
                <div className="mt-2">
                  <input
                    id="meme-file"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById('meme-file')?.click()
                    }
                    className="w-full h-32 border-dashed"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Laugh className="h-8 w-8" />
                      <span>Choose your meme</span>
                      <span className="text-xs text-muted-foreground">
                        Single image or video
                      </span>
                    </div>
                  </Button>
                </div>
                {/* Preview appears directly below select button */}
                {previews.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <Label>
                      Preview ({files.length}/{activeTab === 'meme' ? 1 : 10})
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 bg-muted/50 rounded-lg">
                      {previews.map((preview, index) => (
                        <Card key={index} className="relative group">
                          <div className="aspect-square overflow-hidden rounded-md">
                            {files[index]?.type.startsWith('image/') ? (
                              <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={preview}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
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
              <div>
                <Label>Badges (Optional)</Label>
                {isLoadingBadges ? (
                  <div className="flex items-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading
                    badges...
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableBadges?.map((badge) => (
                      <BadgeUI
                        key={badge.id}
                        variant={
                          selectedBadges.includes(badge.id)
                            ? 'default'
                            : 'secondary'
                        }
                        onClick={() => toggleBadge(badge.id)}
                        className="cursor-pointer transition-all"
                      >
                        {badge.name}
                      </BadgeUI>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {previews.length > 0 && (
          <div className="space-y-2">
            <Label>
              Preview ({files.length}/{activeTab === 'meme' ? 1 : 10})
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 bg-muted/50 rounded-lg">
              {previews.map((preview, index) => (
                <Card key={index} className="relative group">
                  <div className="aspect-square overflow-hidden rounded-md">
                    {files[index]?.type.startsWith('image/') ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={preview}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetFormAndClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={uploading || files.length === 0}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...
              </>
            ) : (
              `Create ${activeTab}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

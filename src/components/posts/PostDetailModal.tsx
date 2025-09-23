import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Post } from "@/hooks/usePosts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageCircle, Send, Bookmark, Loader2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

// Import hooks and components needed for functionality
import { useLikes } from "@/hooks/useLikes";
import { usePostComments as useComments, useCreateComment, Comment } from "@/hooks/useComments";
import { useAuth } from "@/contexts/AuthContext";

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

// A simple component to render a single comment item, extracted from CommentSection.tsx logic
const CommentItem = ({ comment }: { comment: Comment }) => (
  <div className="flex items-start space-x-3">
    <Avatar className="h-8 w-8">
      <AvatarImage src={comment.user.avatar} />
      <AvatarFallback>{comment.user.displayName?.charAt(0) || 'U'}</AvatarFallback>
    </Avatar>
    <div className="text-sm">
      <span className="font-semibold">{comment.user.username}</span>
      <span className="ml-2">{comment.content}</span>
      <p className="text-xs text-muted-foreground mt-1">
        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
      </p>
    </div>
  </div>
);

export const PostDetailModal = ({ post, isOpen, onClose }: PostDetailModalProps) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");

  // Hooks for functionality
  const postId = post?.id as string | undefined;
  const { isLiked, toggleLike, likesCount } = useLikes('post', postId);
  const { data: comments = [], isLoading: areCommentsLoading } = useComments(postId);
  const { mutate: createComment, isPending: isCreatingComment } = useCreateComment();

  if (!post) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    createComment(
      { content: newComment, postId: post.id },
      { onSuccess: () => setNewComment("") }
    );
  };

  const getInitials = (name?: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "U";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl md:max-w-5xl lg:max-w-6xl h-[90vh] p-0 gap-0">
        <div className="flex h-full">
          {/* Left Column: Media */}
          <div className="w-1/2 md:w-2/3 bg-black flex items-center justify-center h-full">
            <img 
              src={post.image_url} 
              alt={`Post by ${post.user.username}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Right Column: Comments and Details */}
          <div className="w-1/2 md:w-1/3 bg-card text-card-foreground flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={post.user.avatar} />
                  <AvatarFallback>{getInitials(post.user.displayName || post.user.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{post.user.displayName || post.user.username}</p>
                  <p className="text-xs text-muted-foreground">@{post.user.username}</p>
                </div>
              </div>
            </div>

            {/* Comments Section (Scrollable) */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Post Caption */}
                <CommentItem comment={{ ...post, user: post.user, content: post.content, created_at: post.created_at, id: `caption-${post.id}`, likes_count: 0 }} />
                
                {areCommentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  comments.map(comment => <CommentItem key={comment.id} comment={comment} />)
                )}
              </div>
            </ScrollArea>

            {/* Actions and Likes */}
            <div className="p-4 border-t space-y-2">
                <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => toggleLike()}>
                            <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon"><MessageCircle className="h-6 w-6" /></Button>
                        <Button variant="ghost" size="icon"><Send className="h-6 w-6" /></Button>
                    </div>
                    <Button variant="ghost" size="icon"><Bookmark className="h-6 w-6" /></Button>
                </div>
                <p className="text-sm font-semibold">{likesCount} likes</p>
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 p-4 border-t">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>{getInitials(user?.user_metadata?.display_name)}</AvatarFallback>
                </Avatar>
                <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isCreatingComment}
                />
                <Button type="submit" size="sm" disabled={!newComment.trim() || isCreatingComment}>
                    {isCreatingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
                </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
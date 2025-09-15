import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { usePostComments, useMemeComments, useCreateComment } from "@/hooks/useComments";
import { useAuth } from "@/contexts/AuthContext";
import { CommentItem } from "./CommentItem";

interface CommentSectionProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  memeId?: string;
}

export const CommentSection = ({ isOpen, onClose, postId, memeId }: CommentSectionProps) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  
  const { data: postComments = [], isLoading: isLoadingPostComments } = usePostComments(postId || "");
  const { data: memeComments = [], isLoading: isLoadingMemeComments } = useMemeComments(memeId || "");
  const { mutate: createComment, isPending: isCreatingComment } = useCreateComment();

  const comments = postId ? postComments : memeComments;
  const isLoading = postId ? isLoadingPostComments : isLoadingMemeComments;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    createComment(
      {
        content: newComment,
        postId,
        memeId,
      },
      {
        onSuccess: () => {
          setNewComment("");
        },
      }
    );
  };

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please log in to view and add comments.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-96">
          <div className="space-y-6 pr-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={postId}
                  memeId={memeId}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} className="flex gap-3 pt-4 border-t">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-sm">
              {user?.user_metadata?.display_name?.[0] || user?.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
              disabled={isCreatingComment}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || isCreatingComment}
            >
              {isCreatingComment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
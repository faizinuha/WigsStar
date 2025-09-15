import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { Comment, useCreateComment, useToggleCommentLike } from "@/hooks/useComments";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
  comment: Comment;
  postId?: string;
  memeId?: string;
  level?: number;
}

export const CommentItem = ({ comment, postId, memeId, level = 0 }: CommentItemProps) => {
  const { user } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const { mutate: createComment, isPending: isCreatingComment } = useCreateComment();
  const { mutate: toggleLike, isPending: isTogglingLike } = useToggleCommentLike();

  const handleReply = () => {
    if (!replyContent.trim()) return;

    createComment(
      {
        content: replyContent,
        postId,
        memeId,
        parentCommentId: comment.id,
      },
      {
        onSuccess: () => {
          setReplyContent("");
          setShowReplyInput(false);
        },
      }
    );
  };

  const handleLike = () => {
    toggleLike({
      commentId: comment.id,
      isLiked: comment.isLiked,
    });
  };

  return (
    <div className={`space-y-3 ${level > 0 ? 'ml-8 pl-4 border-l border-border' : ''}`}>
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.avatar} />
          <AvatarFallback className="text-sm">
            {comment.user.displayName?.[0] || comment.user.username?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="bg-secondary/50 rounded-2xl px-4 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {comment.user.displayName || comment.user.username}
              </span>
              <span className="text-xs text-muted-foreground">
                @{comment.user.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Button
              variant="ghost"
              size="sm"
              className={`h-auto p-1 hover:bg-transparent ${
                comment.isLiked ? 'text-red-500' : 'text-muted-foreground'
              }`}
              onClick={handleLike}
              disabled={isTogglingLike}
            >
              <Heart className={`h-3 w-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
              {comment.likes_count || 0}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 hover:bg-transparent text-muted-foreground"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Reply
            </Button>

            <Button variant="ghost" size="sm" className="h-auto p-1 hover:bg-transparent text-muted-foreground">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>

          {showReplyInput && (
            <div className="flex gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {user?.user_metadata?.display_name?.[0] || user?.email?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder={`Reply to @${comment.user.username}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="h-8 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isCreatingComment}
                  className="h-8"
                >
                  {isCreatingComment ? "..." : "Reply"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
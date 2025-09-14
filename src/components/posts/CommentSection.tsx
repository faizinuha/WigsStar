import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Heart, MessageCircle, Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  user: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  postId?: string;
  memeId?: string;
}

export const CommentSection = ({ postId, memeId }: CommentSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", postId || memeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          likes_count,
          parent_comment_id,
          profiles!comments_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq(postId ? "post_id" : "meme_id", postId || memeId)
        .is("parent_comment_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const { data: replies } = await supabase
            .from("comments")
            .select(`
              id,
              content,
              created_at,
              likes_count,
              profiles!comments_user_id_fkey (
                username,
                display_name,
                avatar_url
              )
            `)
            .eq("parent_comment_id", comment.id)
            .order("created_at", { ascending: true });

          return {
            ...comment,
            user: comment.profiles,
            replies: replies?.map(reply => ({ ...reply, user: reply.profiles })) || []
          };
        })
      );

      return commentsWithReplies;
    },
    enabled: !!(postId || memeId),
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          post_id: postId || null,
          meme_id: memeId || null,
          content,
          parent_comment_id: parentId || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId || memeId] });
      setNewComment("");
      setReplyContent("");
      setReplyTo(null);
      toast({
        title: "Comment posted!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error posting comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createCommentMutation.mutate({ content: newComment });
  };

  const handleSubmitReply = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    createCommentMutation.mutate({ content: replyContent, parentId });
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{user.user_metadata?.display_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <Button type="submit" disabled={!newComment.trim() || createCommentMutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="space-y-3">
            {/* Main Comment */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user?.avatar_url} />
                <AvatarFallback>{comment.user?.display_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="bg-muted rounded-lg p-3">
                  <div className="font-semibold text-sm">{comment.user?.display_name || comment.user?.username}</div>
                  <div className="text-sm">{comment.content}</div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  >
                    Reply
                  </Button>
                  {comment.likes_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {comment.likes_count}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Reply Form */}
            {replyTo === comment.id && user && (
              <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="flex gap-3 ml-11">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>{user.user_metadata?.display_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder={`Reply to ${comment.user?.display_name || comment.user?.username}...`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <Button type="submit" size="sm" disabled={!replyContent.trim() || createCommentMutation.isPending}>
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </form>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-11 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reply.user?.avatar_url} />
                      <AvatarFallback>{reply.user?.display_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="bg-muted rounded-lg p-2">
                        <div className="font-semibold text-xs">{reply.user?.display_name || reply.user?.username}</div>
                        <div className="text-xs">{reply.content}</div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(parseISO(reply.created_at), { addSuffix: true })}</span>
                        {reply.likes_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {reply.likes_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {comments?.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
};
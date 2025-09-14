import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Send } from "lucide-react";

interface CommentSectionProps {
  postId?: string;
  memeId?: string;
}

export const CommentSection = ({ postId, memeId }: CommentSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", postId || memeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq(postId ? "post_id" : "meme_id", postId || memeId)
        .is("parent_comment_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user profiles separately
      if (data.length === 0) return [];

      const userIds = [...new Set(data.map(comment => comment.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return data.map(comment => ({
        ...comment,
        user: profileMap.get(comment.user_id) || {
          username: 'Unknown',
          display_name: 'Unknown User',
          avatar_url: null
        }
      }));
    },
    enabled: !!(postId || memeId),
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          post_id: postId || null,
          meme_id: memeId || null,
          content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId || memeId] });
      setNewComment("");
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
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user?.avatar_url || undefined} />
              <AvatarFallback>{comment.user?.display_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="bg-muted rounded-lg p-3">
                <div className="font-semibold text-sm">{comment.user?.display_name || comment.user?.username}</div>
                <div className="text-sm">{comment.content}</div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}</span>
              </div>
            </div>
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
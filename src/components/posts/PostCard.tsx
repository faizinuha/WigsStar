import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePostComments } from '@/hooks/useComments';
import { useLikes } from '@/hooks/useLikes';
import { useDeletePost } from '@/hooks/useProfile';
import { usePostTags } from '@/hooks/useTags';
import {
  Bookmark,
  Heart,
  Laugh,
  MessageCircle,
  MoreHorizontal,
  Repeat,
  Share,
} from 'lucide-react';
import { useState } from 'react';
import { CommentSection } from './CommentSection';

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  location?: string;
  user: {
    username: string;
    displayName: string;
    avatar: string;
  };
  repost_by?: {
    username: string;
    displayName: string;
  };
}

interface PostCardProps {
  post: Post;
}

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  return `${Math.floor(diffInMinutes / 1440)}d`;
};

interface RepostCardProps {
  repost_by: { username?: string; displayName?: string } | undefined;
  children: React.ReactNode;
}

const RepostCard = ({ repost_by, children }: RepostCardProps) => (
  <div className="bg-muted/20 rounded-lg p-4 mt-2">
    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
      <Repeat className="h-4 w-4" />
      <span>Reposted by {repost_by.displayName}</span>
    </div>
    {children}
  </div>
);

export const PostCard = ({ post }: PostCardProps) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const deletePostMutation = useDeletePost();

  // Comments for preview
  const { data: commentsForPost = [], isLoading: areCommentsLoading } =
    usePostComments(post.id);

  // Prepare comment preview data (latest top-level) — compute early so hooks stay top-level
  const latestComment = commentsForPost.length
    ? commentsForPost[commentsForPost.length - 1]
    : null;
  const commentPreviewId = latestComment?.id as string | undefined;
  const {
    likesCount: previewLikesCount = 0,
    isLiked: previewIsLiked = false,
    toggleLike: togglePreviewLike,
    loading: previewLikesLoading,
  } = useLikes('comment', commentPreviewId);

  // Use shared likes hook for post to keep status accurate across relog
  const {
    likesCount: likesCountPost = 0,
    isLiked: isLikedPost = false,
    toggleLike: togglePostLike,
    loading: likesLoading,
  } = useLikes('post', post.id);

  const { data: postTags = [] } = usePostTags(post.id);

  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    if (!currentUser) {
      toast({
        title: 'Login required',
        description: 'You need to be logged in to like posts.',
        variant: 'destructive',
      });
      return;
    }

    togglePostLike();
  };

  const handleBookmark = () => {
    // bookmark persistence TODO
  };

  const handleDelete = async () => {
    await deletePostMutation.mutateAsync(post.id);
    toast({ title: 'Post deleted successfully' });
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast({ title: 'Link copied to clipboard' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by @${post.user.username}`,
        text: post.content,
        url: `${window.location.origin}/post/${post.id}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/post/${post.id}`
      );
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  const initialContent = post?.content ?? '';
  const isLongCaption = initialContent.length > 150;
  const displayContent =
    showFullCaption || !isLongCaption
      ? initialContent
      : `${initialContent.substring(0, 150)}...`;

  if (!post || !post.user) return null;

  const isOwnPost = currentUser?.id === post.user_id;

  const PostContent = () => (
    <Card className="post-card bg-card animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={post.user.avatar} alt={post.user.displayName} />
            <AvatarFallback>{post.user.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{post.user.displayName}</p>
              <Laugh className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>@{post.user.username}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwnPost ? (
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                Delete Post
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem>Follow @{post.user.username}</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCopyLink}>
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>
              Share to...
            </DropdownMenuItem>
            <DropdownMenuItem>Repost</DropdownMenuItem>
            {!isOwnPost && (
              <DropdownMenuItem className="text-destructive">
                Report
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Caption */}
      <div className="text-sm space-y-1">
        <span className="font-semibold">@{post.user.username}</span>{' '}
        <span className="whitespace-pre-wrap">{displayContent}</span>
        {isLongCaption && !showFullCaption && (
          <button
            className="text-muted-foreground hover:text-foreground ml-1"
            onClick={() => setShowFullCaption(true)}
          >
            more
          </button>
        )}
        {/* Media (Image/Video) */}
        {post.image_url && (
          <div className="aspect-square overflow-hidden bg-black flex items-center justify-center mt-2">
            {/(mp4|webm|mov)$/i.test(post.image_url) ? (
              <video
                src={post.image_url}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={post.image_url}
                alt={post.content || 'Post image'}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}
        {/* Actions */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowComments(true)}
                aria-label="Open comments"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="h-6 w-6" />
                <span className="text-sm">
                  {post.comments?.toLocaleString?.() ?? 0}
                </span>
              </button>

              <button
                aria-label="Repost"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Repeat className="h-6 w-6" />
              </button>

              <button
                onClick={handleLike}
                aria-label="Like post"
                disabled={likesLoading}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  isLikedPost
                    ? 'text-red-500'
                    : 'text-muted-foreground hover:text-red-500'
                }`}
              >
                <Heart
                  className={`h-6 w-6 ${isLikedPost ? 'fill-red-500' : ''}`}
                />
                <span className="text-sm">
                  {likesCountPost?.toLocaleString?.() ?? (post.likes || 0)}
                </span>
              </button>

              <button
                onClick={handleShare}
                aria-label="Share post"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-green-500 transition-colors"
              >
                <Share className="h-6 w-6" />
              </button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={handleBookmark}
            >
              <Bookmark
                className={`h-6 w-6 transition-colors ${
                  post.isBookmarked
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'hover:text-yellow-500'
                }`}
              />
            </Button>
          </div>

          {/* Likes Count */}
          <div className="text-sm font-semibold">
            {likesCountPost?.toLocaleString?.() ??
              (post.likes || 0).toLocaleString()}{' '}
            likes
          </div>
        </div>
        {/* Hashtags */}
        {postTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {postTags.map((tag: string, idx: number) => (
              <span
                key={idx}
                className="text-xs text-primary bg-primary/10 rounded px-2 py-1 font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {/* Comment preview (latest) */}
        {areCommentsLoading && (
          <div className="mt-3 border-t pt-3 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          </div>
        )}
        {latestComment && (
          <div className="mt-3 border-t pt-3 w-full flex items-start gap-3">
            <button
              onClick={() => setShowComments(true)}
              className="flex items-start gap-3 flex-1 text-left"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={latestComment.user.avatar}
                  alt={latestComment.user.displayName}
                />
                <AvatarFallback>
                  {latestComment.user.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="text-sm">
                  <span className="font-semibold mr-2">
                    {latestComment.user.displayName}
                  </span>
                  <span className="text-muted-foreground">
                    @{latestComment.user.username}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {latestComment.content}
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!commentPreviewId) return;
                  togglePreviewLike();
                }}
                className={`flex items-center gap-1 text-xs hover:text-foreground transition-colors ${
                  previewIsLiked ? 'text-red-500' : 'text-muted-foreground'
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${previewIsLiked ? 'fill-red-500' : ''}`}
                />
                <span className="text-xs">{previewLikesCount}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  if (post.repost_by)
    return (
      <RepostCard repost_by={post.repost_by}>
        <PostContent />
      </RepostCard>
    );

  return (
    <>
      <PostContent />
      {post.id && (
        <CommentSection
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          postId={post.id}
        />
      )}
    </>
  );
};

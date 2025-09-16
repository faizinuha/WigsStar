import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PostCard } from "./PostCard";
import { Post } from "@/hooks/useProfile";

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PostDetailModal = ({ post, isOpen, onClose }: PostDetailModalProps) => {
  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <PostCard post={post} />
      </DialogContent>
    </Dialog>
  );
};
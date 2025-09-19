import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { X, UserPlus, UserMinus } from "lucide-react";
import { useFollowStatus, useToggleFollow } from "@/hooks/useFollow";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/hooks/useProfile";
import { useAllProfiles } from "@/hooks/useAllProfiles";

interface SuggestedUser {
  avatar_url: string;
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  mutualFollows?: number; // Optional, as it might not always be present
}



export const SuggestedFriends = () => {
  const { user } = useAuth();
  const { data: currentUserProfile } = useProfile();
  const { data: allProfiles, isLoading } = useAllProfiles();
  const [dismissedUsers, setDismissedUsers] = useState<string[]>([]);

  if (!user || !currentUserProfile || isLoading) return null;

  // Filter: bukan user sendiri, bukan yang sudah dismissed, dan batasi 5
  const visibleUsers = (allProfiles || [])
    .filter((u: any) => u.user_id !== user.id && !dismissedUsers.includes(u.user_id))
    .slice(0, 5)
    .map((u: any) => ({
      id: u.user_id,
      username: u.username,
      displayName: u.display_name || u.username,
      avatar_url: u.avatar_url || "/assets/placeholder/cewek.png",
      avatar: u.avatar_url || "/assets/placeholder/cewek.png", // Ensure avatar is present
    }));

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Current User Section */}
          <h2 className="text-lg font-semibold">Current user</h2>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={currentUserProfile.avatar_url || '/assets/placeholder/cewek.png'} />
              <AvatarFallback>{currentUserProfile.display_name?.charAt(0) || currentUserProfile.username?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-base">{currentUserProfile.display_name || currentUserProfile.username}</h3>
              <p className="text-sm text-muted-foreground">@{currentUserProfile.username}</p>
            </div>
          </div>

          <Separator />

          {/* Suggested Users Section */}
          <h2 className="text-lg font-semibold">Suggested for you</h2>
          <div className="flex flex-col gap-2">
            {visibleUsers.map((suggestedUser) => (
              <SuggestedUserCard
                key={suggestedUser.id}
                user={suggestedUser}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SuggestedUserCardProps {
  user: SuggestedUser;
}

const SuggestedUserCard = ({ user: suggestedUser }: SuggestedUserCardProps) => {
  const { data: followStatus } = useFollowStatus(suggestedUser.id);
  const toggleFollowMutation = useToggleFollow();
  const { toast } = useToast();

  const handleFollow = async () => {
    try {
      await toggleFollowMutation.mutateAsync({
        userId: suggestedUser.id,
        isFollowing: followStatus || false
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={suggestedUser.avatar_url} />
          <AvatarFallback>{suggestedUser.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-sm">{suggestedUser.displayName}</h3>
          <p className="text-xs text-muted-foreground">@{suggestedUser.username}</p>
        </div>
      </div>
      <Button
        size="sm"
        className="h-7 px-3"
        onClick={handleFollow}
        disabled={toggleFollowMutation.isPending}
      >
        {followStatus ? 'Unfollow' : 'Follow'}
      </Button>
    </div>
  );
};
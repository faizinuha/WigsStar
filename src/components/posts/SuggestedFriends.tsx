import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { X, UserPlus, UserMinus } from "lucide-react";
import { useFollowStatus, useToggleFollow } from "@/hooks/useFollow";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface SuggestedUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  mutualFollows?: number;
}

const mockSuggestedUsers: SuggestedUser[] = [
  {
    id: "1",
    username: "sarah_design",
    displayName: "Sarah Designer",
    avatar: "/placeholder.svg",
    mutualFollows: 5
  },
  {
    id: "2", 
    username: "dev_mike",
    displayName: "Mike Dev",
    avatar: "/placeholder.svg",
    mutualFollows: 12
  },
  {
    id: "3",
    username: "artist_jane",
    displayName: "Jane Artist", 
    avatar: "/placeholder.svg",
    mutualFollows: 8
  },
  {
    id: "4",
    username: "photographer_alex",
    displayName: "Alex Photo",
    avatar: "/placeholder.svg",
    mutualFollows: 3
  }
];

export const SuggestedFriends = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dismissedUsers, setDismissedUsers] = useState<string[]>([]);
  
  const visibleUsers = mockSuggestedUsers.filter(u => !dismissedUsers.includes(u.id));
  
  if (!user || visibleUsers.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <h2 className="text-lg font-semibold">Suggested for you</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex overflow-x-auto gap-4 pb-2">
          {visibleUsers.map((suggestedUser) => (
            <SuggestedUserCard
              key={suggestedUser.id}
              user={suggestedUser}
              onDismiss={() => setDismissedUsers(prev => [...prev, suggestedUser.id])}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface SuggestedUserCardProps {
  user: SuggestedUser;
  onDismiss: () => void;
}

const SuggestedUserCard = ({ user: suggestedUser, onDismiss }: SuggestedUserCardProps) => {
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
    <div className="flex-shrink-0 w-40 bg-muted/30 rounded-lg p-4 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="text-center space-y-3">
        <Avatar className="h-16 w-16 mx-auto">
          <AvatarImage src={suggestedUser.avatar} />
          <AvatarFallback>{suggestedUser.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="space-y-1">
          <h3 className="font-semibold text-sm">{suggestedUser.displayName}</h3>
          <p className="text-xs text-muted-foreground">@{suggestedUser.username}</p>
          {suggestedUser.mutualFollows && (
            <p className="text-xs text-muted-foreground">
              {suggestedUser.mutualFollows} mutual follows
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 h-8"
            onClick={handleFollow}
            disabled={toggleFollowMutation.isPending}
          >
            {followStatus ? (
              <>
                <UserMinus className="h-3 w-3 mr-1" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3 mr-1" />
                Follow
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3"
            onClick={onDismiss}
          >
            Not interested
          </Button>
        </div>
      </div>
    </div>
  );
};
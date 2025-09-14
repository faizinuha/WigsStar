import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const StoriesSection = () => {
  const { user } = useAuth();
  const [showCreateStory, setShowCreateStory] = useState(false);

  // Mock stories data for now
  const mockStories = [
    { id: "1", username: "alice_wonder", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b977?w=150&h=150&fit=crop&crop=face" },
    { id: "2", username: "bob_builder", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
    { id: "3", username: "charlie_cat", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
  ];

  return (
    <Card className="p-4">
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {/* Your Story */}
        <div className="flex flex-col items-center space-y-2 min-w-[70px]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent p-[2px]">
              <Avatar className="w-full h-full border-2 border-background">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
            </div>
            <Button
              size="sm"
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0"
              onClick={() => setShowCreateStory(true)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">Your Story</span>
        </div>
        
        {/* Other Stories */}
        {mockStories.map((story) => (
          <div key={story.id} className="flex flex-col items-center space-y-2 min-w-[70px] cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent p-[2px]">
              <Avatar className="w-full h-full border-2 border-background">
                <AvatarImage src={story.avatar} />
                <AvatarFallback>{story.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs text-muted-foreground truncate w-16 text-center" title={story.username}>
              {story.username}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

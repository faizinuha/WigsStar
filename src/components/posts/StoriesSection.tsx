import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateStoryModal } from "./CreateStoryModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const StoriesSection = () => {
  const { user } = useAuth();
  const [showCreateStory, setShowCreateStory] = useState(false);

  const { data: stories } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select(`
          id,
          media_url,
          created_at,
          user:profiles!user_id(username, display_name, avatar_url)
        `)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <>
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
          {stories?.map((story) => (
            <div key={story.id} className="flex flex-col items-center space-y-2 min-w-[70px] cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent p-[2px]">
                <Avatar className="w-full h-full border-2 border-background">
                  <AvatarImage src={story.user?.avatar_url} />
                  <AvatarFallback>{story.user?.display_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs text-muted-foreground truncate w-16 text-center" title={story.user?.username}>
                {story.user?.username}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <CreateStoryModal 
        isOpen={showCreateStory}
        onClose={() => setShowCreateStory(false)}
      />
    </>
  );
};

import { useNavigate } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Users, Search, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Chat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, isLoading } = useConversations();

  const getConversationName = (conv: any) => {
    if (conv.is_group) return conv.name || 'Group Chat';
    const otherMember = conv.members.find((m: any) => m.user_id !== user?.id);
    return otherMember?.display_name || otherMember?.username || 'Unknown';
  };

  const getConversationAvatar = (conv: any) => {
    if (conv.is_group) return null;
    const otherMember = conv.members.find((m: any) => m.user_id !== user?.id);
    return otherMember?.avatar_url;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - Instagram Style */}
      <div className="w-full md:w-96 border-r flex flex-col bg-background">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{user?.user_metadata?.username || 'Messages'}</h1>
            <Button variant="ghost" size="icon">
              <Edit className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages"
              className="pl-9 bg-muted/50"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start a conversation by visiting a user's profile
              </p>
            </div>
          ) : (
            <div>
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => navigate(`/chat/${conversation.id}`)}
                  className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer transition-colors border-b"
                >
                  <Avatar className="h-14 w-14 border-2 border-border">
                    <AvatarImage src={getConversationAvatar(conversation) || undefined} />
                    <AvatarFallback className="bg-muted">
                      {conversation.is_group ? (
                        <Users className="h-6 w-6" />
                      ) : (
                        getConversationName(conversation)[0]?.toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate text-sm">
                        {getConversationName(conversation)}
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(conversation.last_message_at), {
                          addSuffix: false,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate flex-1 ${
                        conversation.unread_count > 0 
                          ? 'font-semibold text-foreground' 
                          : 'text-muted-foreground font-normal'
                      }`}>
                        {conversation.last_message || 'Start the conversation'}
                      </p>
                      {conversation.unread_count > 0 && (
                        <Badge 
                          variant="default" 
                          className="h-5 min-w-[20px] flex items-center justify-center px-1.5 text-xs rounded-full bg-primary"
                        >
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area - Hidden on mobile, shown when conversation selected */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-muted/30">
        <div className="text-center p-8">
          <MessageCircle className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
          <p className="text-muted-foreground">
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    </div>
  );
}

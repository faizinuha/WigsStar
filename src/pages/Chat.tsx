import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Chat() {
  const navigate = useNavigate();
  const { conversations, isLoading } = useConversations();

  const getConversationName = (conv: any) => {
    if (conv.is_group) return conv.name || 'Group Chat';
    const otherMember = conv.members.find((m: any) => m.user_id !== conv.members[0]?.user_id);
    return otherMember?.display_name || otherMember?.username || 'Unknown';
  };

  const getConversationAvatar = (conv: any) => {
    if (conv.is_group) return null;
    const otherMember = conv.members.find((m: any) => m.user_id !== conv.members[0]?.user_id);
    return otherMember?.avatar_url;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No conversations yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start a conversation by visiting a user's profile
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => navigate(`/chat/${conversation.id}`)}
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-accent cursor-pointer transition-colors"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={getConversationAvatar(conversation) || undefined} />
                <AvatarFallback>
                  {conversation.is_group ? (
                    <Users className="h-6 w-6" />
                  ) : (
                    getConversationName(conversation)[0]?.toUpperCase()
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold truncate">
                    {getConversationName(conversation)}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.last_message_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.last_message || 'No messages yet'}
                  </p>
                  {conversation.unread_count > 0 && (
                    <Badge variant="default" className="ml-2">
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
  );
}

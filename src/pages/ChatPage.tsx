import { Navigation } from '@/components/layout/Navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { Skeleton } from '@/components/ui/skeleton';
import { useConversations } from '@/hooks/useConversations';
import { BellOff, CheckCircle, Trash2 } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { conversations, loading } = useConversations();

  const handleConversationClick = (conversationId: string, isGroup: boolean) => {
    navigate(`/chat/${conversationId}`, { state: { isGroup } });
  };

  return (
    <div className="flex h-screen">
      <Navigation />
      <div className="flex-grow flex flex-col">
        <div className="container mx-auto p-4 flex-grow">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Chats</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
              {loading ? (
                <div className="flex flex-col gap-4 p-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {conversations.map((convo) => (
                    <ContextMenu key={convo.id}>
                      <ContextMenuTrigger>
                        <div
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          onClick={() => handleConversationClick(convo.id, convo.is_group || false)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={convo.avatar_url || undefined} alt={convo.name} />
                            <AvatarFallback>{convo.name?.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-grow overflow-hidden">
                            <p className="font-semibold truncate">{convo.name}</p>
                            <p className={`text-sm ${convo.unread_count > 0 ? 'text-black dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400'} truncate`}>
                              {convo.last_message}
                            </p>
                          </div>
                          <div className="flex flex-col items-end self-start min-w-max">
                            <p className={`text-xs mb-1 ${convo.unread_count > 0 ? 'text-blue-500' : 'text-gray-400'}`}>{convo.last_message_at ? new Date(convo.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                            {convo.unread_count > 0 && (
                              <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {convo.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-64">
                        <ContextMenuItem inset>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Read
                        </ContextMenuItem>
                        <ContextMenuItem inset>
                           <BellOff className="mr-2 h-4 w-4" />
                           Mute Notifications
                        </ContextMenuItem>
                        <ContextMenuItem inset className="text-red-600">
                           <Trash2 className="mr-2 h-4 w-4" />
                           Delete Chat
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
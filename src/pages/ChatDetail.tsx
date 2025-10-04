import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, MoreVertical, Phone, Video } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ChatDetail() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, isLoading } = useMessages(chatId);
  const { mutate: sendMessage } = useSendMessage();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !chatId) return;

    sendMessage({
      conversationId: chatId,
      content: newMessage.trim(),
    });
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherUser = messages[0]?.sender_id !== user?.id ? messages[0]?.sender : messages[1]?.sender;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header - Instagram Style */}
      <div className="border-b p-3 flex items-center justify-between bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : (
            <>
              <Avatar className="h-10 w-10 border-2 border-border">
                <AvatarImage src={otherUser?.avatar_url || undefined} />
                <AvatarFallback className="bg-muted">
                  {otherUser?.display_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="font-semibold text-sm">{otherUser?.display_name || 'Chat'}</h1>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`flex items-start gap-2 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className={`space-y-2 ${i % 2 === 0 ? '' : 'items-end'}`}>
                  <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-64' : 'w-48'} rounded-2xl`} />
                </div>
              </div>
            ))}
          </div>
        ) : messages.map((message) => {
          const isOwnMessage = message.sender_id === user?.id;
          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                isOwnMessage ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarImage src={message.sender.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {message.sender.display_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col max-w-[70%] ${
                  isOwnMessage ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`rounded-3xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}
                >
                  <p className="text-sm break-words leading-relaxed">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1 px-2">
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: false,
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Instagram Style */}
      <div className="border-t p-3 bg-background">
        <div className="flex gap-2 items-center max-w-4xl mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message..."
            className="flex-1 rounded-full border-2 px-4 py-2 bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button 
            onClick={handleSend} 
            disabled={!newMessage.trim()}
            size="icon"
            className="rounded-full h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

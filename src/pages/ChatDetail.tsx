import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Mic } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useMessages, Message } from '@/hooks/useMessages';
import { Skeleton } from '@/components/ui/skeleton';

const ChatDetailPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isGroup } = location.state || { isGroup: false };

  const { messages, info, loading, sendMessage, currentUserProfile } = useMessages({
      conversationId: chatId || '',
      isGroup: isGroup
  });

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessage(newMessage);
    setNewMessage('');
  };

  if (loading) {
    return (
        <div className="flex flex-col h-screen">
            {/* Header Skeleton */}
            <header className="flex items-center gap-4 p-3 border-b dark:border-gray-800">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                </div>
            </header>
            {/* Body Skeleton */}
            <main className="flex-grow p-4 space-y-4">
                <Skeleton className="h-16 w-3/4 rounded-lg" />
                <Skeleton className="h-16 w-3/4 rounded-lg self-end ml-auto" />
                <Skeleton className="h-10 w-1/2 rounded-lg" />
                <Skeleton className="h-16 w-3/4 rounded-lg self-end ml-auto" />
            </main>
            {/* Footer Skeleton */}
            <footer className="p-3 border-t dark:border-gray-800">
                <Skeleton className="h-10 w-full rounded-lg" />
            </footer>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="flex items-center gap-4 p-3 border-b dark:border-gray-800 bg-white dark:bg-gray-900/50 backdrop-blur-lg sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate('/chat')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        {info && (
            <Link to={!isGroup ? `/profile/${info.id}` : '#'} className="flex items-center gap-3">
                <div className="relative">
                    <Avatar>
                    <AvatarImage src={info.avatar_url || undefined} alt={info.name} />
                    <AvatarFallback>{info.name?.substring(0, 2) || '??'}</AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    <h2 className="font-semibold text-lg">{info.name}</h2>
                </div>
            </Link>
        )}
      </header>

      {/* Message List */}
      <main className="flex-grow p-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender_id === currentUserProfile?.id ? 'items-end' : 'items-start'}`}>
                 <div className={`flex items-center gap-2 ${msg.sender_id === currentUserProfile?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.profiles?.avatar_url || undefined} />
                        <AvatarFallback>{msg.profiles?.username?.substring(0,2) || '??'}</AvatarFallback>
                    </Avatar>
                    <Card className={`max-w-xs md:max-w-lg p-3 rounded-2xl ${ 
                        msg.sender_id === currentUserProfile?.id
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 dark:bg-gray-800 rounded-bl-none'
                    }`}>
                        <p>{msg.content}</p>
                    </Card>
                 </div>
                <span className="text-xs text-gray-400 mt-1 px-2">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message Input */}
      <footer className="p-3 border-t dark:border-gray-800 bg-white dark:bg-gray-900/50 backdrop-blur-lg sticky bottom-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow bg-gray-100 dark:bg-gray-800 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
           <Button type="button" variant="ghost" size="icon">
              <Mic className="h-5 w-5" />
          </Button>
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
};

export default ChatDetailPage;
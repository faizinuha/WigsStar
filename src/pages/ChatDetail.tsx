import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Message, useMessages } from '@/hooks/useMessages';
import {
  ArrowLeft,
  MessageSquareReply,
  Mic,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Send,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

const ChatDetailPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isGroup } = location.state || { isGroup: false };

  const {
    messages,
    info,
    loading,
    sendMessage,
    currentUserProfile,
    editMessage,
    deleteMessage,
  } = useMessages({
    conversationId: chatId || '',
    isGroup: isGroup,
  });

  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (editingMessage) {
      await editMessage(editingMessage.id, newMessage.trim());
      setEditingMessage(null);
    } else {
      await sendMessage(newMessage.trim(), replyingTo?.id);
      setReplyingTo(null);
    }
    setNewMessage('');
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        {/* Header Skeleton */}
        <header className="flex items-center gap-4 p-3 border-b dark:border-gray-800">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </header>
        {/* Body Skeleton */}
        <main className="flex-grow p-4 space-y-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${
                i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-16 w-3/4 rounded-lg" />
            </div>
          ))}
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
          <Link
            to={!isGroup ? `/profile/${info.id}` : '#'}
            className="flex items-center gap-3"
          >
            <Avatar>
              <AvatarImage src={info.avatar_url} alt={info.name} />
              <AvatarFallback>{info.name?.substring(0, 2) || '??'}</AvatarFallback>
            </Avatar>
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
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwnMessage={msg.sender_id === currentUserProfile?.id}
              onReply={() => setReplyingTo(msg)}
              onEdit={() => {
                setEditingMessage(msg);
                setNewMessage(msg.content);
              }}
              onDelete={() => deleteMessage(msg.id)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message Input */}
      <footer className="p-3 border-t dark:border-gray-800 bg-white dark:bg-gray-900/50 backdrop-blur-lg sticky bottom-0">
        {replyingTo && (
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded-t-md flex justify-between items-center">
            <div>
              <p className="font-bold">Membalas kepada {replyingTo.profiles?.username}</p>
              <p className="truncate">{replyingTo.content}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCancelReply}>Batal</Button>
          </div>
        )}
        {editingMessage && (
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded-t-md flex justify-between items-center">
            <p className="font-bold">Mengedit pesan...</p>
            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Batal</Button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            type="text"
            placeholder="Ketik pesan..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
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

interface MessageBubbleProps {
  message: any;
  isOwnMessage: boolean;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, onReply, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex items-center gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.profiles?.avatar_url} />
          <AvatarFallback>{message.profiles?.username?.substring(0, 2) || '??'}</AvatarFallback>
        </Avatar>
        <div className="relative">
          <Card
            className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isOwnMessage ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
            {message.reply_to && message.replied_to_message && (
              <div className="text-xs opacity-80 border-l-2 pl-2 mb-2">
                <p className="font-bold">{message.replied_to_message.profiles?.username}</p>
                <p>{message.replied_to_message.content}</p>
              </div>
            )}
            <p>{message.content}</p>
          </Card>
          {isHovered && (
            <div className={`absolute top-1/2 -translate-y-1/2 ${isOwnMessage ? 'left-[-40px]' : 'right-[-40px]'}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={onReply}>
                    <MessageSquareReply className="mr-2 h-4 w-4" />
                    <span>Balas</span>
                  </DropdownMenuItem>
                  {isOwnMessage && (
                    <>
                      <DropdownMenuItem onClick={onEdit}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Hapus</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-1 px-10">
        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

export default ChatDetailPage;
import { Navigation } from '@/components/layout/Navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useConversations } from '@/hooks/useConversations';
import { useProfile } from '@/hooks/useProfile';
import supabase from '@/lib/supabase';
import { CheckCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'group' | 'dm'>('all');
  const { data: currentUserProfile } = useProfile();
  const { conversations, loading, fetchConversations } = useConversations();

  // Modal & input state
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [errorCreate, setErrorCreate] = useState('');

  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [errorEdit, setErrorEdit] = useState('');

  const handleConversationClick = (
    conversationId: string,
    isGroup: boolean
  ) => {
    navigate(`/chat/${conversationId}`, { state: { isGroup } });
  };

  const refreshConversations = () => {
    if (currentUserProfile?.id) {
      fetchConversations(currentUserProfile.id);
    }
  };

  const handleCreateGroup = async () => {
    setErrorCreate('');
    if (!groupName.trim()) {
      setErrorCreate('Nama grup wajib diisi');
      return;
    }
    if (!currentUserProfile?.id) {
      setErrorCreate('User belum login');
      return;
    }
    setLoadingCreate(true);
    const { error } = await supabase.from('groups').insert({
      name: groupName.trim(),
      description: groupDesc.trim(),
      creator_id: currentUserProfile.id,
      is_private: false, // Or add a UI toggle for this
    });
    setLoadingCreate(false);
    if (error) {
      setErrorCreate(error.message || 'Gagal membuat grup');
      return;
    }
    setShowCreateGroup(false);
    setGroupName('');
    setGroupDesc('');
    refreshConversations();
  };

  const handleEditGroup = async () => {
    setErrorEdit('');
    if (!editGroupName.trim() || !editGroupId) {
      setErrorEdit('Nama grup wajib diisi');
      return;
    }
    setLoadingEdit(true);
    const { error } = await supabase
      .from('groups')
      .update({
        name: editGroupName.trim(),
        description: editGroupDesc.trim(),
      })
      .eq('id', editGroupId);
    setLoadingEdit(false);
    if (error) {
      setErrorEdit(error.message || 'Gagal edit grup');
      return;
    }
    setShowEditGroup(false);
    setEditGroupId(null);
    setEditGroupName('');
    setEditGroupDesc('');
    refreshConversations();
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Yakin hapus grup ini? Seluruh pesan di dalamnya akan hilang.'))
      return;

    const { error } = await supabase.from('groups').delete().eq('id', groupId);
    if (error) {
      alert(error.message || 'Gagal menghapus grup');
    } else {
      refreshConversations();
    }
  };

  const filteredConversations = useMemo(() => {
    if (activeTab === 'all') return conversations;
    if (activeTab === 'group') return conversations.filter((c) => c.is_group);
    if (activeTab === 'dm') return conversations.filter((c) => !c.is_group);
    return [];
  }, [conversations, activeTab]);

  return (
    <div className="flex h-screen">
      <Navigation />
      <div className="flex-grow flex flex-col">
        <div className="container mx-auto p-4 flex-grow">
          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveTab('all')}
            >
              Semua
            </Button>
            <Button
              variant={activeTab === 'group' ? 'default' : 'outline'}
              onClick={() => setActiveTab('group')}
            >
              Grup
            </Button>
            <Button
              variant={activeTab === 'dm' ? 'default' : 'outline'}
              onClick={() => setActiveTab('dm')}
            >
              Pesan Langsung
            </Button>
            <Button
              className="ml-auto bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setShowCreateGroup(true)}
            >
              + Buat Grup
            </Button>
          </div>

          {/* Modals */}
          {showCreateGroup && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Buat Grup Baru</h2>
                <input
                  className="w-full mb-2 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Nama Grup"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={loadingCreate}
                />
                <textarea
                  className="w-full mb-2 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Deskripsi Grup"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  disabled={loadingCreate}
                />
                {errorCreate && (
                  <div className="text-red-500 mb-2 text-sm">{errorCreate}</div>
                )}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateGroup(false)}
                    disabled={loadingCreate}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={loadingCreate || !groupName.trim()}
                  >
                    {loadingCreate ? 'Membuat...' : 'Buat'}
                  </Button>
                </div>
              </div>
            </div>
          )}
          {showEditGroup && (
             <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
             <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
               <h2 className="text-lg font-bold mb-4">Edit Grup</h2>
               <input
                 className="w-full mb-2 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                 placeholder="Nama Grup"
                 value={editGroupName}
                 onChange={(e) => setEditGroupName(e.target.value)}
                 disabled={loadingEdit}
               />
               <textarea
                 className="w-full mb-2 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                 placeholder="Deskripsi Grup"
                 value={editGroupDesc}
                 onChange={(e) => setEditGroupDesc(e.target.value)}
                 disabled={loadingEdit}
               />
               {errorEdit && (
                 <div className="text-red-500 mb-2 text-sm">{errorEdit}</div>
               )}
               <div className="flex gap-2 justify-end">
                 <Button
                   variant="outline"
                   onClick={() => setShowEditGroup(false)}
                   disabled={loadingEdit}
                 >
                   Batal
                 </Button>
                 <Button
                   onClick={handleEditGroup}
                   disabled={loadingEdit || !editGroupName.trim()}
                 >
                   {loadingEdit ? 'Menyimpan...' : 'Simpan'}
                 </Button>
               </div>
             </div>
           </div>
          )}

          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Chats</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto p-0">
              {loading ? (
                <div className="p-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Nama</TableHead>
                      <TableHead>Pesan Terakhir</TableHead>
                      <TableHead className="text-right w-[100px]">Waktu</TableHead>
                      <TableHead className="text-right w-[50px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConversations.map((convo) => (
                      <TableRow
                        key={convo.id}
                        onClick={() => handleConversationClick(convo.id, convo.is_group)}
                        className="cursor-pointer"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={convo.avatar_url} alt={convo.name} />
                              <AvatarFallback>{convo.name?.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold truncate">{convo.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="truncate">
                          <p className={`text-sm ${convo.unread_count > 0 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                            {convo.last_message || 'Tidak ada pesan'}
                          </p>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {convo.last_message_at
                            ? new Date(convo.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </TableCell>
                        <TableCell className="text-right">
                          {convo.is_group && (
                            <DropdownMenu onOpenChange={(e) => e.stopPropagation()}>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditGroupId(convo.id);
                                    setEditGroupName(convo.name || '');
                                    setEditGroupDesc(convo.description || '');
                                    setShowEditGroup(true);
                                  }}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  <span>Edit Grup</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-500 focus:text-red-500"
                                  onClick={() => handleDeleteGroup(convo.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Hapus Grup</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
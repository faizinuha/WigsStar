import { Navigation } from '@/components/layout/Navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useConversations } from '@/hooks/useConversations';
import { useProfile } from '@/hooks/useProfile';
import supabase from '@/lib/supabase';
import { CheckCircle, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'group' | 'public' | 'private' | 'nonprivate'
  >('group');
  const { conversations, loading } = useConversations();
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
  const [loadingDelete, setLoadingDelete] = useState(false);
  const { data: currentUserProfile } = useProfile();

  const handleConversationClick = (
    conversationId: string,
    isGroup: boolean
  ) => {
    navigate(`/chat/${conversationId}`, { state: { isGroup } });
  };

  return (
    <div className="flex h-screen">
      <Navigation />
      <div className="flex-grow flex flex-col">
        <div className="container mx-auto p-4 flex-grow">
          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'group'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-800'
              }`}
              onClick={() => setActiveTab('group')}
            >
              Grup
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'public'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-800'
              }`}
              onClick={() => setActiveTab('public')}
            >
              Grup Publik
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'private'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-800'
              }`}
              onClick={() => setActiveTab('private')}
            >
              Pesan Pribadi
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'nonprivate'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-800'
              }`}
              onClick={() => setActiveTab('nonprivate')}
            >
              Pesan Non-Pribadi
            </button>
            <button
              className="ml-auto px-4 py-2 bg-green-500 text-white rounded-lg"
              onClick={() => setShowCreateGroup(true)}
            >
              + Buat Grup
            </button>
          </div>
          {/* Modal Buat Grup (integrasi database) */}
          {showCreateGroup && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Buat Grup Baru</h2>
                <input
                  className="w-full mb-2 p-2 border rounded"
                  placeholder="Nama Grup"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={loadingCreate}
                />
                <textarea
                  className="w-full mb-2 p-2 border rounded"
                  placeholder="Deskripsi Grup"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  disabled={loadingCreate}
                />
                {errorCreate && (
                  <div className="text-red-500 mb-2 text-sm">{errorCreate}</div>
                )}
                <div className="flex gap-2 justify-end">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={() => {
                      setShowCreateGroup(false);
                      setGroupName('');
                      setGroupDesc('');
                      setErrorCreate('');
                    }}
                    disabled={loadingCreate}
                  >
                    Batal
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    disabled={loadingCreate || !groupName.trim()}
                    onClick={async () => {
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
                        is_private: false,
                      });
                      setLoadingCreate(false);
                      if (error) {
                        setErrorCreate(error.message || 'Gagal membuat grup');
                        return;
                      }
                      setShowCreateGroup(false);
                      setGroupName('');
                      setGroupDesc('');
                    }}
                  >
                    {loadingCreate ? 'Menyimpan...' : 'Buat'}
                  </button>
                </div>
              </div>
            </div>
          )}
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
                          onClick={() =>
                            handleConversationClick(
                              convo.id,
                              convo.is_group || false
                            )
                          }
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={convo.avatar_url || undefined}
                              alt={convo.name}
                            />
                            <AvatarFallback>
                              {convo.name?.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-grow overflow-hidden">
                            <p className="font-semibold truncate">
                              {convo.name}
                            </p>
                            <p
                              className={`text-sm ${
                                convo.unread_count > 0
                                  ? 'text-black dark:text-white font-bold'
                                  : 'text-gray-500 dark:text-gray-400'
                              } truncate`}
                            >
                              {convo.last_message}
                            </p>
                          </div>
                          <div className="flex flex-col items-end self-start min-w-max">
                            <p
                              className={`text-xs mb-1 ${
                                convo.unread_count > 0
                                  ? 'text-blue-500'
                                  : 'text-gray-400'
                              }`}
                            >
                              {convo.last_message_at
                                ? new Date(
                                    convo.last_message_at
                                  ).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </p>
                            {convo.unread_count > 0 && (
                              <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {convo.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-64">
                        <ContextMenuItem
                          inset
                          onClick={() => {
                            setEditGroupId(convo.id);
                            setEditGroupName(convo.name || '');
                            setEditGroupDesc(convo.description || '');
                            setShowEditGroup(true);
                          }}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Edit Grup
                        </ContextMenuItem>
                        <ContextMenuItem
                          inset
                          onClick={async () => {
                            if (!window.confirm('Yakin hapus grup ini?'))
                              return;
                            setLoadingDelete(true);
                            await supabase
                              .from('groups')
                              .delete()
                              .eq('id', convo.id);
                            setLoadingDelete(false);
                            // TODO: refresh list
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus Grup
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                  {/* Modal Edit Grup */}
                  {showEditGroup && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">Edit Grup</h2>
                        <input
                          className="w-full mb-2 p-2 border rounded"
                          placeholder="Nama Grup"
                          value={editGroupName}
                          onChange={(e) => setEditGroupName(e.target.value)}
                          disabled={loadingEdit}
                        />
                        <textarea
                          className="w-full mb-2 p-2 border rounded"
                          placeholder="Deskripsi Grup"
                          value={editGroupDesc}
                          onChange={(e) => setEditGroupDesc(e.target.value)}
                          disabled={loadingEdit}
                        />
                        {errorEdit && (
                          <div className="text-red-500 mb-2 text-sm">
                            {errorEdit}
                          </div>
                        )}
                        <div className="flex gap-2 justify-end">
                          <button
                            className="px-4 py-2 bg-gray-300 rounded"
                            onClick={() => {
                              setShowEditGroup(false);
                              setEditGroupId(null);
                              setEditGroupName('');
                              setEditGroupDesc('');
                              setErrorEdit('');
                            }}
                            disabled={loadingEdit}
                          >
                            Batal
                          </button>
                          <button
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                            disabled={loadingEdit || !editGroupName.trim()}
                            onClick={async () => {
                              setErrorEdit('');
                              if (!editGroupName.trim()) {
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
                                setErrorEdit(
                                  error.message || 'Gagal edit grup'
                                );
                                return;
                              }
                              setShowEditGroup(false);
                              setEditGroupId(null);
                              setEditGroupName('');
                              setEditGroupDesc('');
                            }}
                          >
                            {loadingEdit ? 'Menyimpan...' : 'Simpan'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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

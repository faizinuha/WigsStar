import { useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EditUserModal } from "@/components/admin/EditUserModal";
import UserActivityChart from "@/components/admin/UserActivityChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Users, FileText, Heart, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Navigation } from "@/components/layout/Navigation";

// --- INTERFACES ---
interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  display_name: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  role: string;
  is_verified: boolean;
  created_at: string;
}

// --- HELPER & DUMMY COMPONENTS ---
const StatCard = ({ title, value, icon, description }: { title: string, value: string, icon: ReactNode, description: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const MaintenanceTab = () => {
  const { toast } = useToast();
  const runAction = (actionName: string) => {
    toast({ title: "Action Triggered", description: `${actionName} has been started.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Actions</CardTitle>
        <CardDescription>Run manual system maintenance tasks.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Button variant="outline" onClick={() => runAction('Clear Application Cache')}>Clear Application Cache</Button>
        <Button variant="outline" onClick={() => runAction('Re-index Search Data')}>Re-index Search Data</Button>
        <Button variant="outline" onClick={() => runAction('Run System Health Checks')}>Run Health Checks</Button>
        <Button variant="destructive" onClick={() => runAction('Force Stop All Jobs')}>Force Stop All Jobs</Button>
      </CardContent>
    </Card>
  );
};

// --- MAIN COMPONENTS ---
const AdminPage = () => {
  return (
    <div>
      <Navigation />
      <div className="md:pl-72">
        <AdminContent />
      </div>
    </div>
  );
}

const AdminContent = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalLikes: 0, newUsersToday: 0 });
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const processAvatarUrl = async (url: string | null) => {
    if (!url || url.startsWith('http')) return url;
    try {
      const { data, error } = await supabase.storage.from('avatars').createSignedUrl(url, 3600);
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [usersRes, postsCountRes, likesCountRes] = await Promise.all([
        supabase.from("profiles").select("*, user_id:id").order("created_at", { ascending: false }),
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("likes").select("id", { count: "exact", head: true }),
      ]);

      if (usersRes.error) throw usersRes.error;
      if (postsCountRes.error) throw postsCountRes.error;
      if (likesCountRes.error) throw likesCountRes.error;

      // Process users and their avatars
      const processedUsers = await Promise.all(
        usersRes.data.map(async (u: any) => ({
          ...u,
          avatar_url: await processAvatarUrl(u.avatar_url),
          is_verified: false, // Default value since is_verified doesn't exist in profiles table
        }))
      );
      setUsers(processedUsers as Profile[]);

      // Calculate stats
      const today = new Date().setHours(0, 0, 0, 0);
      const newUsersToday = usersRes.data.filter(u => new Date(u.created_at).setHours(0, 0, 0, 0) === today).length;

      setStats({
        totalUsers: usersRes.data.length,
        totalPosts: postsCountRes.count ?? 0,
        totalLikes: likesCountRes.count ?? 0,
        newUsersToday,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({ title: "Error", description: "Failed to fetch dashboard data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleEditClick = (user: Profile) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    fetchDashboardData(); // Refetch all data after modal is closed
  };

  const handleDeleteClick = (user: Profile) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const { error } = await supabase.functions.invoke("delete-user", {
      body: { user_id: userToDelete.user_id },
    });

    if (error) {
      console.error("Error deleting user:", error);
      toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `User @${userToDelete.username} has been deleted.` });
      fetchDashboardData(); // Refresh the user list and stats
    }
    setUserToDelete(null);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={<Users className="h-4 w-4 text-muted-foreground" />} description="All registered users" />
        <StatCard title="Total Posts" value={stats.totalPosts.toLocaleString()} icon={<FileText className="h-4 w-4 text-muted-foreground" />} description="All posts created" />
        <StatCard title="Total Likes" value={stats.totalLikes.toLocaleString()} icon={<Heart className="h-4 w-4 text-muted-foreground" />} description="Across all posts and comments" />
        <StatCard title="New Users Today" value={stats.newUsersToday.toLocaleString()} icon={<UserPlus className="h-4 w-4 text-muted-foreground" />} description="Users that signed up today" />
      </div>
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>Manage and view all registered users.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Avatar</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 8 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                    : users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <img src={user.avatar_url || 'https://avatar.vercel.sh/' + user.username} alt={user.username} className="h-10 w-10 rounded-full object-cover" />
                        </TableCell>
                        <TableCell className="font-medium">{user.username || "N/A"}</TableCell>
                        <TableCell>{user.display_name || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "destructive" : "outline"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.is_verified ? "Yes" : "No"}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditClick(user)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { /* TODO: Impersonate */ }}>Impersonate</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(user)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <UserActivityChart />
          {/* You can add more charts here, e.g., PostsActivityChart */}
        </TabsContent>
        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceTab />
        </TabsContent>
      </Tabs>
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user @{userToDelete?.username} and all of their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Yes, delete user</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPage;

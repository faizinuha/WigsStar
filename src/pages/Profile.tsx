import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  MoreHorizontal, 
  Grid3X3, 
  Bookmark, 
  Heart,
  MessageCircle,
  MapPin,
  Link as LinkIcon,
  Calendar
} from "lucide-react";
import { PostCard } from "@/components/posts/PostCard";

// Mock user data
const userData = {
  id: "1",
  username: "yourname",
  displayName: "Your Name",
  bio: "Capturing life's beautiful moments ✨\nPhotographer & Content Creator 📸\nLiving life one adventure at a time 🌍",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop&crop=face",
  coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop",
  location: "San Francisco, CA",
  website: "yourname.com",
  joinDate: "March 2022",
  verified: true,
  stats: {
    posts: 127,
    followers: 2453,
    following: 892
  }
};

// Mock posts
const userPosts = [
  {
    id: "1",
    user: {
      id: "1",
      username: "yourname",
      displayName: "Your Name",
      avatar: userData.avatar
    },
    content: "Sunset vibes from today's photoshoot! Sometimes the best moments happen when you least expect them. ✨📸",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop",
    timestamp: "2 hours ago",
    likes: 234,
    comments: 12,
    isLiked: true,
    isBookmarked: false
  },
  {
    id: "2",
    user: {
      id: "1",
      username: "yourname", 
      displayName: "Your Name",
      avatar: userData.avatar
    },
    content: "Coffee and creativity fuel my mornings ☕️✨ What inspires you to start your day?",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop",
    timestamp: "1 day ago",
    likes: 189,
    comments: 8,
    isLiked: false,
    isBookmarked: true
  }
];

const Profile = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden animate-fade-in">
          {/* Cover Image */}
          <div className="h-48 md:h-64 relative overflow-hidden">
            <img 
              src={userData.coverImage} 
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          
          {/* Profile Info */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-20 md:-mt-16">
              {/* Avatar & Basic Info */}
              <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={userData.avatar} alt={userData.displayName} />
                  <AvatarFallback className="text-2xl">{userData.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="mt-4 md:mt-0 md:mb-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">{userData.displayName}</h1>
                    {userData.verified && (
                      <Badge className="starmar-gradient text-white border-0">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-lg">@{userData.username}</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  className={!isFollowing ? "gradient-button" : ""}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Bio & Details */}
            <div className="mt-6 space-y-4">
              <p className="text-foreground whitespace-pre-line leading-relaxed">
                {userData.bio}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {userData.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{userData.location}</span>
                  </div>
                )}
                {userData.website && (
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="h-4 w-4" />
                    <a href={`https://${userData.website}`} className="text-primary hover:underline">
                      {userData.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {userData.joinDate}</span>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center space-x-6 pt-2">
                <div className="text-center">
                  <p className="font-bold text-lg">{userData.stats.posts}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div className="text-center cursor-pointer hover:text-primary transition-colors">
                  <p className="font-bold text-lg">{userData.stats.followers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center cursor-pointer hover:text-primary transition-colors">
                  <p className="font-bold text-lg">{userData.stats.following.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-96 mx-auto">
            <TabsTrigger value="posts" className="flex items-center space-x-2">
              <Grid3X3 className="h-4 w-4" />
              <span>Posts</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center space-x-2">
              <Bookmark className="h-4 w-4" />
              <span>Saved</span>
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Liked</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-6">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>
          
          <TabsContent value="saved" className="space-y-6">
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved posts yet</h3>
              <p className="text-muted-foreground">
                Posts you save will appear here for easy access later.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="liked" className="space-y-6">
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No liked posts yet</h3>
              <p className="text-muted-foreground">
                Posts you like will appear here so you can find them again.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
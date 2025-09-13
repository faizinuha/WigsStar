import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  TrendingUp,
  Hash,
  MapPin,
  Users,
  Image as ImageIcon,
  Video,
  Heart,
  MessageCircle,
  User
} from "lucide-react";

// Mock trending data
const trendingHashtags = [
  { hashtag: "photography", posts: 12504, trending: true },
  { hashtag: "sunset", posts: 8932, trending: true },
  { hashtag: "travel", posts: 15678, trending: false },
  { hashtag: "foodie", posts: 7845, trending: true },
  { hashtag: "art", posts: 9234, trending: false },
  { hashtag: "nature", posts: 11567, trending: true }
];

const suggestedUsers = [
  {
    id: "1",
    username: "alex_photo",
    displayName: "Alex Photography",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    followers: 12500,
    verified: true,
    bio: "Professional photographer capturing life's moments"
  },
  {
    id: "2", 
    username: "maria_travels",
    displayName: "Maria Adventures",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face",
    followers: 8900,
    verified: false,
    bio: "Travel blogger exploring the world one city at a time"
  },
  {
    id: "3",
    username: "david_chef",
    displayName: "David Culinary", 
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    followers: 15600,
    verified: true,
    bio: "Chef & food content creator sharing culinary adventures"
  }
];

const trendingPosts = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    likes: 1234,
    comments: 89,
    user: {
      username: "alex_photo",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    }
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=400&fit=crop",
    likes: 892,
    comments: 45,
    user: {
      username: "maria_travels",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face"
    }
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=400&fit=crop",
    likes: 567,
    comments: 23,
    user: {
      username: "david_chef",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    }
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
    likes: 743,
    comments: 34,
    user: {
      username: "alex_photo",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    }
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=400&fit=crop",
    likes: 456,
    comments: 67,
    user: {
      username: "maria_travels",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face"
    }
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=400&fit=crop",
    likes: 623,
    comments: 12,
    user: {
      username: "david_chef",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    }
  }
];

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-4">Explore</h1>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search for users, hashtags, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg rounded-full"
            />
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-96">
            <TabsTrigger value="trending" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trending</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">People</span>
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="flex items-center space-x-2">
              <Hash className="h-4 w-4" />
              <span className="hidden sm:inline">Tags</span>
            </TabsTrigger>
            <TabsTrigger value="places" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Places</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Trending Content */}
          <TabsContent value="trending" className="space-y-8">
            {/* Trending Posts Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Trending Posts</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-1">
                {trendingPosts.map((post) => (
                  <div key={post.id} className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg">
                    <img 
                      src={post.image} 
                      alt="Trending post"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center space-x-4 text-white">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-5 w-5" />
                          <span className="font-semibold">{post.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-5 w-5" />
                          <span className="font-semibold">{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Trending Hashtags */}
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <Hash className="h-5 w-5 text-accent" />
                <span>Trending Hashtags</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingHashtags.map((tag, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-lg">#{tag.hashtag}</span>
                          {tag.trending && (
                            <Badge className="starmar-gradient text-white border-0">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          {tag.posts.toLocaleString()} posts
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Hash className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* People Tab */}
          <TabsContent value="people" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <span>Suggested for You</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedUsers.map((user) => (
                  <Card key={user.id} className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarImage src={user.avatar} alt={user.displayName} />
                      <AvatarFallback className="text-lg">{user.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-center space-x-2">
                        <h3 className="font-semibold">{user.displayName}</h3>
                        {user.verified && (
                          <Badge className="starmar-gradient text-white border-0 text-xs px-1">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">@{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.followers.toLocaleString()} followers</p>
                      <p className="text-sm line-clamp-2">{user.bio}</p>
                    </div>
                    <Button className="w-full gradient-button">
                      Follow
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Hashtags Tab */}
          <TabsContent value="hashtags" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingHashtags.map((tag, index) => (
                <Card key={index} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Hash className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">#{tag.hashtag}</h3>
                        <p className="text-muted-foreground">{tag.posts.toLocaleString()} posts</p>
                      </div>
                    </div>
                    {tag.trending && (
                      <Badge className="starmar-gradient text-white border-0">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" className="w-full">
                    Follow #{tag.hashtag}
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Places Tab */}
          <TabsContent value="places" className="space-y-6">
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Explore Places</h3>
              <p className="text-muted-foreground mb-6">
                Discover popular locations and see what's happening around the world.
              </p>
              <Button className="gradient-button">
                Enable Location Services
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Explore;
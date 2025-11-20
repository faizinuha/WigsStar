[33mcommit e8d40094d1ca1c7c1887f05c9ebfda5b15f892d2[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m)[m
Author: Zuanzi <70107300+faizinuha@users.noreply.github.com>
Date:   Wed Nov 19 14:21:09 2025 +0700

    Delete My Dummy ----

[1mdiff --git a/src/pages/Explore.tsx b/src/pages/Explore.tsx[m
[1mindex c498dc2..448104e 100644[m
[1m--- a/src/pages/Explore.tsx[m
[1m+++ b/src/pages/Explore.tsx[m
[36m@@ -1,34 +1,27 @@[m
[31m-import { useState, useEffect } from "react";[m
[31m-import { Link, useSearchParams } from "react-router-dom";[m
[31m-import { useQuery } from "@tanstack/react-query";[m
[31m-import { Navigation } from "@/components/layout/Navigation";[m
[31m-import { Card } from "@/components/ui/card";[m
[31m-import { Input } from "@/components/ui/input";[m
[31m-import { Button } from "@/components/ui/button";[m
[31m-import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";[m
[31m-import { Badge } from "@/components/ui/badge";[m
[31m-import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";[m
[31m-import { TrendingTags } from "@/components/posts/TrendingTags";[m
[31m-import { useTrendingTags, usePostsByTag } from "@/hooks/useTags";[m
[31m-import { useFollowStatus, useToggleFollow } from "@/hooks/useFollow";[m
[31m-import { useAuth } from "@/contexts/AuthContext";[m
[32m+[m[32mimport { Navigation } from '@/components/layout/Navigation';[m[41m[m
[32m+[m[32mimport { PostDetailModal } from '@/components/posts/PostDetailModal';[m[41m[m
[32m+[m[32mimport { TrendingTags } from '@/components/posts/TrendingTags';[m[41m[m
[32m+[m[32mimport { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';[m[41m[m
[32m+[m[32mimport { Button } from '@/components/ui/button';[m[41m[m
[32m+[m[32mimport { Card } from '@/components/ui/card';[m[41m[m
[32m+[m[32mimport { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';[m[41m[m
[32m+[m[32mimport { useAuth } from '@/contexts/AuthContext';[m[41m[m
[32m+[m[32mimport { useFollowStatus, useToggleFollow } from '@/hooks/useFollow';[m[41m[m
[32m+[m[32mimport { Post } from '@/hooks/usePosts';[m[41m[m
[32m+[m[32mimport { usePostsByTag, useTrendingTags } from '@/hooks/useTags';[m[41m[m
[32m+[m[32mimport { supabase } from '@/integrations/supabase/client';[m[41m[m
[32m+[m[32mimport { useQuery } from '@tanstack/react-query';[m[41m[m
 import {[m
[31m-  Search,[m
[31m-  TrendingUp,[m
   Hash,[m
[31m-  MapPin,[m
[31m-  Users,[m
[31m-  Image as ImageIcon,[m
[31m-  Video,[m
   Heart,[m
[31m-  MessageCircle,[m
[31m-  User,[m
   Loader2,[m
[31m-  Compass,[m
[31m-} from "lucide-react";[m
[31m-import { supabase } from "@/integrations/supabase/client";[m
[31m-import { Post } from "@/hooks/usePosts";[m
[31m-import { PostDetailModal } from "@/components/posts/PostDetailModal";[m
[32m+[m[32m  MapPin,[m[41m[m
[32m+[m[32m  MessageCircle,[m[41m[m
[32m+[m[32m  TrendingUp,[m[41m[m
[32m+[m[32m  Users,[m[41m[m
[32m+[m[32m} from 'lucide-react';[m[41m[m
[32m+[m[32mimport { useEffect, useState } from 'react';[m[41m[m
[32m+[m[32mimport { Link, useSearchParams } from 'react-router-dom';[m[41m[m
 [m
 type UserProfile = {[m
   id: string;[m
[36m@@ -40,23 +33,28 @@[m [mtype UserProfile = {[m
   followers_count: number;[m
 };[m
 [m
[31m-const dummyAvatar = (seed: string) => `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}`;[m
[31m-[m
[31m-[m
[31m-const EmptyState = ({ icon, title, message, children }: { icon: React.ReactNode, title: string, message: string, children?: React.ReactNode }) => ([m
[32m+[m[32mconst EmptyState = ({[m[41m[m
[32m+[m[32m  icon,[m[41m[m
[32m+[m[32m  title,[m[41m[m
[32m+[m[32m  message,[m[41m[m
[32m+[m[32m  children,[m[41m[m
[32m+[m[32m}: {[m[41m[m
[32m+[m[32m  icon: React.ReactNode;[m[41m[m
[32m+[m[32m  title: string;[m[41m[m
[32m+[m[32m  message: string;[m[41m[m
[32m+[m[32m  children?: React.ReactNode;[m[41m[m
[32m+[m[32m}) => ([m[41m[m
   <div className="text-center py-12 animate-fade-in">[m
     <div className="text-muted-foreground mx-auto mb-4">{icon}</div>[m
     <h3 className="text-lg font-semibold mb-2">{title}</h3>[m
[31m-    <p className="text-muted-foreground mb-6 max-w-md mx-auto">[m
[31m-      {message}[m
[31m-    </p>[m
[32m+[m[32m    <p className="text-muted-foreground mb-6 max-w-md mx-auto">{message}</p>[m[41m[m
     {children}[m
   </div>[m
 );[m
 [m
 const Explore = () => {[m
[31m-  const [searchQuery, setSearchQuery] = useState("");[m
[31m-  const [activeTab, setActiveTab] = useState("trending");[m
[32m+[m[32m  const [searchQuery, setSearchQuery] = useState('');[m[41m[m
[32m+[m[32m  const [activeTab, setActiveTab] = useState('trending');[m[41m[m
   const [searchParams] = useSearchParams();[m
   const tagFromUrl = searchParams.get('tag');[m
   const [selectedPost, setSelectedPost] = useState<Post | null>(null);[m
[36m@@ -64,7 +62,7 @@[m [mconst Explore = () => {[m
   // Set active tab to hashtags if tag is provided[m
   useEffect(() => {[m
     if (tagFromUrl) {[m
[31m-      setActiveTab("hashtags");[m
[32m+[m[32m      setActiveTab('hashtags');[m[41m[m
     }[m
   }, [tagFromUrl]);[m
 [m
[36m@@ -85,21 +83,37 @@[m [mconst Explore = () => {[m
           </div>[m
 [m
           {/* Tabs */}[m
[31m-          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">[m
[32m+[m[32m          <Tabs[m[41m[m
[32m+[m[32m            value={activeTab}[m[41m[m
[32m+[m[32m            onValueChange={setActiveTab}[m[41m[m
[32m+[m[32m            className="space-y-8"[m[41m[m
[32m+[m[32m          >[m[41m[m
             <TabsList className="grid w-full grid-cols-4 lg:w-96">[m
[31m-              <TabsTrigger value="trending" className="flex items-center space-x-2">[m
[32m+[m[32m              <TabsTrigger[m[41m[m
[32m+[m[32m                value="trending"[m[41m[m
[32m+[m[32m                className="flex items-center space-x-2"[m[41m[m
[32m+[m[32m              >[m[41m[m
                 <TrendingUp className="h-4 w-4" />[m
                 <span className="hidden sm:inline">Trending</span>[m
               </TabsTrigger>[m
[31m-              <TabsTrigger value="people" className="flex items-center space-x-2">[m
[32m+[m[32m              <TabsTrigger[m[41m[m
[32m+[m[32m                value="people"[m[41m[m
[32m+[m[32m                className="flex items-center space-x-2"[m[41m[m
[32m+[m[32m              >[m[41m[m
                 <Users className="h-4 w-4" />[m
                 <span className="hidden sm:inline">People</span>[m
               </TabsTrigger>[m
[31m-              <TabsTrigger value="hashtags" className="flex items-center space-x-2">[m
[32m+[m[32m              <TabsTrigger[m[41m[m
[32m+[m[32m                value="hashtags"[m[41m[m
[32m+[m[32m                className="flex items-center space-x-2"[m[41m[m
[32m+[m[32m              >[m[41m[m
                 <Hash className="h-4 w-4" />[m
                 <span className="hidden sm:inline">Tags</span>[m
               </TabsTrigger>[m
[31m-              <TabsTrigger value="places" className="flex items-center space-x-2">[m
[32m+[m[32m              <TabsTrigger[m[41m[m
[32m+[m[32m                value="places"[m[41m[m
[32m+[m[32m                className="flex items-center space-x-2"[m[41m[m
[32m+[m[32m              >[m[41m[m
                 <MapPin className="h-4 w-4" />[m
                 <span className="hidden sm:inline">Places</span>[m
               </TabsTrigger>[m
[36m@@ -118,7 +132,11 @@[m [mconst Explore = () => {[m
             </TabsContent>[m
 [m
             <TabsContent value="places" className="
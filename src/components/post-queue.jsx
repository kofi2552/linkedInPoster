"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import {
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  SendIcon,
  Calendar,
  MoreHorizontal,
  Image as ImageIcon,
  LayoutGrid,
  List as ListIcon,
  Filter,
} from "lucide-react";
import { EditPostDialog } from "./edit-post-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QueueSkeleton } from "@/components/skeletons"; // Added import

export function PostQueue({
  userId,
  refreshTrigger,
  onEditPost,
  onDeletePost,
}) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loadingPostId, setLoadingPostId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (!userId) return;
      const response = await fetch(`/api/scheduled-posts?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message || "Failed to fetch posts");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch posts.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");

  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true;
    return post.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 px-3 py-1 text-sm font-medium rounded-full shadow-sm">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            Published
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 px-3 py-1 text-sm font-medium rounded-full shadow-sm">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Scheduled
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 px-3 py-1 text-sm font-medium rounded-full shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleEditClick = (post) => {
    setEditingPost(post);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = (updatedPost) => {
    setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    onEditPost(updatedPost);
    toast({
      title: "Post Updated",
      description: "Your post has been successfully updated.",
    });
  };

  const handleDeleteClick = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/scheduled-posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete post");
      setPosts(posts.filter((p) => p.id !== postId));
      onDeletePost(postId);
      toast({
        title: "Post Deleted",
        description: "The post has been removed from your queue.",
      });
    } catch (err) {
      setError(err.message || "Failed to delete post");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete post",
      });
    }
  };

  const handlePostNowClick = async (postId) => {
    if (!confirm("Are you sure you want to post now?")) return;

    setLoadingPostId(postId);
    setError(null);

    try {
      const response = await fetch(`/api/publish-post/now/${postId}`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to publish post");
      await fetchPosts(); // refresh your posts list
      toast({
        title: "Post Published",
        description: "Your post has been published to LinkedIn.",
      });
    } catch (err) {
      console.log("Error posting now:", err);
      setError(err.message || "Failed to publish post");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to publish post",
      });
    } finally {
      setLoadingPostId(null);
    }
  };



  // ...

  if (isLoading) {
    return <QueueSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
        <p className="font-medium">{error}</p>
        <Button
          onClick={fetchPosts}
          variant="outline"
          className="mt-4 border-destructive/30 hover:bg-destructive/10"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="p-12 border-dashed border-2 flex flex-col items-center text-center space-y-4 shadow-none bg-muted/10">
        <div className="p-4 rounded-full bg-muted">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold">No scheduled posts</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Your queue is empty. Generate some content to see it here!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter("all")}
              className={`h-8 px-3 text-xs font-medium rounded-md transition-all ${filter === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter("published")}
              className={`h-8 px-3 text-xs font-medium rounded-md transition-all ${filter === "published" ? "bg-background shadow-sm text-green-600" : "text-muted-foreground hover:text-foreground"}`}
            >
              Published
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter("pending")}
              className={`h-8 px-3 text-xs font-medium rounded-md transition-all ${filter === "pending" ? "bg-background shadow-sm text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
            >
              Scheduled
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter("failed")}
              className={`h-8 px-3 text-xs font-medium rounded-md transition-all ${filter === "failed" ? "bg-background shadow-sm text-red-600" : "text-muted-foreground hover:text-foreground"}`}
            >
              Failed
            </Button>
          </div>
          <span className="text-xs text-muted-foreground font-medium ml-2">
            {filteredPosts.length} posts
          </span>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView("grid")}
            className={`h-8 w-8 rounded-md transition-all ${view === "grid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView("list")}
            className={`h-8 w-8 rounded-md transition-all ${view === "list" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
          >
            <ListIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className={`group relative flex ${view === "list" ? "flex-col md:flex-row items-start" : "flex-col"} gap-0 bg-card border border-border/40 rounded-xl hover:border-primary/20 hover:shadow-lg transition-all duration-300 overflow-hidden`}
          >
            {/* Status Indicator Stripe */}
            <div
              className={`absolute top-0 left-0 bottom-0 w-1 ${post.status === "published" ? "bg-green-500" : post.status === "failed" ? "bg-red-500" : "bg-blue-500"}`}
            />

            {/* Content Area */}
            <div className={`flex-1 p-5 ${view === "list" ? "w-full" : ""}`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusBadge(post.status)}
                  {post.publishedAt ? (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(post.publishedAt), "MMM d • h:mm a")}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(post.scheduledFor), "MMM d • h:mm a")}
                    </span>
                  )}
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  {post.status === "pending" && (
                    <>
                      <Button onClick={() => handlePostNowClick(post.id)} size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" title="Post Now">
                        {loadingPostId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                      </Button>
                      <Button onClick={() => handleEditClick(post)} size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button onClick={() => handleDeleteClick(post.id)} size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {post.status === "pending" && (
                        <>
                          <DropdownMenuItem onClick={() => handlePostNowClick(post.id)}>Post Now</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(post)}>Edit</DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={() => handleDeleteClick(post.id)} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-3">
                {/* Image Display */}
                {post.imageBase64 && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border/50 bg-muted/20">
                    <img
                      src={`data:image/png;base64,${post.imageBase64}`}
                      alt="Post Image"
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Image
                    </div>
                  </div>
                )}

                <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-sm text-foreground/80 line-clamp-4 whitespace-pre-wrap font-normal leading-relaxed">
                    {post.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {post.Topic?.title || "Untracked Topic"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {post.content.length} chars
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingPost && (
        <EditPostDialog
          post={editingPost}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingPost(null);
          }}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}

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
} from "lucide-react";
import { EditPostDialog } from "./edit-post-dialog";

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

  //console.log("PostQueue - userId:", userId);

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
      //console.log("Fetched posts:", data);
      setPosts(data);
    } catch (err) {
      setError(err.message || "Failed to fetch posts");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "published":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
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
    } catch (err) {
      setError(err.message || "Failed to delete post");
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
    } catch (err) {
      console.log("Error posting now:", err);
      setError(err.message || "Failed to publish post");
    } finally {
      setLoadingPostId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-destructive">
          <p>{error}</p>
          <Button
            onClick={fetchPosts}
            variant="outline"
            className="mt-4 bg-transparent"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>No scheduled posts yet. Create a schedule to get started!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Post Queue</h2>

      <div className="space-y-3">
        {posts.map((post) => (
          <Card key={post.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(post.status)}
                  {getStatusBadge(post.status)}
                </div>
                <p className="font-medium text-sm text-muted-foreground">
                  {post.Topic?.title || "Unknown Topic"}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{format(new Date(post.scheduledFor), "MMM dd, yyyy")}</p>
                <p>{format(new Date(post.scheduledFor), "HH:mm")}</p>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm break-words">{post.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {post.content.length}/600 characters
              </p>
            </div>

            {post.publishedAt && (
              <p className="text-xs text-muted-foreground">
                Published{" "}
                {formatDistanceToNow(new Date(post.publishedAt), {
                  addSuffix: true,
                })}
              </p>
            )}

            {post.status === "pending" ? (
              <div className="flex gap-4">
                <Button
                  onClick={() => handleEditClick(post)}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteClick(post.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent text-destructive hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  onClick={() => handlePostNowClick(post.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent text-green-600 hover:text-green-700 cursor-pointer"
                >
                  {loadingPostId === post.id ? (
                    <Loader2 className="animate-spin text-green-600 w-6 h-6" />
                  ) : (
                    <span className="flex items-center gap-1 text-green-600">
                      <SendIcon className="w-4 h-4 mr-2 text-green-600" />
                      Post Now
                    </span>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => handleDeleteClick(post.id)}
                variant="outline"
                size="sm"
                className="w-xs py-2 flex-1 bg-transparent text-destructive hover:text-destructive cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </Card>
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

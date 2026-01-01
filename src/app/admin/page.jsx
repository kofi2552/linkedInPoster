"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert, CheckCircle, XCircle, Crown, MessageSquare, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchUsers = async () => {

        try {
            const res = await fetch("/api/admin/users", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setUsers(data);

                } else {
                    console.error("API returned non-array:", data);
                    setUsers([]);
                }
            } else {
                toast({ variant: "destructive", title: "Error", description: "Failed to fetch users" });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Network error" });
        } finally {
            setLoading(false);
        }
    };


    // In a real app, middleware or server-side check is safer.
    // Here we do a simple client-side check + the API should verify too.
    const fetchFeedback = async () => {
        try {
            const res = await fetch("/api/feedback", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setFeedback(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const [analytics, setAnalytics] = useState(null);
    const [analyticsSearch, setAnalyticsSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(analyticsSearch);
        }, 500);
        return () => clearTimeout(timer);
    }, [analyticsSearch]);

    const fetchAnalytics = async () => {
        try {
            // Include search param if present
            const query = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
            const res = await fetch(`/api/admin/analytics${query}`, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            fetchAnalytics();
        }
    }, [debouncedSearch, status]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            Promise.all([fetchUsers(), fetchFeedback()]).finally(() => setLoading(false));
            // fetchAnalytics called by debouncedSearch effect
        }
    }, [status, router]);


    const togglePremium = async (userId, currentStatus) => {
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    isPremium: !currentStatus,
                    // If enabling, set expiry to 30 days from now
                    premiumExpiresAt: !currentStatus ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
                }),
            });

            if (res.ok) {
                toast({ title: "Success", description: "User status updated" });
                fetchUsers(); // Refresh list
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update user" });
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/admin/users?userId=${userId}`, {
                method: "DELETE"
            });

            if (res.ok) {
                toast({ title: "User Deleted", description: "The user has been removed permanently." });
                fetchUsers();
            } else {
                toast({ variant: "destructive", title: "Error", description: "Failed to delete user" });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Network error" });
        }
    };


    if (loading) {
        return <div className="h-[50vh] flex items-center justify-center flex-col">
            <Loader2 className="animate-spin w-10 h-10" />
            waiting ..
        </div>;
    }

    // Safety check: If not admin (and somehow got here), show message
    // Note: session.user.isAdmin might need a page refresh to update after being toggled in dev mode
    if (session?.user && !session.user.isAdmin) {
        return (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
                <ShieldAlert className="w-12 h-12 text-red-500" />
                <h1 className="text-xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
                {/* <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button> */}
            </div>
        )
    }

    return (
        <div className="w-full container mx-auto pt-4">
            <Tabs defaultValue="analytics" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="analytics" className="gap-2">
                        <span className="w-4 h-4 flex items-center justify-center font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        </span>
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="users" className="gap-2">
                        <User className="w-4 h-4" /> Users
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="gap-2">
                        <MessageSquare className="w-4 h-4" /> Feedback
                        {feedback.length > 0 && (
                            <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-4 min-w-4 flex items-center justify-center text-[10px]">
                                {feedback.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="analytics" className="space-y-4">
                    {analytics ? (
                        <>
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{analytics.stats.totalUsers}</div>
                                        <p className="text-xs text-muted-foreground">Registered users</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Active Users (24h)</CardTitle>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{analytics.stats.activeUsers24h}</div>
                                        <p className="text-xs text-muted-foreground">Unique logins in last 24h</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Actions Logged</CardTitle>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{analytics.stats.totalActions}</div>
                                        <p className="text-xs text-muted-foreground">Page views & interactions</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Search and Table Section */}
                            <Card className="col-span-4">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Activity Logs</CardTitle>
                                        <div className="relative w-64">
                                            <input
                                                type="text"
                                                placeholder="Search user email or name..."
                                                value={analyticsSearch}
                                                onChange={(e) => setAnalyticsSearch(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Action</TableHead>
                                                <TableHead>Details / Component</TableHead>
                                                <TableHead className="text-right">Time</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {analytics.logs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                        No activity found matching your search.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                analytics.logs.map((log) => (
                                                    <TableRow key={log.id}>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{log.User?.name || "Unknown"}</span>
                                                                <span className="text-xs text-muted-foreground">{log.User?.email}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="font-mono text-xs">
                                                                {log.action}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="max-w-[300px] truncate text-xs font-mono text-muted-foreground" title={log.details}>
                                                            {log.details && typeof log.details === 'string' && log.details.startsWith('"') ? JSON.parse(log.details) : log.details}
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs text-muted-foreground">
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="h-48 flex items-center justify-center">
                            <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>Users Directory</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Premium Since</TableHead>
                                        <TableHead>Expires At</TableHead>
                                        <TableHead>Posts Activity</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.email}</span>
                                                    <span className="text-xs text-muted-foreground">{user.profession || "No Profession"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.isPremium ? (
                                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1">
                                                        <Crown className="w-3 h-3" /> Premium
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Free</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {user.isPremium && user.premiumStartedAt
                                                    ? new Date(user.premiumStartedAt).toLocaleString()
                                                    : "-"}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {user.isPremium && user.premiumExpiresAt
                                                    ? new Date(user.premiumExpiresAt).toLocaleString()
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 text-xs">
                                                    <div className="flex items-center gap-1.5 font-medium text-green-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        {user.publishedCount || 0} Published
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                        {user.scheduledCount || 0} Scheduled
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.phoneNumber || <span className="text-muted-foreground italic">None</span>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant={user.isPremium ? "destructive" : "default"}
                                                        onClick={() => togglePremium(user.id, user.isPremium)}
                                                        disabled={!user.phoneNumber}
                                                        title={!user.isPremium && !user.phoneNumber ? "User must have a phone number to go premium" : ""}
                                                    >
                                                        {user.isPremium ? "Revoke Premium" : "Make Premium"}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => deleteUser(user.id)}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="feedback">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Feedback</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feedback.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                                No feedback submitted yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        feedback.map((f) => (
                                            <TableRow key={f.id}>
                                                <TableCell className="font-medium">{f.User?.email || "Unknown"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={f.type === 'issue' ? 'destructive' : f.type === 'suggestion' ? 'default' : 'secondary'} className="capitalize">
                                                        {f.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-md truncate" title={f.content}>
                                                    {f.content}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {new Date(f.createdAt).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

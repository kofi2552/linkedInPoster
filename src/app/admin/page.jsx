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
import { Loader2, ShieldAlert, CheckCircle, XCircle, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState([]);
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

    console.log("AdminPage Render: Status =", status, "Users =", users.length);
    console.log("Users fetched successfully:", users);

    // In a real app, middleware or server-side check is safer.
    // Here we do a simple client-side check + the API should verify too.
    useEffect(() => {
        console.log("AdminPage Effect: Status =", status);
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated") {
            fetchUsers();
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

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;
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
        <div className="container mx-auto pt-4">

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
                                        {user.phoneNumber || <span className="text-muted-foreground italic">None</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant={user.isPremium ? "destructive" : "default"}
                                            onClick={() => togglePremium(user.id, user.isPremium)}
                                        >
                                            {user.isPremium ? "Revoke Premium" : "Make Premium"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>


        </div>
    );
}

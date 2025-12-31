"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, User, Phone, ShieldCheck, Crown } from "lucide-react";
import { userProfileSchema } from "@/lib/schemas";

export function ProfileSettings({ userId, userEmail, userName, user, onUpgrade }) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    // const { toast } = useToast(); // Removed

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/user?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setPhoneNumber(data.phoneNumber || "");
                setIsPremium(data.isPremium || false); // Assuming API returns this
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Zod Validation
        const validation = userProfileSchema.safeParse({ phoneNumber });
        console.log("Validation Result:", validation); // Debug log

        if (!validation.success) {
            const issues = validation.error.issues;

            const invalidCharError = issues.find(
                (i) => i.code === "invalid_format"
            )?.message;

            const lengthError = issues.find(
                (i) => i.code === "too_small"
            )?.message;

            toast.error("Invalid Phone Number", {
                description: invalidCharError || lengthError,
            });

            return;
        }


        setSaving(true);
        try {
            const res = await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, phoneNumber }),
            });

            if (res.ok) {
                toast.success("Profile Updated", { description: "Your phone number has been saved." });
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            toast.error("Error", { description: "Failed to update profile." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Profile & Account</h2>
                <p className="text-muted-foreground">Manage your contact details and account status.</p>
            </div>

            <Card className="p-6 space-y-6">
                {/* Account Status Badge */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isPremium ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-600"}`}>
                            {isPremium ? <Crown className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="font-semibold">{isPremium ? "Premium Account" : "Free Plan"}</div>
                            <div className="text-xs text-muted-foreground">{isPremium ? "Enjoy unlimited access" : "Upgrade for more features"}</div>
                        </div>
                    </div>
                    {isPremium ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                            <ShieldCheck className="w-3.5 h-3.5" /> Active
                        </div>
                    ) : (
                        <Button variant="outline" size="sm" className="text-xs h-8 cursor-pointer" onClick={onUpgrade}>Upgrade</Button>
                    )}
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Full Name</Label>
                        <Input value={userName || ""} disabled className="bg-muted/50" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Email Address</Label>
                        <Input value={userEmail || ""} disabled className="bg-muted/50" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">WhatsApp Number <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="phone"
                                placeholder="+1 234 567 8900"
                                className="pl-9"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Required for Premium upgrades and support.</p>
                    </div>

                    <Button type="submit" disabled={saving} className="w-full md:w-auto cursor-pointer">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </form>


            </Card>
        </div>
    );
}


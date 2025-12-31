"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserCircle, Save, Loader2, Sparkles, Crown } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { PersonaSkeleton } from "@/components/skeletons";
import { personaSchema } from "@/lib/schemas";

export function PersonaSettings({ userId, isPremium }) {
    const [formData, setFormData] = useState({
        profession: "",
        industry: "",
        tone: "",
        bio: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    // const { toast } = useToast(); // Removed

    useEffect(() => {
        async function fetchUser() {
            if (!userId) return;
            try {
                const res = await fetch(`/api/user?userId=${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        profession: data.profession || "",
                        industry: data.industry || "",
                        tone: data.tone || "",
                        bio: data.bio || ""
                    });
                }
            } catch (error) {
                console.error("Failed to fetch user persona:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [userId]);

    async function handleSubmit(e) {
        e.preventDefault();

        // 🛡️ Zod Validation
        const result = personaSchema.safeParse(formData);
        if (!result.success) {
            toast.error("Validation Error", {
                description: result.error.issues[0].message,
            });
            return;
        }

        setSaving(true);

        try {
            const res = await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, ...formData }),
            });

            if (res.ok) {
                toast.success("Persona Updated", {
                    description: "Your AI persona has been saved successfully.",
                });
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            toast.error("Error", {
                description: "Failed to save settings. Please try again.",
            });
        } finally {
            setSaving(false);
        }
    }

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (loading) {
        return <PersonaSkeleton />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Your Persona</h2>
                <p className="text-muted-foreground">
                    Define who you are so the AI can write in your authentic voice.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column: Form */}
                <Card className="p-6 border-border/60">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="profession">Profession / Role</Label>
                            <Input
                                id="profession"
                                name="profession"
                                placeholder="e.g. EdTech Consultant"
                                value={formData.profession}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="industry">Industry</Label>
                                {!isPremium && <Crown className="w-3 h-3 text-amber-500" />}
                            </div>
                            <Input
                                id="industry"
                                name="industry"
                                placeholder={!isPremium ? "Premium Feature" : "e.g. Education Technology"}
                                value={formData.industry}
                                onChange={handleChange}
                                disabled={!isPremium}
                                className={!isPremium ? "bg-muted/50" : ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="tone">Voice & Tone</Label>
                                {!isPremium && <Crown className="w-3 h-3 text-amber-500" />}
                            </div>
                            <Input
                                id="tone"
                                name="tone"
                                placeholder={!isPremium ? "Premium Feature" : "e.g. Professional, Authoritative, Empathetic"}
                                value={formData.tone}
                                onChange={handleChange}
                                disabled={!isPremium}
                                className={!isPremium ? "bg-muted/50" : ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="bio">Professional Bio / Context</Label>
                                {!isPremium && <Crown className="w-3 h-3 text-amber-500" />}
                            </div>
                            <Textarea
                                id="bio"
                                name="bio"
                                placeholder={!isPremium ? "Premium Feature: Provide context about your expertise..." : "Briefly describe your expertise and what you typically talk about..."}
                                rows={4}
                                value={formData.bio}
                                onChange={handleChange}
                                className={`resize-none ${!isPremium ? "bg-muted/50" : ""}`}
                                disabled={!isPremium}
                            />
                        </div>

                        <Button type="submit" disabled={saving} className="w-full">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Persona
                        </Button>
                    </form>
                </Card>

                {/* Right Column: Preview / Explainer */}
                <div className="space-y-6">
                    <Card className="p-6 bg-primary/5 border-primary/10">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-foreground">Why this matters?</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Rather than generic AI content, PostPilot uses this information to act as your personal ghostwriter.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="relative p-6 rounded-xl border border-dashed border-border/60 bg-muted/20">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <UserCircle className="w-24 h-24" />
                        </div>
                        <h4 className="font-medium mb-4 text-sm uppercase tracking-wider text-muted-foreground">Example Output Adaptation</h4>

                        <div className="space-y-4">
                            <div className="text-sm">
                                <span className="font-medium text-xs text-muted-foreground uppercase">Without Persona:</span>
                                <p className="mt-1 text-foreground/80 italic">"Here are 5 tips for better classroom management..."</p>
                            </div>
                            <div className="text-sm">
                                <span className="font-medium text-xs text-primary uppercase">With Your Persona:</span>
                                <p className="mt-1 text-foreground font-medium">
                                    "As an EdTech consultant, I've seen schools struggle with engagement. Here is how we can fix it..."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

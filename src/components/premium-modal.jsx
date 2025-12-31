"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, MessageCircle, Crown, Lock } from "lucide-react";
import Image from "next/image";

export function PremiumModal({ isOpen, onClose, userPhone, userId }) {

    const handleUpgradeClick = () => {
        // Construct WhatsApp message
        const message = encodeURIComponent(`Hi, I'd like to upgrade my account (ID: ${userId}) to Premium!`);
        const whatsappUrl = `https://wa.me/233594955819?text=${message}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md sm:max-w-lg">
                <DialogHeader className="text-center space-y-4 pt-6">
                    <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                        <Crown className="w-8 h-8 text-amber-600" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center">Unleash Your Full Potential</DialogTitle>
                    <DialogDescription className="text-base text-center max-w-sm mx-auto">
                        Upgrade to Premium to remove limits and access advanced AI features.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Feature List */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                            <div className="p-2 rounded-full bg-green-100 text-green-600">
                                <Check className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm">Unlimited Posts</div>
                                <div className="text-xs text-muted-foreground">No weekly limits. Post as much as you want.</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                <Check className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm">Control Post Length</div>
                                <div className="text-xs text-muted-foreground">Select Short, Medium, or Long formats.</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                            <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                                <Check className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="font-semibold text-sm">Image Support</div>
                                <div className="text-xs text-muted-foreground">Attach images to your scheduled posts.</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="space-y-3 pt-2">
                        {!userPhone ? (
                            <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm text-center border border-red-100">
                                Please add your phone number in Profile Settings before upgrading.
                                <Button variant="link" className="text-red-700 underline pl-1 h-auto p-0" onClick={onClose}>Go to Profile</Button>
                            </div>
                        ) : (
                            <Button onClick={handleUpgradeClick} className="w-full rounded-full cursor-pointer h-12 text-base gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white">
                                <MessageCircle className="w-5 h-5" />
                                Upgrade
                            </Button>
                        )}
                        <p className="text-xs text-center text-muted-foreground">
                            Premium plan fixed at <strong>$20/month</strong> for lifetime. Cancel anytime.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

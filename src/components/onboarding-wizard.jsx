"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rocket, UserCircle, Link as LinkIcon, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    {
        id: "welcome",
        title: "Welcome to PostPilot AI",
        description: "Your personal automated content strategist. Let's get you set up for success.",
        icon: Rocket,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
    },
    {
        id: "persona",
        title: "Define Your Persona",
        description: "The AI learns from you. Setting your profession, industry, and tone ensures every post sounds authentic.",
        icon: UserCircle,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
    },
    {
        id: "connect",
        title: "Connect LinkedIn",
        description: "Link your account to enable one-click publishing and automated scheduling.",
        icon: LinkIcon,
        color: "text-blue-700",
        bgColor: "bg-blue-50",
    },
    {
        id: "ready",
        title: "You're All Set!",
        description: "Start by generating your first batch of topics tailored to your industry.",
        icon: CheckCircle2,
        color: "text-green-600",
        bgColor: "bg-green-100",
    },
];

export function OnboardingWizard({ isOpen, onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            onComplete();
        }
    };

    const step = STEPS[currentStep];
    const Icon = step.icon;

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                <div className="relative flex flex-col items-center justify-center p-8 text-center space-y-6 min-h-[400px]">

                    {/* Progress Indicators */}
                    <div className="absolute top-6 flex space-x-2 py-2">
                        {STEPS.map((_, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-300",
                                    index === currentStep ? "bg-blue-600 w-6" : "bg-gray-200"
                                )}
                            />
                        ))}
                    </div>

                    {/* Animated Icon */}
                    <div className={cn(
                        "p-6 rounded-full mb-4 mt-8 animate-in zoom-in-50 duration-500 ease-out",
                        step.bgColor
                    )}>
                        <Icon className={cn("w-12 h-12", step.color)} />
                    </div>

                    {/* Text Content */}
                    <div className="space-y-2 max-w-xs animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                            {step.title}
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {step.description}
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 w-full animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
                        <Button
                            onClick={handleNext}
                            size="lg"
                            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-base font-semibold shadow-blue-200 shadow-lg transition-all hover:scale-[1.02]"
                        >
                            {currentStep === STEPS.length - 1 ? "Get Started" : (
                                <span className="flex items-center gap-2">
                                    Continue <ArrowRight className="w-4 h-4 ml-1" />
                                </span>
                            )}
                        </Button>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}

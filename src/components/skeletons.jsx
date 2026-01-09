
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function GeneratorSkeleton() {
    return (
        <div className="w-full h-[80vh] flex justify-center items-center mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="w-full flex flex-col justify-center items-center">

                <div className="w-[50vw] mx-auto flex flex-col justify-center items-center space-y-2 mb-6">
                    <Skeleton className="h-8 w-48" /> {/* Title */}
                    <Skeleton className="h-12 w-96" /> {/* Subtitle */}
                </div>

                <div className="w-full mx-auto grid gap-6">
                    <Card className="p-6 space-y-6">
                        <div className="space-y-4">
                            {/* Input Area */}
                            <div className="space-y-2">
                                <Skeleton className="h-12 w-24" />
                                <Skeleton className="h-24 w-full rounded-md" />
                            </div>
                            {/* Options */}
                            <div className="flex gap-4">
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                            {/* Button */}
                            <Skeleton className="h-24 w-full rounded-md" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export function TopicsSkeleton() {
    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3 w-full">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-1/3" /> {/* Title */}
                                    <Skeleton className="h-5 w-16 rounded-full" /> {/* Badge */}
                                </div>
                                <Skeleton className="h-4 w-2/3" /> {/* Description */}
                                <div className="flex gap-4 pt-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-8 rounded-md" /> {/* Action */}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export function QueueSkeleton() {
    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-4">
                        <div className="flex gap-4 items-center">
                            <Skeleton className="h-12 w-1 rounded-full" /> {/* Status Strip */}
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export function PersonaSkeleton() {
    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/4 min-w-[200px]" />
                <Skeleton className="h-4 w-1/2 min-w-[300px]" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Form Skeleton */}
                <Card className="p-6">
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                        <Skeleton className="h-10 w-full" />
                    </div>
                </Card>

                {/* Preview Skeleton */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="flex gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    </Card>
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}

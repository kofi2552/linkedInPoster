import { z } from "zod";

export const userProfileSchema = z.object({
    phoneNumber: z
        .string()
        .min(10, { message: "Phone number must be at least 10 characters." })
        .regex(/^[\d+\-\s()]+$/, { message: "Phone number contains invalid characters." }),
});

export const generatorSchema = z.object({
    topic: z
        .string()
        .min(3, { message: "Topic must be at least 3 characters long." })
        .max(100, { message: "Topic must be less than 100 characters." }),
});

export const personaSchema = z.object({
    profession: z.string().min(2, { message: "Profession is required." }),
    industry: z.string().optional(),
    tone: z.string().optional(),
    bio: z.string().optional(),
});

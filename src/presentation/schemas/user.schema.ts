import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(1)
});

export const updateUserSchema = z.object({
  username: z.string().min(1)
});

export const generateTokenSchema = z.object({
  username: z.string().min(1)
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type GenerateTokenSchema = z.infer<typeof generateTokenSchema>;
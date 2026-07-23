import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Invalid email address format.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .max(128, { message: 'Password exceeds maximum length of 128 characters.' }),
});

export const RegisterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Invalid email format.' }),
  username: z
    .string()
    .trim()
    .min(2, { message: 'Username must be at least 2 characters.' })
    .max(39, { message: 'Username cannot exceed 39 characters.' })
    .regex(/^[a-zA-Z0-9-]+$/, { message: 'Username can only contain alphanumeric characters and hyphens.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

import { z } from 'zod'

export const createUserDto = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long').max(255, 'Name must be at most 255 characters long'),
  email: z.email('Email is invalid'),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(255, 'Password must be at most 255 characters long'),
  role: z.enum(['user', 'admin']).default('user'),
})

export const loginUserDto = z.object({
  email: z.email('Email is invalid'),
  password: z.string().min(1, 'Password is required'),
})
import * as z from 'zod'

export const signupValidation = z.object({
    name: z.string().min(3, {message: 'Too short'}),
    username: z.string().min(3 , {message: 'Too short'}),
    email: z.string().email(),
    password: z.string().min(8 , {message: 'Password must be at least 9 characters'}),

  })

  export const signinValidation = z.object({
    email: z.string().email(),
    password: z.string().min(8 , {message: 'Password must be at least 9 characters'}),

  })

  export const postValidation = z.object({
    caption: z.string().min(5).max(300),
    file: z.custom<File[]>(),
    location: z.string().min(3).max(100),
    tags: z.string()
  })
  

  export const ProfileValidation = z.object({
    file: z.custom<File[]>(),
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    username: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email(),
    bio: z.string(),
  });
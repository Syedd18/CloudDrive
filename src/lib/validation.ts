import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// File validation schemas
export const uploadFileSchema = z.object({
  folderId: z.string().uuid().optional().nullable(),
});

export const updateFileSchema = z.object({
  name: z.string().min(1, 'Filename cannot be empty').optional(),
  starred: z.boolean().optional(),
  trashed: z.boolean().optional(),
});

export const shareFileSchema = z.object({
  emails: z.array(z.string().email()).min(1, 'At least one email is required'),
  canEdit: z.boolean().default(false),
});

// Query parameter schemas
export const fileQuerySchema = z.object({
  starred: z.string().transform((val) => val === 'true').optional(),
  trashed: z.string().transform((val) => val === 'true').optional(),
  folderId: z.string().transform((val) => val === 'null' ? null : val).optional(),
  search: z.string().optional(),
  type: z.string().optional(),
  sortBy: z.enum(['name', 'size', 'updatedAt', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

// Folder validation
export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
  parentId: z.string().uuid().optional().nullable(),
});

// Generic validation helper
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Validation failed', formattedErrors);
    }
    throw error;
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

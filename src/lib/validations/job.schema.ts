import { z } from 'zod';

export const ATSAuditSchema = z.object({
  resumeText: z
    .string()
    .trim()
    .min(20, { message: 'Resume text must contain at least 20 characters for evaluation.' })
    .max(20000, { message: 'Resume text exceeds maximum length of 20,000 characters.' }),
  targetRole: z
    .string()
    .trim()
    .max(100, { message: 'Target role cannot exceed 100 characters.' })
    .optional(),
});

export const FileUploadMetadataSchema = z.object({
  filename: z
    .string()
    .trim()
    .min(1, { message: 'Filename is required.' })
    .max(255, { message: 'Filename is too long.' }),
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'application/pdf'], {
    required_error: 'Unsupported file MIME type. Only PNG, JPEG, WebP, and PDF are allowed.',
  }),
  sizeInBytes: z
    .number()
    .positive({ message: 'File size must be positive.' })
    .max(5 * 1024 * 1024, { message: 'File size exceeds server-side limit of 5MB.' }),
});

export type ATSAuditInput = z.infer<typeof ATSAuditSchema>;
export type FileUploadMetadataInput = z.infer<typeof FileUploadMetadataSchema>;

import { z } from 'zod';

export const PostCreationSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: 'Post content cannot be empty.' })
    .max(5000, { message: 'Post content exceeds 5,000 characters.' }),
  type: z.enum(['text', 'project_launch', 'repo_update', 'article', 'code_snippet', 'ai_insight'], {
    required_error: 'Creation type is required.',
  }),
  repoUrl: z
    .string()
    .trim()
    .url({ message: 'Must be a valid repository URL.' })
    .regex(/^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/, {
      message: 'Must be a valid GitHub repository URL (https://github.com/owner/repo).',
    })
    .optional()
    .or(z.literal('')),
});

export type PostCreationInput = z.infer<typeof PostCreationSchema>;

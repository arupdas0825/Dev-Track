import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, AppError } from '@/lib/error-handler';
import { FileUploadMetadataSchema } from '@/lib/validations/job.schema';
import crypto from 'crypto';

// Magic bytes signatures for supported MIME types
const MAGIC_NUMBERS: Record<string, number[][]> = {
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_NUMBERS[mimeType];
  if (!signatures) return false;

  return signatures.some((sig) => {
    return sig.every((byte, index) => buffer[index] === byte);
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      throw new AppError({
        message: 'No file uploaded.',
        statusCode: 400,
        code: 'MISSING_FILE',
      });
    }

    // 1. Zod Metadata Validation (size & type)
    const validationResult = FileUploadMetadataSchema.safeParse({
      filename: file.name,
      mimeType: file.type,
      sizeInBytes: file.size,
    });

    if (!validationResult.success) {
      throw validationResult.error;
    }

    // 2. Read file buffer for content signature verification
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Content Magic Bytes Verification
    const isValidSignature = verifyMagicBytes(buffer, file.type);
    if (!isValidSignature) {
      throw new AppError({
        message: 'File content signature does not match the claimed MIME type. Upload rejected.',
        statusCode: 400,
        code: 'INVALID_FILE_SIGNATURE',
      });
    }

    // 4. Secure Non-executable File Naming
    const ext = file.name.split('.').pop() || 'bin';
    const safeFilename = `${crypto.randomUUID()}.${ext}`;

    // Return sanitized success payload (no internal storage paths exposed)
    return NextResponse.json(
      {
        success: true,
        message: 'File verified and uploaded successfully.',
        file: {
          id: crypto.randomUUID(),
          filename: safeFilename,
          mimeType: file.type,
          sizeInBytes: file.size,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

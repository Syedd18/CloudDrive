import {
  fileRepository,
  FileQueryOptions,
} from '@/repositories/file.repository';
import {
  uploadFileToSupabase,
  deleteFileFromSupabase,
  getSignedUrlFromSupabase,
} from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '@/lib/errors';
import logger from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

export interface UploadFileInput {
  userId: string;
  fileBuffer: Buffer;
  filename: string;
  mimeType: string;
  size: number;
  folderId?: string | null;
}

export interface UpdateFileInput {
  name?: string;
  starred?: boolean;
  trashed?: boolean;
}

function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (
    mimeType.includes('document') ||
    mimeType.includes('word') ||
    mimeType.includes('text')
  )
    return 'document';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
    return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
    return 'presentation';
  if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('7z') ||
    mimeType.includes('tar') ||
    mimeType.includes('gzip') ||
    mimeType.includes('x-compressed') ||
    mimeType.includes('x-bzip')
  )
    return 'archive';
  return 'file';
}

export class FileService {
  /**
   * Upload file to S3 and create database record
   */
  async uploadFile(input: UploadFileInput) {
    const { userId, fileBuffer, filename, mimeType, size, folderId } = input;

    // Check file size limit
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '104857600');
    if (size > maxSize) {
      throw new BadRequestError(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
      );
    }

    // Validate folder ownership if folderId provided
    if (folderId) {
      const folder = await fileRepository.findById(folderId, userId);
      if (!folder) {
        throw new NotFoundError('Parent folder not found');
      }
      if (folder.type !== 'folder') {
        throw new BadRequestError('Parent must be a folder');
      }
    }

    // Create file path for Supabase Storage: userId/uuid-filename
    const fileExtension = filename.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const filePath = `${userId}/${uniqueFilename}`;

    // Upload to Supabase Storage
    const fileUrl = await uploadFileToSupabase(filePath, fileBuffer, mimeType);

    // Create database record
    const file = await fileRepository.create({
      name: filename,
      originalName: filename,
      type: getFileType(mimeType),
      size: BigInt(size),
      mimeType,
      s3Key: filePath, // Using s3Key field to store Supabase path
      s3Url: fileUrl,  // Using s3Url field to store Supabase URL
      user: { connect: { id: userId } },
      ...(folderId && { parent: { connect: { id: folderId } } }),
    });

    logger.info(`File uploaded: ${file.id} - ${filename}`);

    // Create audit log
    await this.createAuditLog(userId, 'upload', file.id, {
      filename,
      size,
      mimeType,
    });

    return {
      id: file.id,
      name: file.name,
      type: file.type,
      size: Number(file.size),
      mimeType: file.mimeType,
      s3Url: file.s3Url,
      starred: file.starred,
      trashed: file.trashed,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId: string, userId: string) {
    const file = await fileRepository.findById(fileId, userId);
    if (!file) {
      throw new NotFoundError('File not found');
    }

    return {
      id: file.id,
      name: file.name,
      type: file.type,
      size: Number(file.size),
      mimeType: file.mimeType,
      starred: file.starred,
      trashed: file.trashed,
      shared: file.sharedWith.length > 0,
      sharedWith: file.sharedWith.map((s) => s.email),
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }

  /**
   * Get files with filtering and pagination
   */
  async getFiles(options: FileQueryOptions) {
    const result = await fileRepository.findMany(options);

    return {
      files: result.files.map((file) => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: Number(file.size),
        mimeType: file.mimeType,
        starred: file.starred,
        trashed: file.trashed,
        shared: file.sharedWith.length > 0,
        sharedWith: file.sharedWith.map((s) => s.email),
        modified: file.updatedAt.toISOString(),
        folderId: file.folderId, // Include parent folder ID
        recent:
          new Date(file.updatedAt).getTime() >
          Date.now() - 7 * 24 * 60 * 60 * 1000,
      })),
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * Update file metadata
   */
  async updateFile(fileId: string, userId: string, updates: UpdateFileInput) {
    const file = await fileRepository.findById(fileId, userId);
    if (!file) {
      throw new NotFoundError('File not found');
    }

    await fileRepository.update(fileId, userId, updates);

    logger.info(`File updated: ${fileId}`);

    // Create audit log
    await this.createAuditLog(userId, 'update', fileId, updates);

    return { message: 'File updated successfully' };
  }

  /**
   * Generate signed download URL (legacy - kept for compatibility)
   */
  async getDownloadUrl(fileId: string, userId: string): Promise<string> {
    const { downloadUrl } = await this.getDownloadInfo(fileId, userId);
    return downloadUrl;
  }

  /**
   * Get download info including URL, filename, and mime type
   */
  async getDownloadInfo(fileId: string, userId: string): Promise<{ downloadUrl: string; filename: string; mimeType: string }> {
    const file = await fileRepository.findById(fileId, userId);
    if (!file) {
      throw new NotFoundError('File not found');
    }

    if (file.trashed) {
      throw new BadRequestError('Cannot download trashed files');
    }

    const signedUrl = await getSignedUrlFromSupabase(file.s3Key);

    logger.info(`Download URL generated for file: ${fileId}`);

    // Create audit log
    await this.createAuditLog(userId, 'download', fileId, {
      filename: file.name,
    });

    return {
      downloadUrl: signedUrl,
      filename: file.name,
      mimeType: file.mimeType,
    };
  }

  /**
   * Move file to trash
   */
  async moveToTrash(fileId: string, userId: string) {
    const file = await fileRepository.findById(fileId, userId);
    if (!file) {
      throw new NotFoundError('File not found');
    }

    await fileRepository.moveToTrash(fileId, userId);

    logger.info(`File moved to trash: ${fileId}`);

    // Create audit log
    await this.createAuditLog(userId, 'trash', fileId, {
      filename: file.name,
    });

    return { message: 'File moved to trash' };
  }

  /**
   * Restore file from trash
   */
  async restoreFromTrash(fileId: string, userId: string) {
    const file = await fileRepository.findById(fileId, userId);
    if (!file) {
      throw new NotFoundError('File not found');
    }

    if (!file.trashed) {
      throw new BadRequestError('File is not in trash');
    }

    await fileRepository.restoreFromTrash(fileId, userId);

    logger.info(`File restored from trash: ${fileId}`);

    return { message: 'File restored from trash' };
  }

  /**
   * Permanently delete file
   */
  async deleteFile(fileId: string, userId: string) {
    const file = await fileRepository.findById(fileId, userId);
    if (!file) {
      throw new NotFoundError('File not found');
    }

    // Delete from Supabase Storage
    await deleteFileFromSupabase(file.s3Key);

    // Delete from database
    await fileRepository.delete(fileId, userId);

    logger.info(`File permanently deleted: ${fileId}`);

    // Create audit log
    await this.createAuditLog(userId, 'delete', fileId, {
      filename: file.name,
      s3Key: file.s3Key,
    });

    return { message: 'File deleted permanently' };
  }

  /**
   * Share file with users
   */
  async shareFile(fileId: string, userId: string, emails: string[], canEdit = false) {
    const file = await fileRepository.findById(fileId, userId);
    if (!file) {
      throw new NotFoundError('File not found');
    }

    // Create share records
    const shares = await Promise.all(
      emails.map((email) =>
        prisma.share.upsert({
          where: {
            fileId_email: { fileId, email },
          },
          create: { fileId, email, canEdit },
          update: { canEdit },
        })
      )
    );

    logger.info(`File shared: ${fileId} with ${emails.length} users`);

    // Create audit log
    await this.createAuditLog(userId, 'share', fileId, { emails, canEdit });

    return shares;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(userId: string) {
    const stats = await fileRepository.getUserStorageStats(userId);
    const totalStorage = 15 * 1024 * 1024 * 1024; // 15 GB

    const starredCount = await prisma.file.count({
      where: { userId, starred: true, trashed: false },
    });

    const trashedCount = await prisma.file.count({
      where: { userId, trashed: true },
    });

    const sharedCount = await prisma.file.count({
      where: {
        userId,
        trashed: false,
        sharedWith: { some: {} },
      },
    });

    return {
      storage: {
        used: stats.usedStorage,
        total: totalStorage,
        percentage: (stats.usedStorage / totalStorage) * 100,
      },
      counts: {
        total: stats.fileCount,
        starred: starredCount,
        trashed: trashedCount,
        shared: sharedCount,
      },
    };
  }

  /**
   * Empty trash - permanently delete all trashed files
   */
  async emptyTrash(userId: string) {
    const trashedFiles = await fileRepository.findMany({
      userId,
      trashed: true,
    });

    // Delete each file from storage and database
    for (const file of trashedFiles.files) {
      try {
        await this.deleteFile(file.id, userId);
      } catch (error) {
        logger.error(`Error deleting file ${file.id} while emptying trash:`, error);
      }
    }

    logger.info(`Trash emptied for user: ${userId}, deleted ${trashedFiles.files.length} files`);

    return { message: 'Trash emptied', deletedCount: trashedFiles.files.length };
  }

  /**
   * Create audit log
   */
  private async createAuditLog(
    userId: string,
    action: string,
    resource: string,
    details?: any
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          details: JSON.stringify(details),
        },
      });
    } catch (error) {
      logger.error('Error creating audit log:', error);
      // Don't throw - audit log failure shouldn't break the main operation
    }
  }
}

export const fileService = new FileService();

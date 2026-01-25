import { prisma } from '@/lib/prisma';
import { File, Prisma } from '@prisma/client';
import logger from '@/lib/logger';

export interface FileQueryOptions {
  userId: string;
  starred?: boolean;
  trashed?: boolean;
  folderId?: string | null;
  search?: string;
  type?: string;
  sortBy?: 'name' | 'size' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface FileWithShares extends File {
  sharedWith: Array<{
    email: string;
    canEdit: boolean;
  }>;
}

export class FileRepository {
  /**
   * Create a new file record
   */
  async create(data: Prisma.FileCreateInput): Promise<File> {
    try {
      return await prisma.file.create({ data });
    } catch (error) {
      logger.error('Error creating file:', error);
      throw error;
    }
  }

  /**
   * Find file by ID with ownership check
   */
  async findById(id: string, userId: string): Promise<FileWithShares | null> {
    try {
      return await prisma.file.findFirst({
        where: { id, userId },
        include: {
          sharedWith: {
            select: {
              email: true,
              canEdit: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Error finding file by ID:', error);
      throw error;
    }
  }

  /**
   * Find files with advanced filtering and pagination
   */
  async findMany(options: FileQueryOptions): Promise<{
    files: FileWithShares[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const {
        userId,
        starred,
        trashed = false,
        folderId,
        search,
        type,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        page = 1,
        limit = 50,
      } = options;

      const skip = (page - 1) * limit;

      const where: Prisma.FileWhereInput = {
        userId,
        trashed,
        ...(starred !== undefined && { starred }),
        ...(folderId !== undefined && { folderId }),
        ...(type && { type }),
        ...(search && {
          name: {
            contains: search,
          },
        }),
      };

      const [files, total] = await Promise.all([
        prisma.file.findMany({
          where,
          include: {
            sharedWith: {
              select: {
                email: true,
                canEdit: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.file.count({ where }),
      ]);

      return {
        files,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error finding files:', error);
      throw error;
    }
  }

  /**
   * Update file
   */
  async update(
    id: string,
    userId: string,
    data: Prisma.FileUpdateInput
  ): Promise<File> {
    try {
      // First verify the file exists and belongs to the user
      const file = await prisma.file.findFirst({
        where: { id, userId }
      });
      
      if (!file) {
        throw new Error('File not found or access denied');
      }

      // Update using the unique ID
      return await prisma.file.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error('Error updating file:', error);
      throw error;
    }
  }

  /**
   * Soft delete (move to trash)
   */
  async moveToTrash(id: string, userId: string): Promise<void> {
    try {
      // First verify the file exists and belongs to the user
      const file = await prisma.file.findFirst({
        where: { id, userId }
      });
      
      if (!file) {
        throw new Error('File not found or access denied');
      }

      // Update using the unique ID
      await prisma.file.update({
        where: { id },
        data: {
          trashed: true,
          trashedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error moving file to trash:', error);
      throw error;
    }
  }

  /**
   * Restore from trash
   */
  async restoreFromTrash(id: string, userId: string): Promise<void> {
    try {
      // First verify the file exists and belongs to the user
      const file = await prisma.file.findFirst({
        where: { id, userId }
      });
      
      if (!file) {
        throw new Error('File not found or access denied');
      }

      // Update using the unique ID
      await prisma.file.update({
        where: { id },
        data: {
          trashed: false,
          trashedAt: null,
        },
      });
    } catch (error) {
      logger.error('Error restoring file from trash:', error);
      throw error;
    }
  }

  /**
   * Permanent delete
   */
  async delete(id: string, userId: string): Promise<File> {
    try {
      return await prisma.file.delete({
        where: { id, userId },
      });
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Get user storage statistics
   */
  async getUserStorageStats(userId: string) {
    try {
      const files = await prisma.file.findMany({
        where: { userId, trashed: false },
        select: { size: true },
      });

      const usedStorage = files.reduce(
        (acc, file) => acc + Number(file.size),
        0
      );

      return {
        usedStorage,
        fileCount: files.length,
      };
    } catch (error) {
      logger.error('Error getting storage stats:', error);
      throw error;
    }
  }

  /**
   * Get files by S3 key
   */
  async findByS3Key(s3Key: string): Promise<File | null> {
    try {
      return await prisma.file.findUnique({ where: { s3Key } });
    } catch (error) {
      logger.error('Error finding file by S3 key:', error);
      throw error;
    }
  }

  /**
   * Get recent files
   */
  async getRecentFiles(userId: string, limit = 10): Promise<FileWithShares[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      return await prisma.file.findMany({
        where: {
          userId,
          trashed: false,
          updatedAt: {
            gte: sevenDaysAgo,
          },
        },
        include: {
          sharedWith: {
            select: {
              email: true,
              canEdit: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      logger.error('Error getting recent files:', error);
      throw error;
    }
  }
}

export const fileRepository = new FileRepository();

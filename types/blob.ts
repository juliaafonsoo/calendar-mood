/**
 * Tipos TypeScript para Vercel Blob
 */

export interface BlobObject {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
  downloadUrl: string;
}

export interface BlobListResult {
  blobs: BlobObject[];
  cursor?: string;
  hasMore: boolean;
}

export interface BlobMetadata {
  contentType?: string;
  contentDisposition?: string;
  cacheControl?: string;
  size: number;
  uploadedAt: Date;
}

export interface BlobUploadResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  size: number;
  uploadedAt: Date;
  downloadUrl: string;
}

export type BlobAccess = 'public' | 'private';

export interface BlobError extends Error {
  code?: string;
  statusCode?: number;
}

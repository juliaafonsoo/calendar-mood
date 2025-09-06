import { useState, useCallback } from 'react';
import { uploadBlob, deleteBlob, listBlobs, BlobUploadOptions } from '@/lib/blob';

export interface UseVercelBlobReturn {
  uploading: boolean;
  deleting: boolean;
  listing: boolean;
  error: string | null;
  upload: (file: File, options?: BlobUploadOptions) => Promise<any>;
  remove: (url: string) => Promise<void>;
  list: (prefix?: string, limit?: number) => Promise<any[]>;
  clearError: () => void;
}

/**
 * Hook personalizado para gerenciar operações com Vercel Blob
 * Fornece estados de loading e error handling para uploads, deletes e listagem
 */
export function useVercelBlob(): UseVercelBlobReturn {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [listing, setListing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const upload = useCallback(async (file: File, options?: BlobUploadOptions) => {
    setUploading(true);
    setError(null);
    
    try {
      const result = await uploadBlob(file.name, file, options);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido no upload';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const remove = useCallback(async (url: string) => {
    setDeleting(true);
    setError(null);
    
    try {
      await deleteBlob(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao deletar';
      setError(errorMessage);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  const list = useCallback(async (prefix?: string, limit?: number) => {
    setListing(true);
    setError(null);
    
    try {
      const blobs = await listBlobs(prefix, limit);
      return blobs;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao listar';
      setError(errorMessage);
      throw err;
    } finally {
      setListing(false);
    }
  }, []);

  return {
    uploading,
    deleting,
    listing,
    error,
    upload,
    remove,
    list,
    clearError,
  };
}

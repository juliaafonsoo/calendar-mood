import { put, del, list, head } from '@vercel/blob';

/**
 * Configuração do Vercel Blob
 * Este arquivo centraliza as operações com o Vercel Blob Storage
 */

export interface BlobUploadOptions {
  access?: 'public' | 'private';
  addRandomSuffix?: boolean;
  cacheControlMaxAge?: number;
}

/**
 * Faz upload de um arquivo para o Vercel Blob
 * @param filename Nome do arquivo
 * @param body Conteúdo do arquivo (File, ArrayBuffer, string, etc.)
 * @param options Opções de upload
 * @returns Promise com as informações do blob
 */
export async function uploadBlob(
  filename: string,
  body: File | ArrayBuffer | string,
  options: BlobUploadOptions = {}
) {
  try {
    const blob = await put(filename, body, {
      access: options.access || 'public',
      addRandomSuffix: options.addRandomSuffix ?? true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    } as any);
    
    return blob;
  } catch (error) {
    console.error('Erro ao fazer upload do blob:', error);
    throw new Error('Falha no upload do arquivo');
  }
}

/**
 * Deleta um arquivo do Vercel Blob
 * @param url URL do blob a ser deletado
 * @returns Promise void
 */
export async function deleteBlob(url: string) {
  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    console.error('Erro ao deletar blob:', error);
    throw new Error('Falha ao deletar o arquivo');
  }
}

/**
 * Lista arquivos no Vercel Blob
 * @param prefix Prefixo para filtrar arquivos
 * @param limit Limite de arquivos retornados
 * @returns Promise com a lista de blobs
 */
export async function listBlobs(prefix?: string, limit?: number) {
  try {
    const { blobs } = await list({
      prefix,
      limit,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    return blobs;
  } catch (error) {
    console.error('Erro ao listar blobs:', error);
    throw new Error('Falha ao listar arquivos');
  }
}

/**
 * Obtém metadados de um arquivo
 * @param url URL do blob
 * @returns Promise com os metadados
 */
export async function getBlobMetadata(url: string) {
  try {
    const metadata = await head(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    return metadata;
  } catch (error) {
    console.error('Erro ao obter metadados do blob:', error);
    throw new Error('Falha ao obter metadados do arquivo');
  }
}

/**
 * Gera uma URL temporária para um blob privado
 * Este é um placeholder - a implementação real depende da sua lógica de negócio
 */
export function generateTemporaryUrl(blobUrl: string, expiresIn: number = 3600) {
  // Esta função seria implementada se você precisar de URLs temporárias
  // para blobs privados
  return blobUrl;
}

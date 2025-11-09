import type { AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';
import { getToken } from '@/lib/auth/utils';
import RNFetchBlob from 'react-native-blob-util';

import { client } from '../common';
import type {
  GetDocumentsByEmailResponse,
  GetDocumentBatchesContentResponse,
  UploadDocumentResponse,
  UploadDocumentVariables,
  DeleteDocumentResponse,
  DeleteDocumentVariables,
  EditDocumentResponse,
  EditDocumentVariables,
} from './types';
import { Env } from '@/lib/env';

export const useGetDocumentsByEmail = createQuery<
  GetDocumentsByEmailResponse,
  void,
  AxiosError
>({
  queryKey: ['documents', 'by-email'],
  fetcher: async () =>
    client({
      url: 'documents/by_email',
      method: 'GET',
    }).then((response) => response.data),
});

export const deleteDocument = createMutation<DeleteDocumentResponse, DeleteDocumentVariables, Error>({
  mutationKey: ['documents', 'delete'],
  mutationFn: async ({ documentId }) => {
    return client({
      url: `documents/${documentId}`,
      method: 'DELETE',
    }).then((response) => response.data);
  },
});

export const editDocument = createMutation<EditDocumentResponse, EditDocumentVariables, Error>({
  mutationKey: ['documents', 'edit'],
  mutationFn: async ({ documentId, documentTitle }) => {
    return client({
      url: `documents/${documentId}/name`,
      data: {
        new_name: documentTitle,
      },
      method: 'PUT',
    }).then((response) => response.data);
  },
});

export const useGetDocumentBatchesContent = createQuery<
  GetDocumentBatchesContentResponse,
  { documentId: string },
  AxiosError
>({
  queryKey: ['documents', 'batches-content'],
  fetcher: async (variables) => {
    const { documentId } = variables;
    return client({
      url: `documents/${documentId}/batches_content`,
      method: 'GET',
    }).then((response) => response.data);
  },
});

export const uploadDocument = createMutation<UploadDocumentResponse, UploadDocumentVariables, Error>({
  mutationKey: ['documents', 'upload'],
  mutationFn: async ({ document, user_email }) => {
    try {
      console.log('Starting upload with RNFetchBlob...');
      console.log('Document:', document);
      console.log('User email:', user_email);
      
      const token = getToken();
      
      // Remove 'file://' prefix if present
      const filePath = document.uri.replace('file://', '');
      console.log('File path:', filePath);
      
      const response = await RNFetchBlob.fetch(
        'POST',
        `${Env.API_URL}/process_document/`,
        {
          'Authorization': token?.access ? `Bearer ${token.access}` : '',
          'Content-Type': 'multipart/form-data',
        },
        [
          {
            name: 'user_email',
            data: user_email,
          },
          {
            name: 'file',
            filename: document.name,
            type: document.type,
            data: RNFetchBlob.wrap(filePath),
          },
        ]
      );

      console.log('Response status:', response.respInfo.status);
      
      const responseData = response.json();
      console.log('Response data:', responseData);

      if (response.respInfo.status >= 400) {
        throw new Error(responseData.message || `Upload failed with status ${response.respInfo.status}`);
      }

      return responseData;
      
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error.message || 'Upload failed');
    }
  },
});
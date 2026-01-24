import type { AxiosError } from 'axios';
import RNFetchBlob from 'react-native-blob-util';
import { createMutation, createQuery } from 'react-query-kit';

import { getToken } from '@/lib/auth/utils';
import { Env } from '@/lib/env';

import { client } from '../common';
import type {
  DeleteDocumentResponse,
  DeleteDocumentVariables,
  EditDocumentResponse,
  EditDocumentVariables,
  ExplainTermResponse,
  ExplainTermVariables,
  GetDocumentBatchesContentResponse,
  GetDocumentsByEmailResponse,
  UploadDocumentResponse,
  UploadDocumentVariables,
} from './types';

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

export const deleteDocument = createMutation<
  DeleteDocumentResponse,
  DeleteDocumentVariables,
  Error
>({
  mutationKey: ['documents', 'delete'],
  mutationFn: async ({ documentId }) => {
    return client({
      url: `documents/${documentId}`,
      method: 'DELETE',
    }).then((response) => response.data);
  },
});

export const editDocument = createMutation<
  EditDocumentResponse,
  EditDocumentVariables,
  Error
>({
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

export const uploadDocument = createMutation<
  UploadDocumentResponse,
  UploadDocumentVariables,
  Error
>({
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
          Authorization: token?.access ? `Bearer ${token.access}` : '',
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
        throw new Error(
          responseData.message ||
            `Upload failed with status ${response.respInfo.status}`
        );
      }

      return responseData;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error.message || 'Upload failed');
    }
  },
});

export const explainTerm = createMutation<
  ExplainTermResponse,
  ExplainTermVariables,
  Error
>({
  mutationKey: ['documents', 'edit'],
  mutationFn: async ({ documentId, batch_order, term }) => {
    console.log('documentId', documentId);
    console.log('batch_order', batch_order);
    console.log('term', term);
    return client({
      url: `explain_term/`,
      data: {
        document_id: documentId,
        batch_order: batch_order,
        term: term,
      },
      method: 'POST',
    }).then((response) => response.data);
  },
});

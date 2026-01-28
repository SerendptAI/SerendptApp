import type { AxiosError } from 'axios';
import RNFetchBlob from 'react-native-blob-util';
import { createMutation, createQuery } from 'react-query-kit';

import { getToken } from '@/lib/auth/utils';
import { Env } from '@/lib/env';

import { client } from '../common';
import type {
  AudioStreamResponse,
  AudioStreamVariables,
  DeleteDocumentResponse,
  DeleteDocumentVariables,
  EditDocumentResponse,
  EditDocumentVariables,
  ExplainTermResponse,
  ExplainTermVariables,
  GetAudioVoicesResponse,
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
    

      const token = getToken();

      // Remove 'file://' prefix if present
      const filePath = document.uri.replace('file://', '');

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


      const responseData = response.json();

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

export const audioStream = createMutation<
  AudioStreamResponse,
  AudioStreamVariables,
  Error
>({
  mutationKey: ['documents', 'batch_order'],
  mutationFn: async ({ documentId, batch_order, language, speaker }) => {
    return client({
      url: `audio/stream`,
      data: {
        document_id: documentId,
        batch_order: batch_order,
        language: language,
        speaker: speaker,
      },
      method: 'POST',
    }).then((response) => response.data);
  },
});

export const useGetAudioVoices = createQuery<
  GetAudioVoicesResponse,
  AxiosError
>({
  queryKey: ['documents', 'batches-content'],
  fetcher: async () => {
    return client({
      url: `audio/voices`,
      method: 'GET',
    }).then((response) => response.data);
  },
});

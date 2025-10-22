import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '../common';
import type { GetDocumentsByEmailResponse, GetDocumentBatchesContentResponse } from './types';

export const useGetDocumentsByEmail = createQuery<GetDocumentsByEmailResponse, void, AxiosError>({
  queryKey: ['documents', 'by-email'],
  fetcher: async () =>
    client({
      url: 'documents/by_email',
      method: 'GET',
    }).then((response) => response.data),
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

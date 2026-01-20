import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '../common';
import type { GetChatResponse } from './types';

type Variables = { document_id: string };
type Response = GetChatResponse;

export const useGetChat = createQuery<Response, Variables, AxiosError>({
  queryKey: ['get-chat'],
  fetcher: (variables) => {
    return client
      .get(`conversations/${variables.document_id}`)
      .then((response) => response.data);
  },
});

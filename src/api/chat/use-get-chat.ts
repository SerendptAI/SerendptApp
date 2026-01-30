import type { AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import { client } from '../common';
import type { DeleteChatResponse, GetChatResponse } from './types';

type Variables = { document_id: string };
type Response = GetChatResponse;

export const useGetChat = createQuery<Response, Variables, AxiosError>({
  queryKey: ['get-chat'],
  fetcher: (variables) => {
    return client
      .get(`conversations/${variables.document_id}`)
      .then((response) => {
        return response.data;
      });
  },
});

export const useDeleteChat = createMutation<
  DeleteChatResponse,
  Variables,
  AxiosError
>({
  mutationFn: async (variables) =>
    client({
      url: `conversations/${variables.document_id}`,
      method: 'DELETE',
    }).then((response) => {
      return response.data;
    }),
});

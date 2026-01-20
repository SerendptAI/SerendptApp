import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '../common';
import type { ChatResponse } from './types';

type Variables = { document_id: string; batch_order: number; question: string };
type Response = ChatResponse;

export const useChat = createMutation<Response, Variables, AxiosError>({
  mutationFn: async (variables) =>
    client({
      url: 'chat/',
      method: 'POST',
      data: variables,
    }).then((response) => {
      return response.data;
    }),
});

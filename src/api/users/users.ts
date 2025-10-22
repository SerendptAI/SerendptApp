import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '../common';
import type { GetUserResponse } from './types';

export const useGetUser = createQuery<GetUserResponse, void, AxiosError>({
  queryKey: ['user'],
  fetcher: async () =>
    client({
      url: 'users/me',
      method: 'GET',
    }).then((response) => response.data),
});

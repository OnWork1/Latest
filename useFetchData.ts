export const useFetchData = <TResponse>() => {
  const runtimeConfig = useRuntimeConfig();
  const { setLoading, displayErrorMessage } = useAppStore();

  const handleFetch = async (url: string): Promise<TResponse> => {
    try {
      setLoading(true);
      const { response }: { response: TResponse } = await $fetch(url);
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      displayErrorMessage(error);
      throw error;
    }
  };

  const fetchById = async (
    endpoint: string,
    itemId: number
  ): Promise<TResponse> => {
    const url = `${runtimeConfig.public.apiUrl}/${endpoint}/${itemId}`;
    return handleFetch(url);
  };

  const fetchData = async (
    endpoint: string,
    page: number,
    perPage: number,
    searchQuery: string,
    fetchAll: boolean = false,
    additionalQueryParams: string = ''
  ): Promise<TResponse> => {
    const queryParams = fetchAll
      ? `?${additionalQueryParams}`
      : `?page=${
          searchQuery ? 1 : page
        }&perPage=${perPage}&${additionalQueryParams}&searchQuery=${searchQuery}`;
    const url = `${runtimeConfig.public.apiUrl}/${endpoint}${queryParams}`;
    return handleFetch(url);
  };

  return { fetchById, fetchData };
};

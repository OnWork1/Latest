import { ToastType } from '~/enums/toast-type';

export const useCreateData = <TResponse>() => {
  const runtimeConfig = useRuntimeConfig();
  const { setLoading, displayMessage, displayErrorMessage } = useAppStore();

  const createData = async (endpoint: string, payload: any) => {
    setLoading(true);

    try {
      const { response }: { response: TResponse } = await $fetch(
        `${runtimeConfig.public.apiUrl}/${endpoint}`,
        {
          method: 'POST',
          body: { ...payload },
        }
      );

      displayMessage(ToastType.Success, 'Record created successfully');
      return response;
    } catch (error) {
      displayErrorMessage(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createData };
};

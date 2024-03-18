import { ToastType } from '~/enums/toast-type';
import { type APIResponse } from '~/interfaces/response/api-response';

export const useUpdateData = <TResponse>() => {
  const runtimeConfig = useRuntimeConfig();
  const { setLoading, displayMessage, displayErrorMessage } = useAppStore();

  const updateData = async (
    endpoint: string,
    payload: any
  ): Promise<APIResponse<TResponse>> => {
    setLoading(true);

    try {
      await $fetch(`${runtimeConfig.public.apiUrl}/${endpoint}/${payload.id}`, {
        //@ts-ignore
        method: 'PATCH',
        body: { ...payload },
      });

      displayMessage(ToastType.Success, 'Record updated successfully');
      return { id: payload.id };
    } catch (error) {
      displayErrorMessage(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { updateData };
};

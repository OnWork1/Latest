import { ToastType } from '~/enums/toast-type';

export const useDeleteData = () => {
  const runtimeConfig = useRuntimeConfig();
  const { setLoading, displayMessage, displayErrorMessage } = useAppStore();

  const deleteData = async (endpoint: string, id: number) => {
    setLoading(true);
    await $fetch(`${runtimeConfig.public.apiUrl}/${endpoint}/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        displayMessage(ToastType.Success, 'Item deleted successfully');
      })
      .catch((error) => {
        displayErrorMessage(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { deleteData };
};

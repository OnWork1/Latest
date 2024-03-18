import { useToast } from 'primevue/usetoast';
import { ToastType } from '~/enums/toast-type';

export const useAccountExportStore = defineStore('accountExportStore', () => {
  const endpoint = 'exports/account';
  const isLoading = ref(false);
  const toast = useToast();
  const runtimeConfig = useRuntimeConfig();

  const setLoading = (value: boolean) => {
    isLoading.value = value;
  };

  const downloadD365File = async (
    id: number,
    transactionDate: string,
    documentDate: string
  ): Promise<void> => {
    try {
      setLoading(true);
      const response: Response = await fetch(
        `${runtimeConfig.public.apiUrl}/${endpoint}?id=${id}&transactionDate=${transactionDate}&documentDate=${documentDate}`
      );
      console.log('RESPONSE', response);
      if (!response.ok) {
        setLoading(false);
        toast.add({
          severity: ToastType.Error,
          detail: 'Unexpected error occured..',
          life: 5000,
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let filename = 'download';
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
          contentDisposition
        );
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.log(error);
      toast.add({
        severity: ToastType.Error,
        detail: 'Unexpected error occured..',
        life: 5000,
      });

      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,
    downloadD365File,
    setLoading,
  };
});

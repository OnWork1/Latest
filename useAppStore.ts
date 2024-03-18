import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ToastType } from '~/enums/toast-type';
import { useToast } from 'primevue/usetoast';

export const useAppStore = defineStore('appStore', () => {
  const isLoading = ref(false);

  const toast = useToast();

  const setLoading = (value: boolean) => {
    isLoading.value = value;
  };

  const showMessage = (
    severity: ToastType,
    message: string,
    duration: number = 5000
  ) => {
    toast.add({
      severity: severity,
      detail: message,
      life: duration,
    });
  };

  const displayErrorMessage = (error: any) => {
    const statusMessage = { ...error.response._data }.statusMessage;
    const data: any[] = { ...error.response._data }.data;
    if (data?.length) {
      data.forEach((err) => {
        showMessage(ToastType.Error, err.message);
      });
    } else {
      showMessage(
        ToastType.Error,
        `${statusMessage ? statusMessage : 'Something went wrong'}`
      );
    }
  };

  const displayMessage = (severity: ToastType, message: string) => {
    showMessage(severity, message);
  };

  return {
    isLoading,
    setLoading,
    displayMessage,
    displayErrorMessage,
  };
});

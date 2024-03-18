import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ToastType } from '~/enums/toast-type';

const mock = vi.fn();
describe('useAppStore', () => {
  beforeAll(() => {
    vi.mock('primevue/usetoast', () => ({
      useToast: () => ({
        add: mock,
      }),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('Should show one toast with error message', () => {
    const { displayErrorMessage } = useAppStore();
    const errMsg = 'Internal Error Occured';

    displayErrorMessage({ response: { _data: { statusMessage: errMsg } } });

    expect(mock).toBeCalledWith({
      severity: ToastType.Error,
      detail: errMsg,
      life: 5000,
    });
  });

  it('Should show one toast without error message', () => {
    const { displayErrorMessage } = useAppStore();

    displayErrorMessage({ response: { _data: {} } });

    expect(mock).toBeCalledWith({
      severity: ToastType.Error,
      detail: 'Something went wrong',
      life: 5000,
    });
  });

  it('Should show multiple toasts', () => {
    const { displayErrorMessage } = useAppStore();

    displayErrorMessage({
      response: {
        _data: { data: [{ message: 'Error 1' }, { message: 'Error 2' }] },
      },
    });

    expect(mock).toHaveBeenNthCalledWith(1, {
      severity: ToastType.Error,
      detail: 'Error 1',
      life: 5000,
    });

    expect(mock).toHaveBeenNthCalledWith(2, {
      severity: ToastType.Error,
      detail: 'Error 2',
      life: 5000,
    });
  });

  it('Should invoke setLoading', () => {
    const { setLoading, isLoading } = useAppStore();

    setLoading(false);

    expect(isLoading).toEqual(false);
  });
});

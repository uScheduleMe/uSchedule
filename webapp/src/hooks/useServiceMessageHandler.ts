import { responseMessagesSchema } from '@services/constants';
import { ResponseMessage } from '@services/types';
import StatusCodes from '@utils/StatusCodes';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Required } from 'utility-types';

/**
 * A hook that returns an function which provides a translated API Error message.
 * The function will try to extract the error from the API response, and if it cannot,
 * it will use the provided fallback message.
 */
export const useServiceMessageHandler = (): typeof messageHandler => {
  const { t, i18n } = useTranslation(['common', 'api_message']);

  const messageHandler = (
    error: unknown,
    fallback_message: string,
    toast_messages: boolean = false,
  ): ResponseMessage[] => {
    const handleToast = (messages: ResponseMessage[]): ResponseMessage[] => {
      if (toast_messages) {
        messages.forEach((m) => toast[m.type](m.message));
      }
      return messages;
    };

    const template: ResponseMessage = {
      type: 'error',
      message: fallback_message,
      title: '',
      code: '',
    };

    if (error instanceof Error) {
      const axiosError: AxiosError = error as AxiosError;

      if (axiosError.isAxiosError) {
        // Non 2xx response
        if (axiosError.response) {
          let apiErrorMessages: ResponseMessage[] | undefined = [];
          if (StatusCodes.isClientError(axiosError.response.status)) {
            try {
              apiErrorMessages = responseMessagesSchema
                .parse(axiosError.response.data)
                ?.filter(
                  (m): m is Required<ResponseMessage, 'code'> =>
                    !!m.code && i18n.exists(`api_message:${m.code}`),
                )
                .map((m) => ({
                  ...m,
                  message: t(`api_message:${m.code as 'unknown'}` as const),
                }));
            } catch (e: unknown) {}
          }
          return handleToast(apiErrorMessages?.length ? apiErrorMessages : [template]);
        }

        // No response received
        if (axiosError.request) {
          return handleToast([
            { ...template, message: t('common:error.http_request_no_response') },
          ]);
        }
      }

      console.error('Error', error.message);
    } else {
      console.error('Error', error);
    }
    return handleToast([{ ...template, message: t('common:error.http_request_unexpected') }]);
  };

  return messageHandler;
};

import { axiosApi } from '@services/constants';
import { AxiosInstance } from 'axios';

export class FeedbackService {
  constructor(private axios: AxiosInstance = axiosApi) {}

  public async submit(
    name: string,
    email: string,
    is_signed_in: boolean,
    subject: string,
    message: string,
    g_recaptcha_response?: string,
  ): Promise<void> {
    return await this.axios.post(
      `/notifier/feedback/mailto`,
      {
        metadata: {
          name,
          email: email || undefined, // coalesce empty string to undefined
          subject,
          is_signed_in,
        },
        message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Recaptcha-Response': g_recaptcha_response ?? '',
        },
      },
    );
  }
}

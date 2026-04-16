import { apiClient } from './client';
import { PaymentConfirmRequest, PaymentConfirmResponse, PaymentCreateResponse } from './types';

class PaymentService {
  async create(servicePackageId: number, elderlyProfileId: number): Promise<PaymentCreateResponse> {
    return apiClient.post<PaymentCreateResponse>(
      `/api/payments/create/${servicePackageId}`,
      null,
      {
        params: {
          elderlyProfileId,
        },
      }
    );
  }

  async confirm(payload: PaymentConfirmRequest): Promise<PaymentConfirmResponse> {
    return apiClient.post<PaymentConfirmResponse>('/api/payments/confirm', null, {
      params: {
        description: payload.description,
        amount: payload.amount,
      },
    });
  }
}

export const paymentService = new PaymentService();
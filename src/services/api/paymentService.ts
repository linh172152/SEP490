import { apiClient } from './client';
import { PaymentConfirmRequest, PaymentConfirmResponse, PaymentCreateResponse, UserPackageResponse } from './types';

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
    // Extract ID from UP:ID format
    const idStr = payload.description.replace('UP:', '').trim();
    const orderCode = parseInt(idStr);

    if (isNaN(orderCode)) {
      throw new Error("Invalid transaction description format. Expected 'UP:ID'");
    }

    // Call the PayOS Webhook endpoint to trigger backend success logic
    return apiClient.post<PaymentConfirmResponse>('/api/payment/payos/webhook', {
      code: "00",
      data: {
        orderCode: orderCode,
        amount: payload.amount
      }
    });
  }

  async confirmPayment(description: string, amount: number): Promise<string> {
    const response = await this.confirm({ description, amount });

    if (typeof response === "string") {
      return response;
    }

    return response.message ?? "Payment confirmed successfully";
  }

  async getManagerPending(): Promise<UserPackageResponse[]> {
    return apiClient.get<UserPackageResponse[]>("/api/payments/manager/pending");
  }
}

export const paymentService = new PaymentService();

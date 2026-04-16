import { apiClient } from "./client";

export const paymentService = {
  /**
   * Confirm a payment manually using the transaction description and amount.
   * This is part of the manual QR payment workflow.
   * 
   * @param description The transaction description (e.g., PKG:1|ACC:2|ELD:3)
   * @param amount The actual amount received in the bank account
   * @returns A confirmation message from the server
   */
  confirmPayment: async (description: string, amount: number): Promise<string> => {
    return apiClient.post<string>(
      `/api/payments/confirm?description=${encodeURIComponent(description)}&amount=${amount}`,
      {}
    );
  }
};

import { paymentApiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import {
  FareEstimateRequest,
  FareEstimateResponse,
  CalculateFareRequest,
  FareBreakdown,
  ProcessPaymentRequest,
  PaymentResponse,
  ReceiptResponse,
} from '../types/payment';

/**
 * PaymentService connects to Fare & Payment Service (Spring Boot microservice on port 8083).
 * Provides dynamic fare estimates, calculates final fares with surge pricing,
 * settles ride transactions, and fetches digital receipts.
 */
export class PaymentService {
  /**
   * Estimate fare based on distance, duration, and vehicle type
   * POST /api/v1/fares/estimate
   * Access: Public / Interservice
   */
  async estimateFare(
    request: FareEstimateRequest,
    token?: string
  ): Promise<FareEstimateResponse> {
    return paymentApiClient.post<FareEstimateResponse>(ENDPOINTS.FARES.ESTIMATE, request, {
      token,
    });
  }

  /**
   * Compute final itemized fare with surge pricing
   * POST /api/v1/fares/calculate
   * Access: Public / Interservice
   */
  async calculateFare(
    request: CalculateFareRequest,
    token?: string
  ): Promise<FareBreakdown> {
    return paymentApiClient.post<FareBreakdown>(ENDPOINTS.FARES.CALCULATE, request, {
      token,
    });
  }

  /**
   * Settle passenger payment and issue transaction record
   * POST /api/v1/payments
   * Access: PASSENGER / ADMIN
   */
  async processPayment(
    request: ProcessPaymentRequest,
    token?: string
  ): Promise<PaymentResponse> {
    return paymentApiClient.post<PaymentResponse>(ENDPOINTS.PAYMENTS.PROCESS, request, {
      token,
    });
  }

  /**
   * Query payment record by payment ID
   * GET /api/v1/payments/{paymentId}
   * Access: Authenticated
   */
  async getPaymentById(paymentId: string, token?: string): Promise<PaymentResponse> {
    return paymentApiClient.get<PaymentResponse>(ENDPOINTS.PAYMENTS.GET_BY_ID(paymentId), {
      token,
    });
  }

  /**
   * Query payment record by ride ID
   * GET /api/v1/payments/ride/{rideId}
   * Access: Authenticated
   */
  async getPaymentByRideId(rideId: string, token?: string): Promise<PaymentResponse> {
    return paymentApiClient.get<PaymentResponse>(ENDPOINTS.PAYMENTS.GET_BY_RIDE(rideId), {
      token,
    });
  }

  /**
   * Retrieve digital invoice receipt by payment ID
   * GET /api/v1/payments/{paymentId}/receipt
   * Access: Authenticated
   */
  async getReceiptById(paymentId: string, token?: string): Promise<ReceiptResponse> {
    return paymentApiClient.get<ReceiptResponse>(
      ENDPOINTS.PAYMENTS.GET_RECEIPT_BY_ID(paymentId),
      { token }
    );
  }

  /**
   * Retrieve digital invoice receipt for a ride
   * GET /api/v1/payments/receipts/ride/{rideId}
   * Access: Authenticated
   */
  async getReceiptByRideId(rideId: string, token?: string): Promise<ReceiptResponse> {
    return paymentApiClient.get<ReceiptResponse>(
      ENDPOINTS.PAYMENTS.GET_RECEIPT_BY_RIDE(rideId),
      { token }
    );
  }
}

export const paymentService = new PaymentService();

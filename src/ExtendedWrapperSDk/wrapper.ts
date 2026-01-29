/**
 * ExtendedWrapper - TypeScript wrapper for Extended Exchange API
 * Provides a clean interface to interact with the Extended Exchange trading API
 */

import {
  CreateOrderRequest,
  WithdrawRequest,
  SignedWithdrawRequest,
  CancelOrderRequest,
  PlacedOrder,
  OpenOrder,
  Position,
  Balance,
  Market,
  MarketStats,
  AssetOperation,
  ExtendedApiResponse,
  ExtendedWrapperConfig,
  OrderSide,
  TimeInForce,
  AssetOperationType,
  AssetOperationStatus,
  FundingRate,
  UpdateLeverageRequest,
} from "./types";

export class ExtendedWrapper {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;
  private retries: number;

  constructor(config: ExtendedWrapperConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000; // 30 seconds default
    this.retries = config.retries || 3;
  }

  /**
   * Make HTTP request with retry logic and error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ExtendedApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, any> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.apiKey) {
      headers["X-API-Key"] = this.apiKey;
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.timeout),
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})) as { detail?: string };
          throw new Error(
            `HTTP ${response.status}: ${
              errorData.detail || response.statusText
            }`
          );
        }
        
        const text = await response.text();

        // Replace large integers (greater than MAX_SAFE_INTEGER) with quoted strings
        // This regex finds numbers that are likely to be large integers in the "data" field
        const MAX_SAFE_INTEGER_STR = '9007199254740991';
        const largeIntegerRegex = /"data"\s*:\s*(\d{16,})/g;
      
        const modifiedText = text.replace(largeIntegerRegex, (match, largeInt) => {
          // Compare as strings to avoid precision loss
          if (largeInt.length > MAX_SAFE_INTEGER_STR.length || 
              (largeInt.length === MAX_SAFE_INTEGER_STR.length && largeInt > MAX_SAFE_INTEGER_STR)) {
            // Replace the number with a quoted string to preserve precision
            return `"data":"${largeInt}"`;
          }
          return match; // Keep original if it's a safe integer
        });
        
        const data = JSON.parse(modifiedText);
        
        if (data && typeof data.data === 'string' && /^\d+$/.test(data.data)) {
          const numValue = Number(data.data);
          if (Number.isSafeInteger(numValue)) {
            data.data = numValue;
          }
        }
        
        return data;
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.retries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("Request failed after all retries");
  }

  /**
   * Create a new order on Extended Exchange
   */
  async createOrder(
    request: CreateOrderRequest
  ): Promise<ExtendedApiResponse<PlacedOrder>> {
    return this.makeRequest<PlacedOrder>("/api/v1/orders", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Get all markets
   */
  async getMarkets(
    marketNames?: string
  ): Promise<ExtendedApiResponse<Market[]>> {
    const params = marketNames
      ? `?market_names=${encodeURIComponent(marketNames)}`
      : "";
    return this.makeRequest<Market[]>(`/api/v1/markets${params}`);
  }

   /**
   * 
   * @param orderId - The ID of the order to get
   * @returns The order
   */
   async getOrderByOrderId(orderId: string): Promise<ExtendedApiResponse<OpenOrder>> {
    const orderIdInt = parseInt(orderId);
    return this.makeRequest<OpenOrder>(`/api/v1/orderId/${orderIdInt}`);
  }

  /**
   * Get market statistics for a specific market
   */
  async getMarketStatistics(
    marketName: string
  ): Promise<ExtendedApiResponse<MarketStats>> {
    return this.makeRequest<MarketStats>(
      `/api/v1/markets/statistics?market_name=${encodeURIComponent(marketName)}`
    );
  }

  /**
   * Get current trading positions
   */
  async getPositions(
    marketNames?: string
  ): Promise<ExtendedApiResponse<Position[]>> {
    const params = marketNames
      ? `?market_names=${encodeURIComponent(marketNames)}`
      : "";
    return this.makeRequest<Position[]>(`/api/v1/positions${params}`);
  }

  /**
   * Get account balance and holdings
   */
  async getHoldings(): Promise<ExtendedApiResponse<Balance>> {
    return this.makeRequest<Balance>("/api/v1/holdings");
  }

  /**
   * Initiate a withdrawal from Extended Exchange
   * Returns data as number | string to preserve precision for large integers
   */
  async withdraw(
    request: WithdrawRequest
  ): Promise<ExtendedApiResponse<number | string>> {
    return this.makeRequest<number | string>("/api/v1/withdraw", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Create and sign a withdrawal request hash
   */
  async signWithdrawalRequest(request: SignedWithdrawRequest): Promise<
    ExtendedApiResponse<{
      withdraw_request_hash: string;
      signature: {
        r: string;
        s: string;
      };
    }>
  > {
    return this.makeRequest("/api/v1/withdraw/sign", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Cancel an existing order
   */
  async cancelOrder(
    request: CancelOrderRequest
  ): Promise<ExtendedApiResponse<{}>> {
    return this.makeRequest<{}>("/api/v1/orders/cancel", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }


  /**
   * Get all open orders
   */
  async getOpenOrders(
    marketName?: string
  ): Promise<ExtendedApiResponse<OpenOrder[]>> {
    const endpoint = marketName
      ? `/api/v1/marketOrders/${marketName}`
      : "/api/v1/marketOrders";
    return this.makeRequest<OpenOrder[]>(endpoint,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Update leverage on the market
   * @param request
   * @returns
   */
  async updateLeverage(
    request: UpdateLeverageRequest
  ): Promise<ExtendedApiResponse<{}>> {
    return this.makeRequest<{}>("/api/v1/leverage", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Get asset operations with optional filtering
   */
  async getAssetOperations(
    options: {
      id?: number;
      operationsType?: AssetOperationType[];
      operationsStatus?: AssetOperationStatus[];
      startTime?: number;
      endTime?: number;
      cursor?: number;
      limit?: number;
    } = {}
  ): Promise<ExtendedApiResponse<AssetOperation[]>> {
    const params = new URLSearchParams();

    if (options.id !== undefined) params.append("id", options.id.toString());
    if (options.operationsType) {
      params.append("operations_type", options.operationsType.join(","));
    }
    if (options.operationsStatus) {
      params.append("operations_status", options.operationsStatus.join(","));
    }
    if (options.startTime !== undefined)
      params.append("start_time", options.startTime.toString());
    if (options.endTime !== undefined)
      params.append("end_time", options.endTime.toString());
    if (options.cursor !== undefined)
      params.append("cursor", options.cursor.toString());
    if (options.limit !== undefined)
      params.append("limit", options.limit.toString());

    const queryString = params.toString();
    const endpoint = `/api/v1/asset-operations${
      queryString ? `?${queryString}` : ""
    }`;

    return this.makeRequest<AssetOperation[]>(endpoint);
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<ExtendedApiResponse<MarketStats>> {
    return this.makeRequest<MarketStats>("/api/v1/health");
  }

  /**
   * Convenience method to create a buy order
   */
  async createBuyOrder(
    marketName: string,
    amount: string,
    price: string,
    options: {
      postOnly?: boolean;
      previousOrderId?: number;
      externalId?: string;
      timeInForce?: TimeInForce;
    } = {}
  ): Promise<ExtendedApiResponse<PlacedOrder>> {
    return this.createOrder({
      market_name: marketName,
      amount,
      price,
      side: OrderSide.BUY,
      ...options,
    });
  }

   /**
   * Get order by ID
   * @param orderId - The ID of the order to get
   * @returns The order
   */
   async getOrderById(orderId: number): Promise<ExtendedApiResponse<OpenOrder>> {
    return this.makeRequest<OpenOrder>(`/api/v1/orderId/${orderId}`);
  }

  /**
   * Convenience method to create a sell order
   */
  async createSellOrder(
    marketName: string,
    amount: string,
    price: string,
    options: {
      postOnly?: boolean;
      previousOrderId?: number;
      externalId?: string;
      timeInForce?: TimeInForce;
    } = {}
  ): Promise<ExtendedApiResponse<PlacedOrder>> {
    return this.createOrder({
      market_name: marketName,
      amount,
      price,
      side: OrderSide.SELL,
      ...options,
    });
  }

  /**
   * Get positions for a specific market
   */
  async getPositionsForMarket(
    marketName: string
  ): Promise<ExtendedApiResponse<Position[]>> {
    return this.getPositions(marketName);
  }

  /**
   * Get open orders for a specific market
   */
  async getOpenOrdersForMarket(
    marketName: string
  ): Promise<ExtendedApiResponse<OpenOrder[]>> {
    return this.getOpenOrders(marketName);
  }

  /**
   * Cancel order by ID (convenience method)
   */
  async cancelOrderById(orderId: number): Promise<ExtendedApiResponse<{}>> {
    return this.cancelOrder({ order_id: orderId });
  }
  
  /**
   * Get order history for a specific market
   * @param marketName - The name of the market to get order history for
   * @returns The order history for the specified market
   */
  async getOrderHistory(marketName: string): Promise<ExtendedApiResponse<OpenOrder[]>> {
    return this.makeRequest<OpenOrder[]>(`/api/v1/marketOrders/${marketName}`);
  }

  /**
   * Withdraw USDC (convenience method)
   * Returns data as number | string to preserve precision for large integers
   */
  async withdrawUSDC(amount: string): Promise<ExtendedApiResponse<number | string>> {
    return this.withdraw({ amount, asset: "USDC" });
  }

  /**
   * Get funding rates for a specific market
   * @param marketName - The name of the market to get funding rates for
   * @returns The funding rates for the specified market
   */
  async getFundingRates(
    marketName: string,
    side: string,
    startTime: number,
    endTime?: number,
     // in epoch  milliseconds
  ): Promise<ExtendedApiResponse<FundingRate[]>> {
    const endTimeParam = endTime !== undefined ? `&end_time=${endTime}` : '';
    const startTimeParam = startTime !== undefined ? `&start_time=${startTime}` : '';
    return this.makeRequest<FundingRate[]>(
      `/api/v1/markets/funding-rates?market_name=${encodeURIComponent(
        marketName
      )}&side=${encodeURIComponent(side)}${startTimeParam}${endTimeParam}`
    );
  }

}

export default ExtendedWrapper;

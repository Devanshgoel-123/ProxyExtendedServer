/**
 * Extended Exchange TypeScript SDK
 *
 * A comprehensive TypeScript wrapper for the Extended Exchange trading API.
 * Provides type-safe access to all trading operations including orders, positions,
 * balances, markets, and asset operations.
 *
 * @example
 * ```typescript
 * import { ExtendedWrapper } from './ts';
 *
 * const client = new ExtendedWrapper({
 *   baseUrl: 'http://localhost:8000',
 *   apiKey: 'your-api-key'
 * });
 *
 * // Create a buy order
 * const order = await client.createBuyOrder('BTC-USD', '0.1', '50000');
 *
 * // Get positions
 * const positions = await client.getPositions();
 *
 * // Get balance
 * const balance = await client.getHoldings();
 * ```
 */

export { ExtendedWrapper } from "./wrapper";
export { default } from "./wrapper";

// Export all types
export * from "./types";

// Re-export commonly used types for convenience
export type {
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
} from "./types";

// Re-export enums for convenience
export {
  OrderSide,
  TimeInForce,
  OrderType,
  OrderStatus,
  OrderStatusReason,
  PositionSide,
  ExitType,
  AssetOperationType,
  AssetOperationStatus,
} from "./types";

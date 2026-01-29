/**
 * TypeScript type definitions for Extended Exchange API
 * Based on Python SDK models from x10.perpetual
 */

// Enums
export enum OrderSide {
  BUY = "BUY",
  SELL = "SELL",
}

export enum TimeInForce {
  GTT = "GTT",
  IOC = "IOC",
  FOK = "FOK",
}

export enum OrderType {
  LIMIT = "LIMIT",
  CONDITIONAL = "CONDITIONAL",
  MARKET = "MARKET",
  TPSL = "TPSL",
}

export enum OrderStatus {
  UNKNOWN = "UNKNOWN",
  NEW = "NEW",
  UNTRIGGERED = "UNTRIGGERED",
  PARTIALLY_FILLED = "PARTIALLY_FILLED",
  FILLED = "FILLED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  REJECTED = "REJECTED",
}

export enum OrderStatusReason {
  UNKNOWN = "UNKNOWN",
  NONE = "NONE",
  UNKNOWN_MARKET = "UNKNOWN_MARKET",
  DISABLED_MARKET = "DISABLED_MARKET",
  NOT_ENOUGH_FUNDS = "NOT_ENOUGH_FUNDS",
  NO_LIQUIDITY = "NO_LIQUIDITY",
  INVALID_FEE = "INVALID_FEE",
  INVALID_QTY = "INVALID_QTY",
  INVALID_PRICE = "INVALID_PRICE",
  INVALID_VALUE = "INVALID_VALUE",
  UNKNOWN_ACCOUNT = "UNKNOWN_ACCOUNT",
  SELF_TRADE_PROTECTION = "SELF_TRADE_PROTECTION",
  POST_ONLY_FAILED = "POST_ONLY_FAILED",
  REDUCE_ONLY_FAILED = "REDUCE_ONLY_FAILED",
  INVALID_EXPIRE_TIME = "INVALID_EXPIRE_TIME",
  POSITION_TPSL_CONFLICT = "POSITION_TPSL_CONFLICT",
  INVALID_LEVERAGE = "INVALID_LEVERAGE",
  PREV_ORDER_NOT_FOUND = "PREV_ORDER_NOT_FOUND",
  PREV_ORDER_TRIGGERED = "PREV_ORDER_TRIGGERED",
  TPSL_OTHER_SIDE_FILLED = "TPSL_OTHER_SIDE_FILLED",
  PREV_ORDER_CONFLICT = "PREV_ORDER_CONFLICT",
  ORDER_REPLACED = "ORDER_REPLACED",
  POST_ONLY_MODE = "POST_ONLY_MODE",
  REDUCE_ONLY_MODE = "REDUCE_ONLY_MODE",
  TRADING_OFF_MODE = "TRADING_OFF_MODE",
}

export enum PositionSide {
  LONG = "LONG",
  SHORT = "SHORT",
}

export enum ExitType {
  TRADE = "TRADE",
  LIQUIDATION = "LIQUIDATION",
  ADL = "ADL",
}

export enum AssetOperationType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  TRANSFER = "TRANSFER",
}

export enum AssetOperationStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// Base types
export interface SettlementSignature {
  r: string;
  s: string;
}

export interface StarkSettlement {
  signature: SettlementSignature;
  stark_key: string;
  collateral_position: string;
}

export interface StarkDebuggingOrderAmounts {
  collateral_amount: string;
  fee_amount: string;
  synthetic_amount: string;
}

// Order types
export interface PlacedOrder {
  id: number;
  external_id: string;
}

export interface OpenOrder {
  id: number;
  account_id: number;
  external_id: string;
  market: string;
  type: OrderType;
  side: OrderSide;
  status: OrderStatus;
  status_reason?: OrderStatusReason;
  price: string;
  average_price?: string;
  qty: string;
  filled_qty?: string;
  reduce_only: boolean;
  post_only: boolean;
  payed_fee?: string;
  created_time: number;
  updated_time: number;
  expiry_time?: number;
}

// Position types
export interface Position {
  id: number;
  accountId: number;
  market: string;
  side: PositionSide;
  leverage: string;
  size: string;
  value: string;
  openPrice: string;
  markPrice: string;
  liquidationPrice?: string;
  unrealisedPnl: string;
  realisedPnl: string;
  tpPrice?: string;
  slPrice?: string;
  adl?: number;
  createdAt: number;
  updatedAt: number;
}

export interface PositionHistory {
  id: number;
  account_id: number;
  market: string;
  side: PositionSide;
  leverage: string;
  size: string;
  open_price: string;
  exit_type?: ExitType;
  exit_price?: string;
  realised_pnl: string;
  created_time: number;
  closed_time?: number;
}

// Balance types
export interface Balance {
  collateral_name: string;
  balance: string;
  equity: string;
  availableForTrade: string;
  availableForWithdrawal: string;
  unrealisedPnl: string;
  initialMargin: string;
  marginRatio: string;
  updatedTime: number;
}

// Market types
export interface RiskFactorConfig {
  upper_bound: string;
  risk_factor: string;
}

export interface MarketStats {
  daily_volume: string;
  daily_volume_base: string;
  daily_price_change: string;
  daily_low: string;
  daily_high: string;
  last_price: string;
  ask_price: string;
  bid_price: string;
  mark_price: string;
  index_price: string;
  funding_rate: string;
  next_funding_rate: number;
  open_interest: string;
  open_interest_base: string;
}

export interface TradingConfig {
  min_order_size: string;
  min_order_size_change: string;
  min_price_change: string;
  max_market_order_value: string;
  max_limit_order_value: string;
  max_position_value: string;
  max_leverage: string;
  max_num_orders: number;
  limit_price_cap: string;
  limit_price_floor: string;
  risk_factor_config: RiskFactorConfig[];
}

export interface L2Config {
  type: string;
  collateral_id: string;
  collateral_resolution: number;
  synthetic_id: string;
  synthetic_resolution: number;
}

export interface Market {
  name: string;
  asset_name: string;
  asset_precision: number;
  collateral_asset_name: string;
  collateral_asset_precision: number;
  active: boolean;
  market_stats: MarketStats;
  trading_config: TradingConfig;
  l2_config: L2Config;
}

// Asset operation types
export interface AssetOperation {
  id: string;
  type: AssetOperationType;
  status: AssetOperationStatus;
  amount: string;
  asset: string;
  created_time: number;
  updated_time: number;
  description?: string;
  transactionHash?:string;
}

// Request types
export interface CreateOrderRequest {
  market_name: string;
  amount: string;
  price: string;
  side: OrderSide;
  post_only?: boolean;
  previous_order_id?: number;
  external_id?: string;
  time_in_force?: TimeInForce;
}

export interface WithdrawRequest {
  amount: string;
  asset?: string;
}

export interface SignedWithdrawRequest {
  recipient: string;
  position_id: number;
  amount: number;
  expiration: number;
  salt: number;
}

export interface CancelOrderRequest {
  order_id: number;
}

// Response wrapper type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Extended API response wrapper (matches Python WrappedApiResponse)
export interface ExtendedApiResponse<T> {
  status: 'OK' | 'ERROR';
  message: string;
  data: T;
}

// Configuration types
export interface ExtendedWrapperConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

export interface UpdateLeverageRequest {
  leverage: string;
  market: string;
}

export interface FundingRate {
 m: string;
 f:string;
 t:number;
}
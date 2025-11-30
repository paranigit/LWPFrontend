// Enums
export enum CurrencyCode {
    INR = 'INR',
    USD = 'USD',
}

export enum AssetType {
    STOCK = 'STOCK',
    ETF = 'ETF',
    BOND = 'BOND',
    MUTUAL_FUND = 'MUTUAL_FUND',
}

export enum UserRole {
    RECOMMENDATION_ONLY = 'RECOMMENDATION_ONLY',
    VIEWER = 'VIEWER',
    ADMIN = 'ADMIN',
}

export enum RecommendationType {
    BUY = 'BUY',
    SELL = 'SELL',
    HOLD = 'HOLD',
}

export enum CallType {
    BUY = 'BUY',
    SELL = 'SELL',
}

export enum RecommendationStrategy {
    VALUE_INVESTING = 'VALUE_INVESTING',
    GROWTH_INVESTING = 'GROWTH_INVESTING',
    DIVIDEND_YIELD = 'DIVIDEND_YIELD',
    MOMENTUM = 'MOMENTUM',
    TECHNICAL_ANALYSIS = 'TECHNICAL_ANALYSIS',
    MARKET_CAP = 'MARKET_CAP',
}

export enum AccountPlatform {
    ZERODHA = 'ZERODHA',
    AIONION = 'AIONION',
    CHOLA_SECURITIES = 'CHOLA_SECURITIES',
    FIDELITY = 'FIDELITY',
}

// User types
export interface User {
    id: number;
    email: string;
    name?: string;
    is_active: boolean;
    is_admin: boolean;  // Kept for backwards compatibility
    role: UserRole;
    created_at: string;
}

export interface AllowedEmail {
    email: string;
    is_admin: boolean;  // Kept for backwards compatibility
    role: UserRole;
    created_at: string;
}

export interface AllowedEmailCreate {
    email: string;
    is_admin: boolean;  // Kept for backwards compatibility
    role?: UserRole;
}

// Stock and ETF types
export interface StockSymbol {
    symbol: string;
    name?: string;
    currency: CurrencyCode;
    exchange?: string;
    asset_type: AssetType;
    sector_industry?: string;
    is_active: boolean;
    price_last_close?: number;
    price_52w_low?: number;
    price_52w_high?: number;
    eps?: number;
    pe_ratio?: number;
    peg_index?: number;
    pegy_index?: number;
    dividend_yield?: number;
    earnings_growth?: number;
    rsi_index?: number;
    price_ma_20d?: number;
    price_ma_200d?: number;
    created_at: string;
}

export interface StockSymbolCreate {
    symbol: string;
    name?: string;
    currency: CurrencyCode;
    exchange?: string;
    industry_id?: number;
}

export interface ETFSymbol {
    symbol: string;
    name?: string;
    currency: CurrencyCode;
    exchange?: string;
    industry_id?: number;
    is_active: boolean;
    created_at: string;
}

export interface ETFSymbolCreate {
    symbol: string;
    name?: string;
    currency: CurrencyCode;
    exchange?: string;
    industry_id?: number;
}

// Bond types
export interface Bond {
    isin: string;
    name: string;
    currency: CurrencyCode;
    face_value?: number;
    coupon_rate?: number;
    maturity_date?: string;
    sector_industry?: string;
    is_active: boolean;
    created_at: string;
}

export interface BondCreate {
    name: string;
    isin: string;
    currency: CurrencyCode;
    face_value?: number;
    coupon_rate?: number;
    maturity_date?: string;
    industry_id?: number;
}

// Mutual Fund types
export interface MutualFund {
    isin: string;
    name: string;
    currency: CurrencyCode;
    fund_house?: string;
    sector_industry?: string;
    is_active: boolean;
    created_at: string;
}

export interface MutualFundCreate {
    name: string;
    isin: string;
    currency: CurrencyCode;
    fund_house?: string;
    industry_id?: number;
}

// Holding types
export interface Holding {
    id: number;
    user_id: number;
    asset_type: AssetType;
    stock_symbol?: string;
    etf_symbol?: string;
    bond_isin?: string;
    mutual_fund_isin?: string;
    quantity: number;
    average_price: number;
    currency: CurrencyCode;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface HoldingCreate {
    asset_type: AssetType;
    stock_symbol_id?: string;
    etf_symbol_id?: string;
    bond_id?: string;
    mutual_fund_id?: string;
    quantity: number;
    average_price: number;
    currency: CurrencyCode;
    notes?: string;
}

export interface HoldingUpdate {
    quantity?: number;
    average_price?: number;
    notes?: string;
}

export interface HoldingWithDetails extends Holding {
    symbol?: string;
    name?: string;
    current_price?: number;
    total_value?: number;
    profit_loss?: number;
    profit_loss_percentage?: number;
}

// Price History types
export interface PriceHistory {
    id: number;
    stock_symbol_id?: string;
    etf_symbol_id?: string;
    date: string;
    close_price: number;
    high_price?: number;
    low_price?: number;
    ma_20?: number;
    ma_200?: number;
    volume?: number;
    pe_ratio?: number;
    growth_ratio?: number;
    dividend_yield?: number;
    created_at: string;
}

// Market data types
export interface CurrentPrice {
    symbol: string;
    price: number;
    currency: CurrencyCode;
    timestamp: string;
}

export interface ExchangeRate {
    from_currency: CurrencyCode;
    to_currency: CurrencyCode;
    rate: number;
    timestamp: string;
}

// Dashboard types
export interface AssetSummary {
    asset_type: AssetType;
    total_investment: number;
    current_value: number;
    profit_loss: number;
    profit_loss_percentage: number;
    count: number;
}

export interface DashboardSummary {
    total_investment: number;
    current_value: number;
    total_profit_loss: number;
    total_profit_loss_percentage: number;
    asset_summaries: AssetSummary[];
    currency: CurrencyCode;
}

// Recommendation types
export interface Recommendation {
    symbol: string;  // Primary key
    exchange: string;
    currency: 'INR' | 'USD';
    asset_type: 'STOCK' | 'ETF' | 'BOND' | 'MUTUAL_FUND';
    recommendation_type: 'BUY' | 'SELL' | 'HOLD';
    strategy: string;  // Custom strategy name
    target_price: number;
    confidence_score: number;  // 0-100
    reasoning: string;
    created_at: string;  // ISO date string
    expires_at?: string | null;  // ISO date string
    is_active: boolean;
}

export interface RecommendationFilters {
    asset_type?: string;
    recommendation_type?: string;
    strategy?: string;
    min_confidence?: number;
    currency?: string;
}

export interface RecommendationStats {
    total_active: number;
    by_type: Record<string, number>;
    by_asset_type: Record<string, number>;
    avg_confidence: number;
    top_strategies: Array<{ name: string; count: number }>;
}

// Auth types
export interface Token {
    access_token: string;
    token_type: string;
}

export interface GoogleAuthRequest {
    token: string;
}

// Industry types
export interface Industry {
    id: number;
    sector: string;
    industry: string;
    is_active: boolean;
    created_at: string;
}

export interface IndustryCreate {
    sector: string;
    industry: string;
}

export interface IndustryUpdate {
    sector?: string;
    industry?: string;
}

// Strategy types
export interface FormulaCriteria {
    criteria_name: string;
    weight: number;
}

export interface Strategy {
    id: number;
    name: string;
    description: string;
    call_type: CallType;
    formula: FormulaCriteria[];
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export interface StrategyCreate {
    name: string;
    description: string;
    call_type: CallType;
    formula: FormulaCriteria[];
    is_active?: boolean;
}

export interface StrategyUpdate {
    name?: string;
    description?: string;
    call_type?: CallType;
    formula?: FormulaCriteria[];
}

export interface HoldingAccount {
    account_id: string;
    user_id: number;
    user_email?: string;
    user_name?: string;
    account_platform: AccountPlatform;
    currency: CurrencyCode;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface HoldingAccountCreate {
    account_id: string;
    account_platform: AccountPlatform;
    currency: CurrencyCode;
}

export interface HoldingAccountUpdate {
    account_platform?: AccountPlatform;
    currency?: CurrencyCode;
    is_active?: boolean;
}
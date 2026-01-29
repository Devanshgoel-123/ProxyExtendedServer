import ExtendedWrapper, { OpenOrder, Position } from "../ExtendedWrapperSDk"
import { ApiResponse } from "../utils/types"
import { FundingRate } from "../ExtendedWrapperSDk";


/**
 * Get positions for a specific market or all markets
 * @param extendedWrapper - The extended wrapper instance
 * @param marketNames - The names of the markets to get positions for (optional)
 * @returns The positions for the specified market or all markets
 */
export const getPositions = async (extendedWrapper: ExtendedWrapper, marketNames?: string):Promise<ApiResponse<Position[]>> => {
    try{
        const response = await extendedWrapper.getPositions(marketNames);
        const positions = response.data;
        return {
            success: true,
            message: "Positions fetched successfully",
            data: positions
        }
    }catch(err){
        console.error("Error getting positions", err);
        return {
            success: false,
            message: "Error getting positions",
            data: []
        }
    }
}

/**
 * 
 * @param extendedWrapper - The extended wrapper instance
 * @param marketName - The name of the market to get funding rate history for
 * @param fromTime - The time to get funding rate history from (in epoch milliseconds)
 * @returns The funding rate history for the specified market
 */
export const getFundingRateHistory = async (extendedWrapper: ExtendedWrapper, marketName: string, startTime: number, endTime?: number):Promise<ApiResponse<FundingRate[]>> => {
    try{
        const response = await extendedWrapper.getFundingRates(marketName, "BUY", startTime, endTime);
        const fundingRateHistory = response.data;
        return {
            success: true,
            message: "Funding rate history fetched successfully",
            data: fundingRateHistory
        }
    }
    catch(err){
        console.error("Error getting funding rate history", err);
        return {
            success: false,
            message: "Error getting funding rate history",
            data: []
        }
    }
}

/**
 * Order history for a specific market and an account
 * @param extendedWrapper - The extended wrapper instance
 * @param marketName - The name of the market to get order history for
 * @returns The order history for the specified market
 * @returns 
 */
export const getOrderHistory = async (extendedWrapper: ExtendedWrapper, marketName: string):Promise<ApiResponse<OpenOrder[]>> => {
    try{
        const response = await extendedWrapper.getOrderHistory(marketName);
        const orderHistory = response.data;
        return {
            success: true,
            message: "Order history fetched successfully",
            data: orderHistory
        }
    }catch(err){
        console.error("Error getting order history", err);
        return {
            success: false,
            message: "Error getting order history",
            data: []
        }
    }
}
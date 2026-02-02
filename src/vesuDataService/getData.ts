import axios from "axios";
import {  
  VesuAdapterConfig, 
  getMainnetConfig, 
  ContractAddr, 
  Web3Number,
} from "@strkfarm/sdk";
import {vesu_abi as VesuSingletonAbi} from "../data/vesu-singleton.abi.js";
import { Contract } from "starknet";

export const getBlockNumber = async (timeStamp: number) => {
    try{
        const response = await axios.get(`https://client-v2-five.vercel.app/api/block/${timeStamp}`);
        return response.data;
    }catch(err){
        console.error("Error getting block number", err);
        return {
            success: false,
            message: "Error getting block number",
            data: 0
        }
    }
}

function getVesuSingletonAddress(poolId: ContractAddr): { addr: ContractAddr, isV2: boolean } {
  const VESU_SINGLETON = ContractAddr.from('0x2545b2e5d519fc230e9cd781046d3a64e092114f07e44771e0d719d148725ef');
  const VESU_V2_SINGLETON = ContractAddr.from('0x04E09C6F0D5e09f1651320F37e333CC94060c5c2aDad7B7fcE97a2B43Ff6F1D5');
  
  // Check if pool is V2 based on pool ID
  const isV2 = !poolId.eq(ContractAddr.from('0'));
  const addr = isV2 ? VESU_V2_SINGLETON : VESU_SINGLETON;
  
  return { addr, isV2 };
}

export const readPositionFromVesu = async (
  config: VesuAdapterConfig, 
  blockNumber: number
) => {
   try{
    const networkConfig = getMainnetConfig();
    const { addr, isV2 } = getVesuSingletonAddress(config.poolId);
    
    const contract = new Contract(
      VesuSingletonAbi,
      addr.address,
     networkConfig.provider as any
    );

    const output: any = await contract.call(
      isV2 ? 'position' : 'position_unsafe', 
      [
        ...(isV2 ? [] : [config.poolId.address]), // exclude pool id in v2
        config.collateral.address.address,
        config.debt.address.address,
        config.vaultAllocator.address
      ], 
      { blockIdentifier: blockNumber }
    );

    const collateralAmount = Web3Number.fromWei(output['1'].toString(), config.collateral.decimals);
    const debtAmount = Web3Number.fromWei(output['2'].toString(), config.debt.decimals);
    
    return {
        success: true,
        message: "Position read successfully",
        data: {
            collateral: collateralAmount.toFixed(6),
            debt: debtAmount.toFixed(6),
            blockNumber
        }
    }
   
   }catch(err){
    console.error("Error reading position from vesu", err);
    return {
        success: false,
        message: "Error reading position from vesu",
        data: null,
        error: err instanceof Error ? err.message : String(err)
    }
   }
}

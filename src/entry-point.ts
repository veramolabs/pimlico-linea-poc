import {
  EntryPoint__factory,
  UserOperationStruct
} from "@account-abstraction/contracts"
import { StaticJsonRpcProvider } from "@ethersproject/providers"
import { getAddress } from "@ethersproject/address"
import { hexlify } from '@ethersproject/bytes'

export const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
export const lineaProvider = new StaticJsonRpcProvider("https://rpc.goerli.linea.build/")
export const entryPoint = EntryPoint__factory.connect(ENTRY_POINT_ADDRESS, lineaProvider)

export const calculateSenderAddress = async (initCode: string) => {
  const senderAddress = await entryPoint.callStatic
    .getSenderAddress(initCode)
    .then(() => {
      throw new Error("Expected getSenderAddress() to revert")
    })
    .catch((e) => {
      const data = e.message.match(/0x6ca7b806([a-fA-F\d]*)/)?.[1]
      if (!data) {
        return Promise.reject(new Error("Failed to parse revert data"))
      }
      const addr = getAddress(`0x${data.slice(24, 64)}`)
      return Promise.resolve(addr)
    })
 
  return senderAddress
}

export const generateUserOperation = async (sender: string, nonce: number, initCode: string, callData: string): Promise<UserOperationStruct> => {
  const gasPrice = await lineaProvider.getGasPrice()
 
  const userOperation = {
    sender,
    nonce: hexlify(nonce),
    initCode,
    callData,
    callGasLimit: hexlify(100_000), // hardcode it for now at a high value
    verificationGasLimit: hexlify(400_000), // hardcode it for now at a high value
    preVerificationGas: hexlify(50_000), // hardcode it for now at a high value
    maxFeePerGas: hexlify(gasPrice),
    maxPriorityFeePerGas: hexlify(gasPrice),
    paymasterAndData: "0x",
    signature: "0x"
  }

  return userOperation
}
import type { BytesLike } from "@ethersproject/bytes";
import { StaticJsonRpcProvider } from "@ethersproject/providers"
import { ENTRY_POINT_ADDRESS } from "./entry-point.js"
import { UserOperationStruct } from "@account-abstraction/contracts"

const pimlicoEndpoint = `https://api.pimlico.io/v1/linea-testnet/rpc?apikey=${process.env.PIMLICO_API_KEY}`

export const pimlicoProvider = new StaticJsonRpcProvider(pimlicoEndpoint)

export const sponsorUserOperation = async (userOperation: UserOperationStruct): Promise<{paymasterAndData: BytesLike}> => {

  const result = await pimlicoProvider.send("pm_sponsorUserOperation", [
    userOperation,
    {
      entryPoint: ENTRY_POINT_ADDRESS
    }
  ])

  return result
}

export const sendUserOperation = async (userOperation: UserOperationStruct): Promise<string> => {
  return await pimlicoProvider.send("eth_sendUserOperation", [userOperation, ENTRY_POINT_ADDRESS])
}

export const waitForReceipts = async (userOperationHash: string) => {
  // let's also wait for the userOperation to be included, by continually querying for the receipts
  console.log("Querying for receipts...")
  let receipt = null
  while (receipt === null) {
    receipt = await pimlicoProvider.send("eth_getUserOperationReceipt", [userOperationHash])
    console.log(
      receipt === null ? "Receipt not found..." : `Receipt found!\UserOperation included: https://explorer.goerli.linea.build/tx/${receipt.receipt.transactionHash}`
    )
  }
  return true
}
import {
  SimpleAccountFactory__factory,
  SimpleAccount__factory,
} from "@account-abstraction/contracts"
import { hexConcat } from '@ethersproject/bytes'
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'

const SIMPLE_ACCOUNT_FACTORY_ADDRESS = "0x9406Cc6185a346906296840746125a0E44976454"

export const generateInitCode = (ownerAddress: string, userAccountAlias: string) => {
  const salt = keccak256(toUtf8Bytes(userAccountAlias))
  const simpleAccountFactory = new SimpleAccountFactory__factory()
  const initCode = hexConcat([
    SIMPLE_ACCOUNT_FACTORY_ADDRESS,
    simpleAccountFactory.interface.encodeFunctionData("createAccount", [ownerAddress, salt])
  ])
 
  return initCode
}

export const generateExecuteCallData = (contractAddress: string, data: string) => {
  const simpleAccount = new SimpleAccount__factory()
  const executeCallData = simpleAccount.interface.encodeFunctionData("execute", [
    contractAddress,
    0,
    data
  ])
 
  return executeCallData
}
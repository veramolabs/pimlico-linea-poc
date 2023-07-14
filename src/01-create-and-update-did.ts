import { Wallet } from "@ethersproject/wallet"
import { arrayify } from "@ethersproject/bytes"
import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'
import { generateExecuteCallData, generateInitCode } from './simple-account.js'
import { calculateSenderAddress, generateUserOperation, entryPoint } from "./entry-point.js"
import { getAddServiceCallData, getRegistryDeploymentConfig } from './eth-did-utils.js'
import { sendUserOperation, sponsorUserOperation, waitForReceipts } from './pimlico.js'

if (!process.env.OWNER_PRIVATE_KEY) throw new Error("Please set OWNER_PRIVATE_KEY in .env file")
if (!process.env.PIMLICO_API_KEY) throw new Error("Please set PIMLICO_API_KEY in .env file")
if (!process.env.INFURA_PROJECT_ID) throw new Error("Please set INFURA_PROJECT_ID in .env file")

const ethrDidResolver = getResolver({infuraProjectId: process.env.INFURA_PROJECT_ID})
const didResolver = new Resolver(ethrDidResolver)

const ownerWallet = new Wallet(process.env.OWNER_PRIVATE_KEY)  
console.log('Owner wallet privatekey: ' + ownerWallet.privateKey)
console.log('Owner wallet address: ' + ownerWallet.address)

const simpleAccountInitCode = generateInitCode(ownerWallet.address, 'carol')
const senderAddress = await calculateSenderAddress(simpleAccountInitCode)
console.log('User wallet address: ' + senderAddress)

const addServiceCallData = getAddServiceCallData(
  senderAddress,
  'DIDCommMessaging',
  'https://example2.com/endpoint'
)

const registryDeploymentConfig = getRegistryDeploymentConfig('linea:goerli')
const executeCallData = generateExecuteCallData(registryDeploymentConfig.registry, addServiceCallData)

const userOperation = await generateUserOperation(senderAddress, 0,  simpleAccountInitCode, executeCallData)

const sponsorUserOperationResult = await sponsorUserOperation(userOperation)

userOperation.paymasterAndData = sponsorUserOperationResult.paymasterAndData

const signature = await ownerWallet.signMessage(arrayify(await entryPoint.getUserOpHash(userOperation)))

userOperation.signature = signature

const userOperationHash = await sendUserOperation(userOperation)

await waitForReceipts(userOperationHash)

const doc = await didResolver.resolve('did:ethr:linea:goerli:' + senderAddress)
console.log('DID Document:')
console.log(JSON.stringify(doc, null, 2))
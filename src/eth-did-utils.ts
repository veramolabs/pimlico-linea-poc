import { EthereumDIDRegistry, deployments } from "ethr-did-resolver"
import { ContractFactory } from '@ethersproject/contracts'

function stringToBytes32(str: string) {
  const buffStr = '0x' + Buffer.from(str).slice(0, 32).toString('hex')
  return buffStr + '0'.repeat(66 - buffStr.length)
}

export function getRegistryDeploymentConfig(network: string) {
  const config = deployments.find((d) => d.name === network)
  if (!config) throw new Error("No config found for " + network)
  return config
}

function getContract() {
  const config = getRegistryDeploymentConfig('linea:goerli')
  const contract = ContractFactory.fromSolidity(EthereumDIDRegistry)
    .attach(config.registry)
  return contract
}

export function getAddServiceCallData(address: string, serviceType: string, serviceEndpoint: string, ttl: number = 86400) {
  const contract = getContract()
  const callData = contract.interface.encodeFunctionData("setAttribute", [
    address,
    stringToBytes32("did/svc/" + serviceType),
    '0x' + Buffer.from(serviceEndpoint, 'utf-8').toString('hex'),
    ttl
  ])
  return callData
}

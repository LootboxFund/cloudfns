// Much of this file is duplicated from helpers
// Since we cant use private packages, we are resorting to this 
// hacky bullshit for now

export type ChainIDHex = string
export type Url = string
export type ChainIDDecimal = string
export type SemanticVersion = string
export type ExternalAddress = string & { readonly _: unique symbol }
export type ContractAddress = string & { readonly _: unique symbol }  
export type Address = ExternalAddress | ContractAddress
export type ABIUtilRepresenation = {
    abi: string
    keys: string[]
}
export type ABIGenericInterface = any
export interface ITicketMetadata {
    address: ContractAddress
    name: string | undefined
    description: string | undefined
    image: Url | undefined
    backgroundColor: string | undefined
    backgroundImage: Url | undefined
    badgeImage: Url | undefined
    lootbox?: {
      address: ContractAddress
      chainIdHex: ChainIDHex
      chainIdDecimal: ChainIDDecimal
      chainName: string
      targetPaybackDate: number  // Unix timestamp (new Date().valueOf())
      createdAt: number  // Unix timestamp (new Date().valueOf())
      fundraisingTarget: string
      fundraisingTargetMax: string
      basisPointsReturnTarget: string
      returnAmountTarget: string
      pricePerShare: string
      lootboxThemeColor: string
      transactionHash: string
      blockNumber: string
    }
    socials?: {
      twitter: string
      email: string
      instagram: string
      tiktok: string
      facebook: string
      discord: string
      youtube: string
      snapchat: string
      twitch: string
      web: string
    }
  }
import { CardanoNetwork } from "./api";

export interface Config {
  network: CardanoNetwork;
  btcWrapAddress: string;
  btcMultisigAddress: string;
  btcWrapCommunityAddress: string;
  btcUnwrapAddress: string;
  wrapFeeBtc: number;
  unwrapFeeBtc: number;
  unwrapFeeCardano: number;
  cbtcAssetId: string;
  cnetaAssetId: string;
}

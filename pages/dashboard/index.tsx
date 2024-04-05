import { useContext, useEffect, useState } from "react";
import ChartComponent from "../../components/dashboard/ChartComponent";
import useAssetsApi from "../../hooks/useAssetsApi";
import useDashboard from "../../hooks/useDashboard";
import styles from "../../styles/dashboard.module.scss";
import { numberFormat, numberToFixed } from "../../utils/format";
import { GlobalContext } from "../../components/GlobalContext";
import Link from "next/link";
import useCardanoWallet from "../../hooks/useCardanoWallet";
import useLucid from "../../hooks/useLucid";
import ConnectWallet from "../../components/partials/navbar/ConnectWallet";
import Head from "next/head";
import ChartWidget from "../../components/dashboard/ChartWidget";
import Widget from "../../components/dashboard/Widget";
import useWindowSize from "../../hooks/useResponsive";
import useStake from "../../hooks/useStake";
import useConvertPrice from "../../hooks/useConvertPrice";

export default function Dashboard() {
  const cNetaAmount = 120600000;
  const adaAmount = 200402;
  const cBtcAmount = 1.5023;
  const ergAmount = 56391;

  const {
    usdBtcPrice,
    usdcBtcPrice,
    adaBtcPrice,
    adacBtcPrice,
    dailyChangeBtcPrice,
    formattedDate,
    tvlData,
    adaFundPrice,
    usdFundPrice,
    protocolVolume,
    communityRevenue,
    adaFund,
    usdAda,
    cBtcAda,
  } = useDashboard();

  const { stakingInfo } = useStake();

  const { usdCNeta, usdErg } = useConvertPrice();

  const { width } = useWindowSize();
  const isMobile = width <= 550;

  const { data, loading } = useAssetsApi();

  const { walletMeta, address, walletAddress } = useCardanoWallet();
  const { getUtxos } = useLucid();
  const [isWalletShowing, setIsWalletShowing] = useState(false);

  const { config } = useContext(GlobalContext);
  let linkcBtc = "";
  let vaultBtc = "";
  let communityVaultBtc = "";

  if (config.network === "Mainnet") {
    linkcBtc = `https://cardanoscan.io/token/${config.cbtcAssetId}`;
    vaultBtc = `https://mempool.space/address/${config.btcWrapAddress}`;
    communityVaultBtc = `https://mempool.space/address/${config.btcWrapCommunityAddress}`;
  } else {
    linkcBtc = `https://preprod.cardanoscan.io/token/${config.cbtcAssetId}`;
    vaultBtc = `https://mempool.space/testnet/address/${config.btcWrapAddress}`;
    communityVaultBtc = `https://mempool.space/testnet/address/${config.btcWrapCommunityAddress}`;
  }

  const getBalance = async () => {
    const utxos = await getUtxos();

    let sumBalanceCBTC = 0;
    let sumBalanceCNETA = 0;

    sumBalanceCBTC = utxos.reduce((total, utxo) => {
      const amountForUnit = Number(utxo.assets[config.cbtcAssetId]) ?? 0;

      if (amountForUnit) {
        const quantity = Number(amountForUnit);
        total += quantity;
      }
      return total;
    }, 0);

    sumBalanceCNETA = utxos.reduce((total, utxo) => {
      const amountForUnit = Number(utxo.assets[config.cnetaAssetId]) ?? 0;

      if (amountForUnit) {
        const quantity = Number(amountForUnit);
        total += quantity;
      }
      return total;
    }, 0);
  };

  useEffect(() => {
    if (address !== "") {
      getBalance();
    }
    console.log(address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <>
      <Head>
        <title>Dashboard | anetaBTC</title>
      </Head>
      <section className={styles.dashboardContainer}>
        <div className={styles.chartTvl}>
          <div className={styles.headerChart}>
            <div className={styles.valuesGroup}>
              <h2 className={styles.titleChart}>TVL</h2>
              <div className={styles.tokenChart}>
                <svg width="32" height="32" id="icon">
                  <use href="/images/crypto/cbtc-logo.svg#Layer_1"></use>
                </svg>
                {loading ? (
                  <div className={styles.value}>
                    <div className={styles.loader}></div>
                  </div>
                ) : (
                  data && (
                    <p className={styles.value}>
                      {numberToFixed(data.quantity)}
                    </p>
                  )
                )}
                <h3 className={styles.tokenTitle}>cBTC</h3>
              </div>
              <p>{formattedDate}</p>
            </div>
            <div className={styles.btnGroup}>
              <Link
                href={vaultBtc}
                className={styles.btnBtc}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.btnText}>View BTC Vaults</span>
                <svg width="12" height="12" id="icon" className={styles.icon}>
                  <use href="/images/icons/arrow-right.svg#icon"></use>
                </svg>
              </Link>
              <Link
                href={linkcBtc}
                className={styles.btncBtc}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.btnText}>View cBTC Token</span>
                <svg width="12" height="12" id="icon" className={styles.icon}>
                  <use href="/images/icons/arrow-right.svg#icon"></use>
                </svg>
              </Link>
            </div>
          </div>
          {tvlData ? (
            <ChartComponent data={tvlData} height={200} />
          ) : (
            <div className={styles.loaderChart}>
              <div className={styles.loader}></div>
            </div>
          )}
        </div>

        <ChartWidget
          title="Protocol Volume"
          value={protocolVolume ?? "loading"}
          token="BTC"
          data={tvlData}
          buttonTitle="Track"
          onButtonClick={vaultBtc}
        />
        {/* <ChartWidget
          title="Community Revenue"
          value={communityRevenue ?? "0"}
          token="cBTC"
          data={[]}
          buttonTitle="Track"
          onButtonClick={communityVaultBtc}
        /> */}
        <Widget
          title="Next Claiming Period"
          noPrice
          // currentDate="2024-03-12 21:45:00 UTC"
          timerInterval={5}
          timerStart="2024/01/15 21:45:00 UTC"
          // text="Coming Soon"
          headerButtonTitle={
            walletMeta && address && walletAddress !== "Connecting..."
              ? "Claim"
              : undefined
          }
          headerButtonClick="https://app.tosidrop.io/cardano/claim"
          colSpan
          colSpanSm
          noMargin={isMobile && !!walletMeta && !!address}
        />

        <Widget
          text={communityRevenue ? communityRevenue + " cBTC" : "loading"}
          title={`${isMobile ? "Community" : "Community"} Revenue`}
          buttonTitle="Track"
          buttonLink={
            "https://cexplorer.io/address/addr1qyxwxjg6637fw3zv5he7lxy0fmsssgk3f3dyxcg4zhumm2ur65qxyr79pkpgm225d3z3n53fwnqcfhdmv9xcemgns98qn52gr5/asset#data"
          }
          externalLink
          noPrice
          noMargin
        />
        <Widget
          dailyChangePrice={dailyChangeBtcPrice}
          adaPrice={adaBtcPrice}
          usdPrice={usdBtcPrice}
          token="BTC"
          icon={"/images/crypto/bitcoin-logo.svg#Layer_1"}
        />
        <Widget
          adaPrice={adaFundPrice}
          usdPrice={usdFundPrice}
          title="Community Fund"
        />
        <Widget
          title="Mint cBTC"
          buttonTitle="Mint"
          buttonLink="/"
          noPrice
          noHeaderPrice
          titleLg
        />
        <Widget
          noPrice
          noMargin
          title="Total cNETA Staked"
          // text="Coming Soon"
          text={
            walletMeta
              ? stakingInfo &&
                address &&
                walletAddress !== "Connecting..." &&
                usdCNeta
                ? (numberFormat(stakingInfo?.totalLiveStake.toString(), 8) ??
                    "0") + " cNETA"
                : "loading"
              : "0 cNETA"
          }
          miniText={
            walletMeta
              ? stakingInfo &&
                address &&
                walletAddress !== "Connecting..." &&
                usdCNeta
                ? "$" +
                    numberFormat(
                      (
                        stakingInfo?.totalLiveStake * Number(usdCNeta)
                      ).toString(),
                      2,
                      2
                    ) ?? "0.00"
                : "loading"
              : "$0.00"
          }
          title2={walletMeta ? "Your cNETA Staked" : undefined}
          title2Tooltip="Staked cNETA becomes active after 1 full epoch staked. If you stake during the 1st epoch, it becomes live in the 2nd epoch and rewards become available at the start of the 3rd epoch."
          text2={
            !walletMeta
              ? undefined
              : stakingInfo &&
                address &&
                walletAddress !== "Connecting..." &&
                usdCNeta
              ? stakingInfo.staking
                ? (numberFormat(stakingInfo?.liveStake.toString(), 8) ?? "0") +
                  " cNETA"
                : "0 cNETA"
              : "loading"
          }
          miniText2={
            walletMeta
              ? stakingInfo &&
                address &&
                walletAddress !== "Connecting..." &&
                usdCNeta
                ? "$" +
                    numberFormat(
                      (stakingInfo?.liveStake * Number(usdCNeta)).toString(),
                      2,
                      2
                    ) ?? "0.00"
                : "loading"
              : "$0.00"
          }
          buttonTitle={!walletMeta ? "Stake" : undefined}
          buttonLink="/stake"
          // titleCenter={
          //   !!walletMeta &&
          //   !(
          //     stakingInfo?.staking &&
          //     address &&
          //     walletAddress !== "Connecting..."
          //   )
          // }
          // textLg={
          //   !(
          //     walletMeta &&
          //     stakingInfo?.staking &&
          //     address &&
          //     walletAddress !== "Connecting..."
          //   )
          // }
          // paddingTop={
          //   walletMeta && !stakingInfo?.staking ? "1.75rem" : undefined
          // }
        />
        <Widget
          title={
            walletMeta &&
            stakingInfo?.staking &&
            address &&
            walletAddress !== "Connecting..."
              ? "Live Stake"
              : "Stake cNETA"
          }
          text={
            walletMeta &&
            stakingInfo?.staking &&
            address &&
            walletAddress !== "Connecting..." &&
            usdCNeta
              ? numberFormat(stakingInfo.liveStake.toString(), 8) + " cNETA"
              : undefined
          }
          miniText={
            walletMeta &&
            stakingInfo?.staking &&
            address &&
            walletAddress !== "Connecting..." &&
            usdCNeta
              ? "$" +
                numberFormat(
                  (stakingInfo.liveStake * Number(usdCNeta)).toString(),
                  2,
                  2
                )
              : undefined
          }
          buttonTitle={
            !walletMeta ||
            !stakingInfo?.staking ||
            !address ||
            walletAddress === "Connecting..."
              ? "Stake"
              : undefined
          }
          buttonLink="/stake"
          // tooltip="Staked cNETA becomes active after 1 full epoch staked. If you stake during the 1st epoch, it becomes live in the 2nd epoch and rewards become available at the start of the 3rd epoch."
          noPrice
          noHeaderPrice
          titleLg
          textLg
          miniTextLg
        />
        <Widget
          // text="Coming Soon"
          text={
            walletMeta &&
            stakingInfo?.staking &&
            address &&
            walletAddress !== "Connecting..."
              ? numberFormat(
                  (+stakingInfo?.expectedRewards.btc * 36).toString(),
                  8
                ) + " cBTC"
              : undefined
          }
          miniText={
            walletMeta &&
            stakingInfo?.staking &&
            address &&
            walletAddress !== "Connecting..."
              ? "$" +
                numberFormat(
                  (
                    +stakingInfo?.expectedRewards.btc *
                    Number(usdAda) *
                    Number(cBtcAda) *
                    36
                  ).toString(),
                  2,
                  2
                )
              : undefined
          }
          text2={
            walletMeta &&
            stakingInfo?.staking &&
            address &&
            walletAddress !== "Connecting..."
              ? numberFormat(
                  (+stakingInfo?.expectedRewards.erg * 36).toString(),
                  8
                ) + " ERG"
              : undefined
          }
          miniText2={
            walletMeta &&
            stakingInfo?.staking &&
            address &&
            walletAddress !== "Connecting..."
              ? "$" +
                numberFormat(
                  (
                    +stakingInfo?.expectedRewards.erg *
                    Number(usdErg) *
                    36
                  ).toString(),
                  2,
                  2
                )
              : undefined
          }
          title={`Your Total ${isMobile ? "Est." : "Estimated"} Rewards`}
          buttonTitle={
            !walletMeta ||
            !stakingInfo?.staking ||
            !address ||
            walletAddress === "Connecting..."
              ? "Stake"
              : undefined
          }
          buttonLink="/stake"
          noPrice
          noHeaderPrice
          noMargin={
            walletMeta &&
            stakingInfo?.staking &&
            address &&
            walletAddress !== "Connecting..."
          }
          titleCenter={
            !walletMeta ||
            !stakingInfo?.staking ||
            !address ||
            walletAddress === "Connecting..."
          }
        />
        {/* <Widget
          noPrice
          noHeaderPrice
          titleLg
          title="Your cBTC"
          walletMeta={walletMeta}
          walletBalance={balanceCBtc}
          buttonClick={handleWalletShowing}
          buttonTitle={
            !walletMeta ? (isMobile ? "Connect" : "Connect Wallet") : undefined
          }
          token="cBTC"
          icon="/images/crypto/cbtc-logo.svg#Layer_1"
          titleLeft={!!walletMeta}
        /> */}

        <Widget
          // text="Coming Soon"
          text={
            walletMeta &&
            stakingInfo?.staking &&
            address &&
            walletAddress !== "Connecting..."
              ? numberFormat(
                  (+stakingInfo?.expectedRewards.btc).toString(),
                  8
                ) + " cBTC"
              : undefined
          }
          miniText={
            walletMeta &&
            stakingInfo?.staking &&
            address &&
            walletAddress !== "Connecting..."
              ? "$" +
                numberFormat(
                  (
                    +stakingInfo?.expectedRewards.btc *
                    Number(usdAda) *
                    Number(cBtcAda)
                  ).toString(),
                  2,
                  2
                )
              : undefined
          }
          text2={
            walletMeta &&
            stakingInfo?.staking &&
            address &&
            walletAddress !== "Connecting..."
              ? numberFormat(
                  (+stakingInfo?.expectedRewards.erg).toString(),
                  8
                ) + " ERG"
              : undefined
          }
          miniText2={
            walletMeta &&
            stakingInfo?.staking &&
            address &&
            walletAddress !== "Connecting..."
              ? "$" +
                numberFormat(
                  (
                    +stakingInfo?.expectedRewards.erg * Number(usdErg)
                  ).toString(),
                  2,
                  2
                )
              : undefined
          }
          title={`Your Rewards Next Epoch`}
          buttonTitle={
            !walletMeta ||
            !stakingInfo?.staking ||
            !address ||
            walletAddress === "Connecting..."
              ? "Stake"
              : undefined
          }
          buttonLink="/stake"
          noPrice
          noHeaderPrice
          noMargin={
            walletMeta &&
            stakingInfo?.staking &&
            address &&
            walletAddress !== "Connecting..."
          }
          titleCenter={
            !walletMeta ||
            !stakingInfo?.staking ||
            !address ||
            walletAddress === "Connecting..."
          }
        />
        <Widget
          text={
            usdCNeta && usdAda && usdErg && cBtcAda
              ? "$" +
                numberFormat(
                  cNetaAmount * Number(usdCNeta) +
                    adaAmount * Number(usdAda) +
                    cBtcAmount * Number(usdAda) * Number(cBtcAda) +
                    ergAmount * Number(usdErg),
                  2,
                  2
                )
              : "loading"
          }
          miniText={
            (usdCNeta && usdAda && usdErg && cBtcAda
              ? numberFormat(
                  (cNetaAmount * Number(usdCNeta) +
                    adaAmount * Number(usdAda) +
                    cBtcAmount * Number(usdAda) * Number(cBtcAda) +
                    ergAmount * Number(usdErg)) /
                    Number(usdAda),
                  0
                )
              : "0") + " ADA"
          }
          title={`Community Fund`}
          noPrice
          noMargin
          colSpanValue={6}
          colSpanSm
          textRow
          textXl
          miniTextXl
          assets={{
            table: [
              {
                token: "cNETA",
                amount: cNetaAmount,
                adaValue: (cNetaAmount * Number(usdCNeta)) / Number(usdAda),
                usdValue: cNetaAmount * Number(usdCNeta),
              },
              {
                token: "ADA",
                amount: adaAmount,
                adaValue: adaAmount,
                usdValue: adaAmount * Number(usdAda),
              },
              {
                token: "cBTC",
                amount: cBtcAmount,
                adaValue: cBtcAmount * Number(cBtcAda),
                usdValue: cBtcAmount * Number(usdAda) * Number(cBtcAda),
              },
              {
                token: "ERG",
                amount: ergAmount,
                adaValue: (ergAmount * Number(usdErg)) / Number(usdAda),
                usdValue: ergAmount * Number(usdErg),
              },
            ],
            wallets: [
              "https://cexplorer.io/address/addr1qyxwxjg6637fw3zv5he7lxy0fmsssgk3f3dyxcg4zhumm2ur65qxyr79pkpgm225d3z3n53fwnqcfhdmv9xcemgns98qn52gr5",
              "https://cexplorer.io/address/addr1q9etscm7q6zaz7433m40q2qctyp868npxvl8amkv54ff87se47jdymvpwc7kpvjap0nf5cupj06p5ljstdzh9an6y90s68qfha",
              "https://explorer.ergoplatform.com/en/addresses/9i8StiuYEckoVNpaeU12m5DSP8shUtgh3drRtZ8EUpcYRnBLthr",
            ],
          }}
        />
        <ConnectWallet
          isOpen={isWalletShowing}
          setIsOpen={setIsWalletShowing}
        />
      </section>
    </>
  );
}

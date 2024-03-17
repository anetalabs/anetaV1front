import { useCallback, useContext, useEffect, useState } from "react";
import ChartComponent from "../../components/dashboard/ChartComponent";
import useAssetsApi from "../../hooks/useAssetsApi";
import useDashboard from "../../hooks/useDashboard";
import styles from "../../styles/dashboard.module.scss";
import { formatAmount, numberFormat, numberToFixed } from "../../utils/format";
import { GlobalContext } from "../../components/GlobalContext";
import Link from "next/link";
import useCardanoWallet from "../../hooks/useCardanoWallet";
import useLucid from "../../hooks/useLucid";
import ConnectWallet from "../../components/partials/navbar/ConnectWallet";
import Head from "next/head";
import ChartWidget from "../../components/dashboard/ChartWidget";
import Widget from "../../components/dashboard/Widget";
import useWindowSize from "../../hooks/useResponsive";

export default function Dashboard() {
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
    stakingInfo,
    fetchStakingInfo,
  } = useDashboard();

  const { width } = useWindowSize();
  const isMobile = width <= 450;

  const { data, loading } = useAssetsApi();

  const { walletMeta, address, walletAddress } = useCardanoWallet();
  const { getUtxos } = useLucid();
  const [isWalletShowing, setIsWalletShowing] = useState(false);
  const [balanceCBtc, setBalanceCBtc] = useState<null | string>(null);
  const [balanceCNeta, setBalanceCNeta] = useState<null | string>(null);

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

  const handleWalletShowing = () => {
    if (isWalletShowing) setIsWalletShowing(false);
    else setIsWalletShowing(true);
  };

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
    setBalanceCBtc(formatAmount(sumBalanceCBTC / 100000000));
    setBalanceCNeta(formatAmount(sumBalanceCNETA));
  };

  const handleStake = useCallback(async () => {
    try {
      const res = await fetch("api/stake");
      const data = await res.json();
      if (data.result === "ok") {
        fetchStakingInfo();
      }
    } catch (error) {
      console.error("Error fetching stake:", error);
    }
  }, [fetchStakingInfo]);

  useEffect(() => {
    if (address !== "") {
      getBalance();
    }
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
                <p className={styles.btnText}>View BTC Vaults</p>
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
                <p className={styles.btnText}>View cBTC Token</p>
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
          headerButtonTitle={walletMeta ? "Claim" : undefined}
          headerButtonClick="https://app.tosidrop.io/cardano/claim"
          colSpan
          colSpanSm
        />

        <Widget
          text={communityRevenue ? communityRevenue + " cBTC" : "loading"}
          title={`${isMobile ? "Comm." : "Community"} Revenue`}
          buttonTitle="Track"
          buttonLink={communityVaultBtc}
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
          noPrice
          noMargin
          title="Total cNETA Staked"
          // text="Coming Soon"
          text={
            stakingInfo
              ? stakingInfo?.staking
                ? (numberFormat(stakingInfo?.totalStake.toString(), 5) ?? "0") +
                  " BTC"
                : "Coming Soon"
              : "loading"
          }
          title2={walletMeta ? "Your cNETA Staked" : undefined}
          // text2="Coming Soon"
          text2={
            !walletMeta
              ? undefined
              : stakingInfo
              ? stakingInfo?.staking
                ? (numberFormat(stakingInfo?.stake.toString(), 5) ?? "0") +
                  " BTC"
                : "Coming Soon"
              : "loading"
          }
          buttonClick={handleWalletShowing}
          buttonTitle={
            !walletMeta ? (isMobile ? "Connect" : "Connect Wallet") : undefined
          }
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
          noHeaderPrice
          titleLg={!walletMeta}
          title="Your cBTC"
          walletMeta={walletMeta}
          walletBalance={balanceCBtc}
          buttonClick={handleWalletShowing}
          buttonTitle={
            !walletMeta ? (isMobile ? "Connect" : "Connect Wallet") : undefined
          }
          token="cBTC"
          icon="/images/crypto/cbtc-logo.svg#Layer_1"
        />
        <Widget
          title={
            walletMeta && stakingInfo?.staking ? "Live Stake" : "Stake cNETA"
          }
          text={
            walletMeta && stakingInfo
              ? numberFormat(stakingInfo.liveStake.toString(), 5) + " BTC"
              : undefined
          }
          buttonTitle={
            !walletMeta || !stakingInfo?.staking ? "Stake" : undefined
          }
          buttonClick={() => handleStake()}
          // buttonLink="/stake"
          buttonDisabled={(!walletMeta || !stakingInfo) ?? true}
          noPrice
          noHeaderPrice
          titleLg
          textLg
        />
        <Widget
          // text="Coming Soon"
          text={
            walletMeta
              ? stakingInfo
                ? (stakingInfo?.rewards.btc.toFixed(5) ?? "0") + " BTC"
                : "loading"
              : undefined
          }
          title={`Your ${
            walletMeta ? (isMobile ? "Est." : "Estimated") : ""
          } Rewards`}
          buttonTitle={
            walletMeta ? "Claim" : isMobile ? "Connect" : "Connect Wallet"
          }
          buttonClick={!walletMeta ? handleWalletShowing : undefined}
          buttonLink={
            walletMeta ? "https://app.tosidrop.io/cardano/claim" : undefined
          }
          externalLink
          titleLg={!walletMeta}
          noMargin={!!walletMeta}
          noPrice
          noHeaderPrice
        />
        <ConnectWallet
          isOpen={isWalletShowing}
          setIsOpen={setIsWalletShowing}
        />
      </section>
    </>
  );
}

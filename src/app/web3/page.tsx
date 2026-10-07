import { TrackPortfolioPage } from "@/components/track-page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "WEB3/Crypto Portfolio — FEYBER",
  description: "Portfolio jalur WEB3/Crypto: blockchain, DeFi, dan on-chain product.",
};

export default function Web3Page() {
  return <TrackPortfolioPage track="web3" underConstruction />;
}

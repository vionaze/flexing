import { TrackPortfolioPage } from "@/components/track-page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SI Portfolio — FEYBER",
  description: "Portfolio jalur Super Intelligence: AI, data, dan engineering.",
};

export default function SiPage() {
  return <TrackPortfolioPage track="si" />;
}

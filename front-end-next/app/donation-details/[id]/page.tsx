import { DonationDetailsView } from "@/components/public/DonationDetailsView";

export default async function DonationDetailsIdPage({ params }: { params: { id: string } }) {
  return <DonationDetailsView donationId={params.id} />;
}

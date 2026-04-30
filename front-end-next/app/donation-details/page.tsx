import { DonationDetailsView } from "@/components/public/DonationDetailsView";
import { donationDetailsPath } from "@/lib/routes";
import { redirect } from "next/navigation";

export default async function DonationDetailsPage({
  searchParams
}: {
  searchParams: { did?: string };
}) {
  const did = searchParams.did;

  if (did) {
    redirect(donationDetailsPath(did));
  }

  redirect("/donation");
}

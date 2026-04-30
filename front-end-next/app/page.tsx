import { PublicShell } from "@/components/public/PublicShell";
import { HomeLegacyPage } from "@/components/public/HomeLegacyPage";
import { fetchPublicResource } from "@/lib/server/laravel";
import { Donation, Testimonial } from "@/lib/types";

export default async function HomePage() {
  const [donations, testimonials] = await Promise.all([
    fetchPublicResource<Donation[]>("donations").catch(() => []),
    fetchPublicResource<Testimonial[]>("testimonials").catch(() => [])
  ]);

  return (
    <PublicShell>
      <HomeLegacyPage donations={donations} testimonials={testimonials} />
    </PublicShell>
  );
}

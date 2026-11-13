import type { PageRow } from "@/lib/types";
import { getSite, listGallery } from "@/lib/content";
import { CtaBand, PageHero, SectionHeading } from "@/components/site/ui";
import GalleryGrid from "@/components/site/GalleryGrid";

export default function GalleryTemplate({ page }: { page: PageRow }) {
  const site = getSite();
  const items = listGallery().map(({ id, image, caption, category }) => ({ id, image, caption, category }));
  return (
    <>
      <PageHero title={page.title} eyebrow={page.eyebrow} summary={page.summary} image={page.hero_image} crumbs={[{ label: "Home", href: "/" }, { label: page.title }]} size="sm" />
      <section className="py-16 sm:py-20">
        <div className="container-site">
          <SectionHeading eyebrow="Gallery" title={page.heading} center />
          <div className="mt-10"><GalleryGrid items={items} /></div>
        </div>
      </section>
      <CtaBand title="See us in action" text="Book a site survey and meet the team that will protect your premises." phone={site.phones[0]?.number} />
    </>
  );
}

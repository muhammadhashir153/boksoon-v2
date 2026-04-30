import { PublicShell } from "@/components/public/PublicShell";
import { fetchPublicResource } from "@/lib/server/laravel";
import { Book } from "@/lib/types";

export default async function BooksPage() {
  const books = await fetchPublicResource<Book[]>("books").catch(() => []);

  return (
    <PublicShell>
      <div className="breadcrumb-wrapper fix bg-cover" style={{ backgroundImage: "url(/assets/img/boksoon/about-us-hero.webp)" }}>
        <div className="container">
          <div className="page-heading">
            <div className="breadcrumb-sub-title">
              <h1 className="wow fadeInUp" data-wow-delay=".3s">Books by Boksoon Kim</h1>
            </div>
            <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
              <li><a href="/">Home</a></li>
              <li><i className="fa-solid fa-chevron-right" /></li>
              <li>Books</li>
            </ul>
          </div>
        </div>
      </div>
      <section className="donation-section-2 section-padding fix">
        <div className="container">
          <div className="donation-wrapper-2">
            <div className="row g-4" id="books-container">
              {books.length ? books.map((book) => (
                <div className="col-xl-12 col-lg-12 col-md-12" key={book.id}>
                  <div className="donation-card-item-2 mt-0">
                    <div className="left-shape">
                      <img src="/assets/img/home-2/donation/shape-1.png" alt="img" />
                    </div>
                    <div className="row g-3">
                      <div className="col-md-3 my-md-auto">
                        <div className="donation-image">
                          <img src={book.cover_image_url || "/assets/img/default.webp"} alt={book.title} className="w-100" />
                          <div className="news-layer-wrapper">
                            {Array.from({ length: 4 }).map((_, index) => (
                              <div key={index} className="news-layer-image" style={{ backgroundImage: `url(${book.cover_image_url || "/assets/img/default.webp"})` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-9 my-md-auto">
                        <div className="donation-content">
                          <h4><a href={book.link_url} target="_blank">{book.title}</a></h4>
                          <div
                            dangerouslySetInnerHTML={{ __html: book.description || "" }}
                          />
                          <a href={book.link_url} target="_blank" className="theme-btn style-2 mt-3">
                            {book.link_label || "Check Out on Amazon"} <i className="fa-solid fa-arrow-right-long" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-12 wow fadeInUp" data-wow-delay=".2s">
                  <p className="text-center mb-0">No books found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

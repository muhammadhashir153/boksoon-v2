import { PublicShell } from "@/components/public/PublicShell";
import { BlogCommentSection } from "@/components/public/BlogCommentSection";
import { LocalizedDateText } from "@/components/shared/LocalizedDateText";
import { fetchPublicResource } from "@/lib/server/laravel";
import { Blog, Comment } from "@/lib/types";

const ckeditorContentStyles = `
  .ckeditor-content { margin-top: 30px; }
  .ckeditor-content img { width: 100%; height: auto; border-radius: 20px; display: block; margin: 30px 0; }
  .ckeditor-content ul.date-list { display: flex; flex-wrap: wrap; gap: 20px; margin: 24px 0 15px; padding-left: 0; list-style: none; }
  .ckeditor-content ul li i { margin-right: 10px; color: var(--theme); }
  .ckeditor-content p { margin-bottom: 20px; line-height: 1.7; }
  .ckeditor-content h1, .ckeditor-content h2, .ckeditor-content h3, .ckeditor-content h4 { margin: 30px 0 20px; font-family: "DM Serif Text", serif; color: var(--header); }
  .ckeditor-content blockquote { border-left: 5px solid var(--theme-2); padding: 40px 30px; background-color: #F7F7F7; margin: 30px 0 60px; border-radius: 20px; }
  .ckeditor-content ul li, .ckeditor-content ol li { font-size: 20px; font-weight: 400; font-family: "DM Serif Text", serif; color: var(--header); }
  .ckeditor-content ul li:not(:last-child), .ckeditor-content ol li:not(:last-child) { margin-bottom: 30px; }
  .ckeditor-content ul li svg { margin-right: 10px; }
  .ckeditor-content .news-thumb img { width: 100%; height: auto; border-radius: 20px; }
  .blog-comment-form { margin-top: 48px; padding: 40px; border-radius: 24px; background: #f8f5ef; }
  .blog-comment-form h3 { margin-bottom: 12px; }
  .blog-comment-form p { margin-bottom: 24px; }
  .blog-comment-message { margin-top: 8px; font-weight: 500; color: var(--header); }
  .blog-comment-message.is-error { color: #b42318; }
  .blog-comment-form input[aria-invalid="true"] { border-color: #b42318; }
  .blog-comment-textarea-wrap { position: relative; }
  .blog-comment-toolbar { position: absolute; right: 18px; bottom: 18px; z-index: 2; }
  .blog-comment-emoji-trigger { width: 44px; height: 44px; border: 1px solid rgba(19, 44, 39, 0.18); border-radius: 50%; background: #fff; color: var(--header); display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
  .blog-comment-emoji-trigger:hover { background: var(--theme); color: #fff; }
  .blog-comment-emoji-picker { position: absolute; right: 0; bottom: 54px; width: 220px; padding: 12px; border: 1px solid rgba(19, 44, 39, 0.12); border-radius: 18px; background: #fff; box-shadow: 0 18px 40px rgba(13, 24, 20, 0.12); display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
  .blog-comment-emoji { border: 0; border-radius: 12px; background: #f5f1e8; padding: 10px 0; font-size: 22px; line-height: 1; }
  .blog-comment-form textarea { padding-right: 76px; }
  .comment-area { margin-top: 48px; }
  .comment-area h3 { margin-bottom: 28px; }
  .comment-item { display: flex; align-items: start; gap: 24px; padding: 30px 0; border-top: 1px solid rgba(19, 44, 39, 0.12); }
  .comment-item:last-child { border-bottom: 1px solid rgba(19, 44, 39, 0.12); }
  .blog-comment-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--theme), #0e3a33); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; text-transform: uppercase; }
  .comment-content { flex: 1; }
  .comment-content h4 { margin-bottom: 12px; }
  .comment-content p { margin-bottom: 16px; }
  .comment-list { display: flex; flex-wrap: wrap; gap: 18px; margin: 0; padding: 0; list-style: none; color: var(--text); }
  .comment-list li { display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 500; }
  @media (max-width: 767.98px) {
    .blog-comment-form { padding: 28px 22px; }
    .comment-item { flex-direction: column; gap: 18px; }
  }
`;

export async function BlogDetailsView({ slug }: { slug: string }) {
  const blog = await fetchPublicResource<Blog>(`blogs/slug/${encodeURIComponent(slug)}`).catch(() => null);

  if (!blog) {
    return (
      <PublicShell>
        <div className="container section-padding"><div className="page-error">Blog not found.</div></div>
      </PublicShell>
    );
  }

  const comments = await fetchPublicResource<Comment[]>(`blogs/${blog.id}/comments`).catch(() => []);

  return (
    <PublicShell>
      <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: ckeditorContentStyles }} />
      <div className="breadcrumb-wrapper fix bg-cover" style={{ backgroundImage: "url(/assets/img/boksoon/about-us-hero.webp)" }}>
        <div className="container">
          <div className="page-heading">
            <div className="breadcrumb-sub-title">
              <h1 className="wow fadeInUp title" data-wow-delay=".3s">Blogs</h1>
            </div>
            <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
              <li><a href="/">Home</a></li>
              <li><i className="fa-solid fa-chevron-right" /></li>
              <li className="title">Blogs</li>
            </ul>
          </div>
        </div>
      </div>
      <section className="news-details-section section-padding fix">
        <div className="container">
          <div className="news-details-wrapper">
            <div className="row g-4 justify-content-center">
              <div className="col-lg-8 col-12">
                <div className="news-details-post">
                  <div className="news-details-image">
                    <img src={blog.banner_image_url || "/assets/img/default.webp"} alt={blog.title} />
                  </div>
                  <div className="news-details-content">
                    <ul className="date-list">
                      <li><i className="fa-solid fa-calendar-days" /><LocalizedDateText value={blog.published_at} variant="dateTime" /></li>
                      <li><i className="fa-solid fa-table" />{blog.ministry_name} Ministry</li>
                    </ul>
                    <div className="ckeditor-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
                    <BlogCommentSection blogId={blog.id} comments={comments} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

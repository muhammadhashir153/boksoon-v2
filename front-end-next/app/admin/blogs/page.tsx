import { DeleteButton } from "@/components/admin/DeleteButton";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Blog } from "@/lib/types";

export default async function AdminBlogsPage() {
  const blogs = await fetchProtectedResource<Blog[]>("admin/blogs").catch(() => []);

  return (
    <>
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-12">
              <div className="page-header-title">
                <h5 className="m-b-10">Blogs</h5>
              </div>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item" aria-current="page">Blogs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="page-toolbar">
        <div className="page-toolbar-copy">
          <h2>Editorial Publishing</h2>
          <p>Manage ministry stories, drafts, and published content from a single modern feed.</p>
        </div>
        <div className="page-toolbar-actions">
          <a href="/admin/blogs/new" className="btn btn-primary">New Article</a>
          <a href="/admin/trash" className="btn btn-outline-secondary">Open Trash</a>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-header">
              <h3>All Posts</h3>
              <p className="section-copy mb-0">Draft, publish, and revisit stories with a cleaner editorial overview.</p>
            </div>
            <div className="card-body">
              <div className="row donation-grid" id="donations">
                {!blogs.length ? (
                  <div className="empty-state">
                    <strong>No blog posts yet</strong>
                    <div>Start with a new story, update, or editorial note.</div>
                  </div>
                ) : blogs.map((blog) => (
                  <div className="col-12 col-md-6 col-xl-4" key={blog.id}>
                    <div className="donation-item h-100">
                      <div className="donation-cover">
                        <img src={blog.banner_image_url || "/admin-assets/images/user/avatar-2.jpg"} className="card-img-top" style={{ height: "100%", objectFit: "cover" }} alt={blog.title} />
                      </div>
                      <div className="card-body">
                        <span className="badge bg-secondary">Article</span>
                        <h3 className="card-title mt-3">{blog.title}</h3>
                        {blog.ministry_name ? <span className="badge bg-primary p-1 mt-2">{blog.ministry_name}</span> : null}
                        {blog.is_published ? <span className="badge bg-success p-1 mt-2">Published</span> : <span className="badge bg-secondary p-1 mt-2">Draft</span>}
                        {blog.is_deleted ? <span className="badge bg-danger p-1 mt-2">Deleted</span> : null}
                      </div>
                      <div className="card-footer d-flex justify-content-between gap-2">
                        <a className="btn btn-sm btn-primary" href={`/admin/blogs/${blog.id}`}>Edit</a>
                        <DeleteButton
                          endpoint={`/api/admin/blogs/${blog.id}`}
                          className="btn btn-sm btn-danger"
                          confirmMessage="Move this blog to trash?"
                          confirmTitle="Move Blog to Trash"
                          failureMessage="Could not move this blog to trash."
                        >
                          Move to Trash
                        </DeleteButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

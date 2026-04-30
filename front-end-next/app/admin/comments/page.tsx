import { CommentPublishButton } from "@/components/admin/CommentPublishButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { LocalizedDateText } from "@/components/shared/LocalizedDateText";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Comment } from "@/lib/types";

export default async function AdminCommentsPage() {
  const comments = await fetchProtectedResource<Comment[]>("admin/comments").catch(() => []);

  return (
    <>
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-12">
              <div className="page-header-title">
                <h5 className="m-b-10">Comments</h5>
              </div>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item" aria-current="page">Comments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Blog Comments</h3>
          <p className="section-copy mb-0">Review reader comments, toggle publish state, and remove anything that should not stay public.</p>
        </div>
        <div className="card-body">
          <div className="dt-responsive table-responsive" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Blog</th>
                  <th>Verified</th>
                  <th>Published</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Message</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((comment) => (
                  <tr key={comment.id}>
                    <td>{comment.name}</td>
                    <td>{comment.email || "-"}</td>
                    <td>
                      {comment.blog_slug ? (
                        <a href={`/blogs/${comment.blog_slug}`} target="_blank" rel="noreferrer">
                          {comment.blog_title || comment.blog_slug}
                        </a>
                      ) : (
                        comment.blog_title || "-"
                      )}
                    </td>
                    <td>{comment.is_verified ? "Yes" : "No"}</td>
                    <td>{comment.is_published ? "Yes" : "No"}</td>
                    <td><LocalizedDateText value={comment.created_at} variant="dateTime" fallback="-" /></td>
                    <td><LocalizedDateText value={comment.updated_at} variant="dateTime" fallback="-" /></td>
                    <td style={{ minWidth: 280 }}>{comment.message}</td>
                    <td>
                      <div className="admin-actions">
                        <a className="btn btn-primary btn-sm" href={`/admin/comments/${comment.id}`}>View</a>
                        <CommentPublishButton endpoint={`/api/admin/comments/${comment.id}`} nextPublishedState={!comment.is_published} />
                        <DeleteButton
                          endpoint={`/api/admin/comments/${comment.id}`}
                          confirmMessage="Are you sure you want to delete this comment?"
                          failureMessage="Comment delete failed."
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

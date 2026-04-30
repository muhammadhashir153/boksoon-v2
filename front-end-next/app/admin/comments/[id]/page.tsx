import { CommentPublishButton } from "@/components/admin/CommentPublishButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { LocalizedDateText } from "@/components/shared/LocalizedDateText";
import { fetchProtectedResource } from "@/lib/server/laravel";
import { Comment } from "@/lib/types";

export default async function AdminCommentDetailsPage({ params }: { params: { id: string } }) {
  const comment = await fetchProtectedResource<Comment>(`admin/comments/${params.id}`).catch(() => null);

  if (!comment) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="page-error">Comment not found.</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-12">
              <div className="page-header-title">
                <h5 className="m-b-10">Comment Details</h5>
              </div>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item"><a href="/admin/comments">Comments</a></li>
                <li className="breadcrumb-item" aria-current="page">View Comment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>{comment.name}</h3>
          <p className="section-copy mb-0">Review the comment details, moderate visibility, or remove the entry.</p>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Blog</label>
              <div className="form-control">{comment.blog_title || "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Blog Slug</label>
              <div className="form-control">{comment.blog_slug || "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Name</label>
              <div className="form-control">{comment.name}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Email</label>
              <div className="form-control">{comment.email || "-"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Verified</label>
              <div className="form-control">{comment.is_verified ? "Verified" : "Pending"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Published</label>
              <div className="form-control">{comment.is_published ? "Published" : "Hidden"}</div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Created</label>
              <div className="form-control">
                <LocalizedDateText value={comment.created_at} variant="dateTime" fallback="-" />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Updated</label>
              <div className="form-control">
                <LocalizedDateText value={comment.updated_at} variant="dateTime" fallback="-" />
              </div>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Message</label>
              <div className="form-control" style={{ minHeight: "180px", whiteSpace: "pre-wrap" }}>{comment.message}</div>
            </div>
            <div className="col-12">
              <div className="admin-actions">
                <a className="btn btn-outline-secondary" href="/admin/comments">Back to Comments</a>
                <CommentPublishButton endpoint={`/api/admin/comments/${comment.id}`} nextPublishedState={!comment.is_published} />
                <DeleteButton
                  endpoint={`/api/admin/comments/${comment.id}`}
                  confirmMessage="Are you sure you want to delete this comment?"
                  failureMessage="Comment delete failed."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

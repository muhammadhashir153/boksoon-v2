export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

export type Ministry = {
  id: string;
  legacy_id: number;
  name: string;
};

export type Donation = {
  id: string;
  legacy_id: number;
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  target_amount: number;
  raised_amount: number;
  admin_id: string | null;
  admin_name: string | null;
  placeholder: string | null;
  placeholder_url: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
};

export type Blog = {
  id: string;
  legacy_id: number;
  title: string;
  slug: string;
  banner_image: string | null;
  banner_image_url: string | null;
  content: string;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  is_published: boolean;
  ministry_id: string | null;
  ministry_name: string | null;
  publisher_id: string | null;
  publisher_name: string | null;
};

export type Book = {
  id: string;
  legacy_id: number;
  title: string;
  slug: string;
  cover_image: string | null;
  cover_image_url: string | null;
  description: string;
  link_url: string;
  link_label: string;
  language: string | null;
  author_name: string | null;
  sort_order: number;
  is_published: boolean;
  is_deleted: boolean;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
};

export type Comment = {
  id: string;
  legacy_id: number;
  blog_id: string | null;
  blog_title: string | null;
  blog_slug: string | null;
  name: string;
  email: string | null;
  message: string;
  is_verified: boolean;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type Testimonial = {
  id: string;
  legacy_id: number;
  reviewer_name: string;
  review: string;
  added_by: string | null;
  added_by_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type User = {
  id: string;
  legacy_id: number;
  name: string;
  email: string;
  dp: string | null;
  dp_url: string | null;
  role: string | null;
  role_name: string;
  ministry_id: string | null;
  ministry: string | null;
  is_verified: boolean;
};

export type Role = {
  id: string;
  legacy_id: number;
  name: string;
};

export type Donor = {
  id: string;
  legacy_id: number;
  name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  is_hidden: boolean;
};

export type Transaction = {
  id: string;
  legacy_id: number;
  donor_id: string | null;
  donation_id: string | null;
  amount: number;
  payment_method: string | null;
  last_four: string | null;
  currency: string;
  status: string;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  donor_name: string | null;
  donor_email: string | null;
  donation_title: string | null;
};

export type Contact = {
  id: string;
  legacy_id: number;
  name: string;
  email: string;
  number: string | null;
  message: string;
  created_at: string | null;
};

export type Newsletter = {
  id: string;
  legacy_id: number;
  email: string;
  created_at: string | null;
};

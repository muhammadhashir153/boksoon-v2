type BreadcrumbProps = {
  title: string;
  trail?: { label: string; href?: string }[];
  backgroundImage?: string;
};

export function Breadcrumb({
  title,
  trail = [{ label: "Home", href: "/" }, { label: title }],
  backgroundImage = "/assets/img/boksoon/about-us-hero.webp"
}: BreadcrumbProps) {
  return (
    <div
      className="breadcrumb-wrapper fix bg-cover"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="container">
        <div className="page-heading">
          <div className="breadcrumb-sub-title">
            <h1 className="wow fadeInUp" data-wow-delay=".3s">
              {title}
            </h1>
          </div>
          <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
            {trail.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                {item.href ? <a href={item.href}>{item.label}</a> : item.label}
                {index < trail.length - 1 ? <i className="fa-solid fa-chevron-right" /> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

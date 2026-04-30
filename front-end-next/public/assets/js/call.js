const webUrl = (window.APP_URLS && window.APP_URLS.frontend) || window.APP_BASE_URL || '';
const endpointUrl = (window.APP_URLS && window.APP_URLS.endpoint) || (webUrl + 'endpoint/');
const assetUrl = (window.APP_URLS && window.APP_URLS.assets) || (webUrl + 'assets/');


function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}

function resolveDonationImageUrl(placeholder) {
    if (!placeholder) {
        return `${webUrl}assets/img/default.webp`;
    }

    if (/^(https?:)?\/\//.test(placeholder) || placeholder.startsWith('data:')) {
        return placeholder;
    }

    if (placeholder.startsWith('assets/')) {
        return `${webUrl}${placeholder}`;
    }

    return `${assetUrl}img/uploads/${placeholder}`;
}

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function resolveBookImageUrl(imagePath) {
    if (!imagePath) {
        return `${webUrl}assets/img/default.webp`;
    }

    if (/^(https?:)?\/\//.test(imagePath) || imagePath.startsWith('data:')) {
        return imagePath;
    }

    return imagePath.startsWith('assets/')
        ? `${webUrl}${imagePath}`
        : `${webUrl}${String(imagePath).replace(/^\/+/, '')}`;
}

function fetchBooks(limit = null) {
    const booksContainer = document.getElementById('books-container');
    if (!booksContainer) return;

    $.ajax({
        url: endpointUrl + '?resource=books&action=get',
        type: 'GET',
        success: function (response) {
            const res = (typeof response === 'string') ? JSON.parse(response) : response;

            if (!res.success || !Array.isArray(res.data) || res.data.length === 0) {
                booksContainer.innerHTML = `
                    <div class="col-12 wow fadeInUp" data-wow-delay=".2s">
                        <p class="text-center mb-0">No books found.</p>
                    </div>
                `;
                return;
            }

            let books = res.data;
            if (limit && Number.isInteger(limit) && limit > 0) {
                books = books.slice(0, limit);
            }

            let htmlContent = '';

            books.forEach(function (book) {
                const coverImage = resolveBookImageUrl(book.cover_image);
                const title = escapeHtml(book.title || 'Untitled Book');
                const linkUrl = book.link_url || '#';
                const linkLabel = escapeHtml(book.link_label || 'Check Out on Amazon');

                htmlContent += `
                    <div class="col-xl-12 col-lg-12 col-md-12 wow fadeInUp" data-wow-delay=".3s">
                        <div class="donation-card-item-2 mt-0">
                            <div class="left-shape">
                                <img src="assets/img/home-2/donation/shape-1.png" alt="img">
                            </div>
                            <div class="row g-3">
                                <div class="col-md-3 my-md-auto">
                                    <div class="donation-image">
                                        <img src="${coverImage}" alt="${title}" class="w-100">
                                        <div class="news-layer-wrapper">
                                            <div class="news-layer-image" style="background-image: url('${coverImage}');"></div>
                                            <div class="news-layer-image" style="background-image: url('${coverImage}');"></div>
                                            <div class="news-layer-image" style="background-image: url('${coverImage}');"></div>
                                            <div class="news-layer-image" style="background-image: url('${coverImage}');"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-9 my-md-auto">
                                    <div class="donation-content">
                                        <h4>
                                            <a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${title}</a>
                                        </h4>
                                        <p>${book.description || ''}</p>
                                        <a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="theme-btn style-2 mt-3">${linkLabel}
                                            <i class="fa-solid fa-arrow-right-long"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            booksContainer.innerHTML = htmlContent;
        },
        error: function () {
            booksContainer.innerHTML = `
                <div class="col-12 wow fadeInUp" data-wow-delay=".2s">
                    <p class="text-center mb-0">Failed to load books. Please try again later.</p>
                </div>
            `;
        }
    });
}

function fetchTestimonials(limit = null, selector = '.testimonial-slider .swiper-wrapper', page = 'home') {
    let swiperWrapper = document.querySelector(selector);

    if (!swiperWrapper) return;

    $.ajax({
        url: endpointUrl + `?resource=testimonials&action=get${limit === null ? '' : '&limit=' + limit}`,
        type: 'GET',
        success: function (response) {
            let res = (typeof response === 'string') ? JSON.parse(response) : response;

            if (res.success && res.data.length > 0) {
                let testimonials = res.data;
                let htmlContent = '';

                testimonials.forEach(function (testimonial) {
                    page === 'home' ?
                        htmlContent += `
                            <div class="swiper-slide">
                                <div class="content">
                                    <div class="star">
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                    </div>
                                    <p>
                                        “${testimonial.review}”
                                    </p>
                                    <h3>${testimonial.reviewer_name}</h3>
                                </div>
                            </div>
                        ` :
                        htmlContent += `
                            <div class="col-md-6 testimonial">
                                <div class="content">
                                    <div class="star">
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                        <i class="fa-solid fa-star"></i>
                                    </div>
                                    <h4>${testimonial.reviewer_name}</h4>
                                    <p class="mt-3">
                                        “${testimonial.review}”
                                    </p>
                                </div>
                            </div>
                        `;
                });

                swiperWrapper.innerHTML = htmlContent;

                if(page === 'home'){
                    if (window.testimonialSwiper) {
                        window.testimonialSwiper.destroy(true, true);
                    }

                    window.testimonialSwiper = new Swiper('.testimonial-slider', {
                        spaceBetween: 30,
                        speed: 1300,
                        loop: true,
                        centeredSlides: true,
                        autoplay: {
                            delay: 2000,
                            disableOnInteraction: false,
                        },
                        pagination: {
                            el: ".dot",
                            clickable: true,
                        },

                        breakpoints: {
                            1199: {
                                slidesPerView: 1,
                            },
                            991: {
                                slidesPerView: 1,
                            },
                            767: {
                                slidesPerView: 1,
                            },
                            575: {
                                slidesPerView: 1,
                            },
                            0: {
                                slidesPerView: 1,
                            },
                        },
                    });
                }
            } else {
                swiperWrapper.innerHTML = `
                    <div class="swiper-slide">
                        <p>No testimonials found.</p>
                    </div>
                `;
            }
        },
        error: function () {
            swiperWrapper.innerHTML = `
                <div class="swiper-slide">
                    <p>Failed to load testimonials.</p>
                </div>
            `;
        }
    });
}

function fetchDonations(limit = null, page = "home") {
    let donationsContainer = document.getElementById('donations');
    if (donationsContainer) {
        $.ajax({
            url: endpointUrl + '?resource=donations&action=get',
            type: 'GET',
            success: function (response) {
                let res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    let donations = res.data;

                    // Apply limit if specified
                    if (limit && Number.isInteger(limit) && limit > 0) {
                        donations = donations.slice(0, limit);
                    }

                    let htmlContent = '';
                    donations.forEach(function (donation) {
                        if(page == 'donation') {
                            htmlContent += `
                                <div class="col-lg-6 col-md-6 wow fadeInUp" data-wow-delay=".7s">
                                    <div class="donation-card-item-2 mt-0">
                                        <div class="left-shape">
                                            <img src="${assetUrl}img/home-2/donation/shape-1.png" alt="img">
                                        </div>
                                        <div class="donation-image">
                                            <img src="${resolveDonationImageUrl(donation.placeholder)}" alt="img" style="max-height: 260px; object-fit: cover">
                                            <div class="news-layer-wrapper">
                                                <div class="news-layer-image"
                                                    style="background-image: url('${resolveDonationImageUrl(donation.placeholder)}');"></div>
                                                <div class="news-layer-image"
                                                    style="background-image: url('${resolveDonationImageUrl(donation.placeholder)}');"></div>
                                                <div class="news-layer-image"
                                                    style="background-image: url('${resolveDonationImageUrl(donation.placeholder)}');"></div>
                                                <div class="news-layer-image"
                                                    style="background-image: url('${resolveDonationImageUrl(donation.placeholder)}');"></div>
                                            </div>
                                        </div>
                                        <div class="donation-content">
                                            <h4>
                                                <a href="${webUrl}donation-details.php?did=${donation.id}">${donation.title}</a>
                                            </h4>
                                            <ul class="donate-list">
                                                <li>
                                                    Raised - $${donation.raised_amount}
                                                </li>
                                                <li>
                                                    <span>Goal - $${donation.target_amount}</span>
                                                </li>
                                            </ul>
                                            <a href="${webUrl}donation-details.php?did=${donation.id}" class="theme-btn style-2">Donte Now <i
                                                    class="fa-solid fa-arrow-right-long"></i></a>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }else{
                            htmlContent += `
                                <div class="col-lg-6 wow fadeInUp" data-wow-delay=".2s">
                                    <div class="donation-card-item">
                                        <div class="donation-image">
                                            <img src="${resolveDonationImageUrl(donation.placeholder)}" alt="img" class="w-100" style="max-height: 260px; object-fit: cover">
                                            <div class="right-shape">
                                                <img src="${assetUrl}img/home-1/donation/shape.png" alt="img">
                                            </div>
                                        </div>
                                        <div class="donation-content">
                                            <h4>
                                                <a href="${webUrl}donation-details.php?did=${donation.id}">${donation.title}</a>
                                            </h4>
                                            <p>
                                                ${donation.description}
                                            </p>
                                            <hr>
                                            <ul class="donate-list">
                                                <li>
                                                    <span>Goal :</span> $${donation.target_amount}
                                                </li>
                                                <li>
                                                    <span>Raised:</span> $${donation.raised_amount}
                                                </li>
                                            </ul>
                                            <a href="${webUrl}donation-details.php?did=${donation.id}" class="theme-btn">Donate Now <i class="fa-solid fa-arrow-right-long"></i></a>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                    });
                    donationsContainer.innerHTML = htmlContent;
                } else {
                    donationsContainer.innerHTML = '<p>No donation found.</p>';
                }
            },
            error: function (xhr, status, error) {
                donationsContainer.innerHTML = '<p>Failed to load donations. Please try again later.</p>';
                console.error('AJAX Error: ' + status + error);
            }
        });
    }
}


function getDonationById(donationId) {
    if (!donationId) {
        return Promise.resolve(null);
    }

    return $.ajax({
        url: endpointUrl + '?resource=donations&action=get&id=' + donationId,
        type: 'GET',
        dataType: 'json'
    }).then(function (response) {
        const res = (typeof response === 'string') ? JSON.parse(response) : response;
        return res.success ? res.data : null;
    }).catch(function (error) {
        console.error('Failed to fetch donation:', error);
        return null;
    });
}

function fetchMinistries(containerId = 'ministries') {
    let ministrySelect = document.getElementById(containerId);
    if (ministrySelect) {
        $.ajax({
            url: endpointUrl + '?resource=ministry&action=get',
            type: 'GET',
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    let ministry = res.data;
                    let htmlContent = '';
                    ministry.forEach(function (ministry) {
                        htmlContent += `
                            <li><a href="blogs.php?m_id=${ministry.id}">${ministry.name} Ministry</a></li>
                        `;
                    });
                    ministrySelect.innerHTML = htmlContent;
                } else {
                    ministrySelect.innerHTML = '<li>No ministries found.</li>';
                }
            },
            error: function (xhr, status, error) {
                ministrySelect.innerHTML = '<li>Failed to load ministries. Please try again later.</li>';
                console.error('AJAX Error: ' + status + error);
            }
        });
    }





    
}


function renderBlogCards(blogs, container) {
    let htmlContent = '';

    blogs.forEach(function (blog) {

        let createdAt = blog.published_at
            ? new Date(blog.published_at.replace(' ', 'T'))
            : null;

        let date = createdAt
            ? createdAt.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
            : '';

        let time = createdAt
            ? createdAt.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
            : '';

        htmlContent += `
        <div class="col-xl-4 col-lg-6 col-md-6">
            <div class="event-inner-items">
                <div class="event-image">
                    <img src="${blog.banner_image}" style="height:250px; object-fit:cover;" alt="img">
                    <span class="event-tag">${date}</span>
                </div>

                <div class="event-content">
                    <ul class="event-list">
                        <li>
                            <i class="fa-regular fa-location-dot"></i>
                            ${blog.ministry_name}
                        </li>
                        <li>
                            <i class="fa-regular fa-clock"></i>
                            ${time}
                        </li>
                    </ul>

                    <h4>
                        <a href="blog-details.php?id=${blog.id}">
                            ${blog.title}
                        </a>
                    </h4>

                    <a href="blog-details.php?id=${blog.id}" class="link-btn">
                        EXPLORE MORE <i class="fa-solid fa-arrow-right-long"></i>
                    </a>
                </div>
            </div>
        </div>
        `;
    });

    container.innerHTML = htmlContent;
}

function renderDonationSidebarBlogs(blogs, container) {
    let htmlContent = '';

    blogs.forEach(function (blog) {
        let createdAt = blog.published_at
            ? new Date(blog.published_at.replace(' ', 'T'))
            : null;

        let date = createdAt
            ? createdAt.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
            : '';

        htmlContent += `
            <div class="details-items">
                <div class="details-thumb">
                    <img src="${resolveDonationImageUrl(blog.banner_image)}" alt="${blog.title || 'Blog'}">
                </div>
                <div class="details-content">
                    <h5>
                        <a href="blog-details.php?id=${blog.id}">${blog.title}</a>
                    </h5>
                    <ul>
                        <li>
                            ${date}${date && blog.ministry_name ? ' . ' : ''}${blog.ministry_name || ''}
                        </li>
                    </ul>
                </div>
            </div>
        `;
    });

    container.innerHTML = htmlContent;
}


function fetchBlogs() {
    let blogsContainer = document.getElementById('blogs-container');

    if (blogsContainer) {
        $.ajax({
            url: endpointUrl + '?resource=blogs&action=get',
            type: 'GET',
            success: function (response) {

                            let res = (typeof response === 'string') ? JSON.parse(response) : response;

            if (res.success && res.data.length) {
                renderBlogCards(res.data, blogsContainer);
                console.log(res.data)
            } else {
                blogsContainer.innerHTML = '<p>No blogs found.</p>';
            }
            },
            error: function (xhr, status, error) {
                blogsContainer.innerHTML = '<p>Failed to load blogs. Please try again later.</p>';
                console.error('AJAX Error: ', status, error);
            }
        });
    }
}

function fetchDonationSidebarBlogs(containerId = 'donation-blogs', limit = 3) {
    const blogsContainer = document.getElementById(containerId);

    if (!blogsContainer) return;

    $.ajax({
        url: endpointUrl + '?resource=blogs&action=get',
        type: 'GET',
        success: function (response) {
            let res = (typeof response === 'string') ? JSON.parse(response) : response;

            if (!res.success || !Array.isArray(res.data)) {
                blogsContainer.innerHTML = '<p>No blogs found.</p>';
                return;
            }

            let blogs = res.data.filter(blog => Number(blog.is_published) === 1);

            if (Number.isInteger(limit) && limit > 0) {
                blogs = blogs.slice(0, limit);
            }

            if (!blogs.length) {
                blogsContainer.innerHTML = '<p>No published blogs available.</p>';
                return;
            }

            renderDonationSidebarBlogs(blogs, blogsContainer);
        },
        error: function (xhr, status, error) {
            blogsContainer.innerHTML = '<p>Failed to load blogs. Please try again later.</p>';
            console.error('AJAX Error: ' + status + error);
        }
    });
}

function fetchBlogByMinistryId(ministryId) {
    const blogsContainer = document.getElementById('blogs-container');
    if (!blogsContainer) return;

    $.ajax({
        url: endpointUrl + '?resource=blogs&action=get&m_id=' + ministryId,
        type: 'GET',
        dataType: 'json',
        success: function (res) {
            res = (typeof res === 'string') ? JSON.parse(res) : res;

            if (!res.success || !Array.isArray(res.data)) {
                blogsContainer.innerHTML = '<p>No blogs found.</p>';
                return;
            }

            // ✅ FILTER: keep only published blogs
            const publishedBlogs = res.data.filter(blog => Number(blog.is_published) === 1);

            if (publishedBlogs.length === 0) {
                blogsContainer.innerHTML = '<p>No published blogs available.</p>';
                return;
            }

            // Set ministry title (safe: first published blog)
            document.querySelectorAll(".title").forEach(el => {
                el.textContent = publishedBlogs[0].ministry_name + ' Ministry';
            });

            // Render only published blogs
            renderBlogCards(publishedBlogs, blogsContainer);
        },
        error: function (xhr, status, error) {
            console.error('AJAX Error:', status, error);
            blogsContainer.innerHTML = '<p>Something went wrong.</p>';
        }
    });
}


function fetchBlogById(blogId) {
    const e = document;

    const titles = e.querySelectorAll(".title");
    const bannerImage = e.getElementById('banner-image');
    const date = e.getElementById('date');
    const ministryName = e.getElementById("ministry");
    const content = e.getElementById('content');

    $.ajax({
        url: endpointUrl + '?resource=blogs&action=get&id=' + blogId,
        type: 'GET',
        dataType: 'json',
        success: function (res) {

            if (!res.success) {
                console.error('Failed to fetch blog');
                return;
            }

            const blog = res.data;

            /* Title (multiple places allowed) */
            titles.forEach(el => {
                el.textContent = blog.title;
            });

            /* Banner Image */
            if (bannerImage) {
                bannerImage.src = webUrl + blog.banner_image;
                bannerImage.alt = blog.title;
            }

            /* Published Date */
            if (date) {
                date.textContent = blog.published_at
                    ? new Date(blog.published_at).toDateString()
                    : '';
            }

            /* Ministry Name */
            if (ministryName) {
                ministryName.textContent = blog.ministry_name;
            }

            /* Blog Content (HTML is expected) */
            if (content) {
                content.innerHTML = blog.content;
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX Error:', status, error);
        }
    });
}

function sendContactForm(e) {
    e.preventDefault();

    let form = e.target;
    let formData = new FormData(form);
    let messageBox = form.querySelector("#form_message");

    messageBox.innerHTML = "Sending...";

    $.ajax({
        url: endpointUrl + '?resource=contacts&action=add',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            let res = (typeof response === 'string')
                ? JSON.parse(response)
                : response;

            if (res.success) {
                messageBox.innerHTML = "Message sent successfully";
                form.reset();
                setTimeout(function(){
                    window.location.href = webUrl;
                }, 1500)
            } else {
                messageBox.innerHTML = "Message failed to send";
            }
        },
        error: function () {
            messageBox.innerHTML = "Server error. Please try again later.";
        }
    });
}

function subscribeNewsletter(e) {
    e.preventDefault();

    let form = e.target;
    let formData = new FormData(form);

    $.ajax({
        url: endpointUrl + '?resource=newsletters&action=add',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            let res = (typeof response === 'string')
                ? JSON.parse(response)
                : response;

            if (res.success) {
                form.reset();
                alert(res.message);
                setTimeout(function(){
                    window.location.reload;
                }, 800)
            } else {
                alert(res.message);
            }
        },
        error: function () {
            alert("Server error. Please try again later.");
        }
    });
}

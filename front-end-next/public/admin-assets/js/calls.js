const webUrl = (window.APP_URLS && window.APP_URLS.frontend) || window.APP_BASE_URL || '';
const endpointUrl = (window.APP_URLS && window.APP_URLS.endpoint) || (webUrl + 'endpoint/');
const adminUrl = (window.APP_URLS && window.APP_URLS.admin) || (webUrl + 'admin/');
const assetUrl = (window.APP_URLS && window.APP_URLS.assets) || (webUrl + 'assets/');
const PROCESSING_TEXTS = ['sending...', 'saving...', 'updating...', 'adding...', 'redirecting...', 'please wait...'];

function getDefaultAdminLanding(role) {
    switch (String(role || '').toLowerCase()) {
        case 'manager':
            return adminUrl;
        case 'reviwer':
            return adminUrl + 'testimonials/';
        case 'author':
            return adminUrl + 'blogs/';
        case 'admin':
        default:
            return adminUrl;
    }
}

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderEmptyState(message, detail) {
    return '<div class="empty-state"><strong>' + escapeHtml(message) + '</strong><div>' + escapeHtml(detail || '') + '</div></div>';
}

function formatMoney(amount, currency) {
    var numeric = Number(amount || 0);
    var safeCurrency = (currency || 'USD').toUpperCase();
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: safeCurrency,
            maximumFractionDigits: 0
        }).format(numeric);
    } catch (e) {
        return '$' + numeric.toFixed(0);
    }
}

function renderStatusBadge(status) {
    var normalized = String(status || '').toLowerCase();
    var badge = 'bg-secondary';

    if (normalized === 'completed' || normalized === 'published') badge = 'bg-success';
    if (normalized === 'pending') badge = 'bg-warning';
    if (normalized === 'cancelled' || normalized === 'deleted') badge = 'bg-danger';

    return '<span class="badge ' + badge + '">' + escapeHtml(status || 'Unknown') + '</span>';
}

function enhanceDataTable(selector, order) {
    if (!window.jQuery || !$.fn || !$.fn.DataTable || !$(selector).length) {
        return;
    }

    if ($.fn.DataTable.isDataTable(selector)) {
        $(selector).DataTable().destroy();
    }

    $(selector).DataTable({
        order: order || [[0, 'asc']],
        responsive: true,
        pageLength: 10,
        language: {
            search: '',
            searchPlaceholder: 'Search records',
            lengthMenu: '_MENU_ rows'
        }
    });
}

function resolveAvatarPath(dp, fallback) {
    if (!dp || dp === '') {
        return fallback;
    }
    if (/^https?:\/\//i.test(dp)) {
        return dp;
    }
    return webUrl + dp.replace(/^\/+/, '');
}

function resolveBookImageUrl(imagePath) {
    if (!imagePath) {
        return assetUrl + 'img/default.webp';
    }
    if (/^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('data:')) {
        return imagePath;
    }
    if (imagePath.startsWith('assets/')) {
        return webUrl + imagePath.replace(/^\/+/, '');
    }
    return webUrl + imagePath.replace(/^\/+/, '');
}

function stripHtml(value) {
    return String(value == null ? '' : value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function updateHeaderUserUi(userData) {
    if (!userData) {
        return;
    }

    const userName = userData.name || 'User';
    const userEmail = userData.email || 'No email';
    const avatarNodes = document.querySelectorAll('.userAvatarPlace');
    const defaultAvatar = avatarNodes.length ? (avatarNodes[0].getAttribute('data-default-avatar') || (adminUrl + 'assets/images/user/avatar-2.jpg')) : (adminUrl + 'assets/images/user/avatar-2.jpg');
    const avatar = resolveAvatarPath(userData.dp, defaultAvatar);

    document.querySelectorAll('.userNamePlace').forEach(function (element) {
        element.textContent = userName;
    });

    document.querySelectorAll('.userEmailPlace').forEach(function (element) {
        element.textContent = userEmail;
    });

    avatarNodes.forEach(function (img) {
        img.src = avatar;
    });

    localStorage.setItem('userData', JSON.stringify(userData));
}

if (typeof window.uiAlert !== 'function') {
    window.uiAlert = function (message, type, title) {
        type = type || 'info';
        title = title || (type === 'error' ? 'Action Failed' : 'Done');

        if (window.Swal && typeof window.Swal.fire === 'function') {
            return window.Swal.fire({
                toast: true,
                position: 'top-end',
                icon: type,
                title: message,
                text: title,
                showConfirmButton: false,
                timer: 2600,
                timerProgressBar: true
            });
        }

        alert(message);
        return Promise.resolve();
    };
}

if (typeof window.uiConfirm !== 'function') {
    window.uiConfirm = function (message) {
        return Promise.resolve(confirm(message));
    };
}

function hideInlineMessage(messageNode) {
    if (!messageNode) {
        return;
    }
    messageNode.innerHTML = '';
    messageNode.style.display = 'none';
}

function toastMessage(message, type, title) {
    return uiAlert(message, type || 'info', title);
}

function lockSubmitButton(form) {
    if (!form) {
        return null;
    }

    var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    if (!submitButton) {
        return null;
    }

    var originalText = submitButton.tagName === 'BUTTON' ? submitButton.innerHTML : submitButton.value;
    submitButton.dataset.lockPrevDisabled = submitButton.disabled ? '1' : '0';
    submitButton.disabled = true;

    if (submitButton.tagName === 'BUTTON') {
        submitButton.innerHTML = 'Please wait...';
    } else {
        submitButton.value = 'Please wait...';
    }

    return {
        button: submitButton,
        originalText: originalText
    };
}

function unlockSubmitButton(lockObj) {
    if (!lockObj || !lockObj.button) {
        return;
    }

    var submitButton = lockObj.button;
    if (submitButton.dataset.lockPrevDisabled !== '1') {
        submitButton.disabled = false;
    }

    if (submitButton.tagName === 'BUTTON') {
        submitButton.innerHTML = lockObj.originalText;
    } else {
        submitButton.value = lockObj.originalText;
    }

    delete submitButton.dataset.lockPrevDisabled;
}

function lockFormSubmit(form, cooldownMs) {
    if (!form) {
        return false;
    }

    if (form.dataset.submitLocked === '1') {
        toastMessage('Please wait, request is already processing...', 'info', 'Hold On');
        return false;
    }

    form.dataset.submitLocked = '1';
    var lockObj = lockSubmitButton(form);

    window.setTimeout(function () {
        form.dataset.submitLocked = '0';
        unlockSubmitButton(lockObj);
        hideInlineMessage(form.querySelector('#form-message'));
    }, cooldownMs || 3000);

    return true;
}

function initMessageToastBridge() {
    document.querySelectorAll('#form-message').forEach(function (box) {
        var observer = new MutationObserver(function () {
            var message = (box.textContent || '').trim();
            if (!message) {
                return;
            }

            var normalized = message.toLowerCase();
            if (PROCESSING_TEXTS.indexOf(normalized) !== -1) {
                return;
            }

            var type = 'info';
            if (normalized.indexOf('success') !== -1) {
                type = 'success';
            } else if (normalized.indexOf('fail') !== -1 || normalized.indexOf('error') !== -1 || normalized.indexOf('wrong') !== -1) {
                type = 'error';
            }

            toastMessage(message, type, type === 'success' ? 'Success' : (type === 'error' ? 'Error' : 'Info'));
            hideInlineMessage(box);
        });

        observer.observe(box, {
            childList: true,
            subtree: true,
            characterData: true
        });
    });
}

document.addEventListener('DOMContentLoaded', initMessageToastBridge);

let loginForm = document.getElementById('login'),
    userName = document.querySelectorAll(".userNamePlace");
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        let formData = new FormData(loginForm),
            resource = loginForm.getAttribute('data-resource'),
            action = loginForm.getAttribute('data-action'),
            message = loginForm.querySelector('#form-message');

        if (!lockFormSubmit(loginForm, 3000)) {
            return;
        }
        hideInlineMessage(message);
        $.ajax({
            url: endpointUrl + '?resource=' + resource + '&action=' + action,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    loginForm.reset();
                    toastMessage('Login successful. Redirecting...', 'success', 'Success');
                    localStorage.setItem("userData", JSON.stringify(res.data));
                    setTimeout(function () {
                        window.location.href = getDefaultAdminLanding(res.data && res.data.role_name);
                    }, 1500);
                } else {
                    toastMessage(res.message || 'Login failed.', 'error', 'Login Failed');
                }
            },
            error: function (xhr, status, error) {
                toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
                console.error('AJAX Error: ' + status + error);
            }
        });
    })
}

function logoutUser() {
    $.ajax({
        url: endpointUrl + '?resource=users&action=logout',
        type: 'POST',
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                uiAlert('You have been logged out successfully.', 'success', 'Logged Out').then(function () {
                    window.location.href = adminUrl + 'auth/login.php';
                });
            } else {
                console.error('Logout failed: ' + res.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX Error: ' + status + error);
        }
    });
}
if (userName.length > 0) {
    let storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
        let userData = JSON.parse(storedUserData);
        updateHeaderUserUi(userData);
    }

    // Refresh with server-side profile data so dropdown always reflects latest DB state.
    fetchCurrentUserProfile();
}

function fetchCurrentUserProfile() {
    return fetch(endpointUrl + '?resource=users&action=getProfile', {
        credentials: 'same-origin'
    })
        .then(function (res) {
            return res.json();
        })
        .then(function (payload) {
            if (!payload || !payload.success || !payload.data) {
                return null;
            }

            const user = payload.data;
            updateHeaderUserUi(user);

            const profileName = document.getElementById('profile_name');
            const profileEmail = document.getElementById('profile_email');
            const profilePreview = document.getElementById('profile_dp_preview');

            if (profileName) profileName.value = user.name || '';
            if (profileEmail) profileEmail.value = user.email || '';
            if (profilePreview) {
                const fallback = profilePreview.getAttribute('src');
                profilePreview.src = resolveAvatarPath(user.dp, fallback);
            }

            return user;
        })
        .catch(function () {
            return null;
        });
}

function updateProfileInfo(e) {
    e.preventDefault();
    const form = document.getElementById('updateProfileForm');
    const messageBox = document.getElementById('profile-form-message');
    const formData = new FormData(form);

    if (!lockFormSubmit(form, 3000)) {
        return;
    }
    hideInlineMessage(messageBox);

    $.ajax({
        url: endpointUrl + '?resource=users&action=updateProfile',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            const res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('Profile updated successfully.', 'success', 'Updated');
                updateHeaderUserUi(res.data || {});
                fetchCurrentUserProfile();
            } else {
                toastMessage('Failed to update profile: ' + (res.message || 'Unknown error'), 'error', 'Update Failed');
            }
        },
        error: function (xhr, status, error) {
            toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
            console.error('AJAX Error: ' + status + error);
        }
    });
}

function updateMyPassword(e) {
    e.preventDefault();
    const form = document.getElementById('updateMyPassForm');
    const messageBox = document.getElementById('profile-pass-message');
    const formData = new FormData(form);

    if (!lockFormSubmit(form, 3000)) {
        return;
    }
    hideInlineMessage(messageBox);

    $.ajax({
        url: endpointUrl + '?resource=users&action=updateProfilePass',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            const res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('Password updated successfully.', 'success', 'Updated');
                form.reset();
            } else {
                toastMessage('Failed to update password: ' + (res.message || 'Unknown error'), 'error', 'Update Failed');
            }
        },
        error: function (xhr, status, error) {
            toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
            console.error('AJAX Error: ' + status + error);
        }
    });
}

function fetchTestimonials() {
    let testimonialsContainer = document.getElementById('testimonials');
    let data;
    if (testimonialsContainer) {
        $.ajax({
            url: endpointUrl + '?resource=testimonials&action=get',
            type: 'GET',
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    let testimonials = res.data;
                    let htmlContent = '';
                    testimonials.forEach(function (testimonial) {
                        htmlContent += `
                            <tr>
                                <td>${testimonial.reviewer_name}</td>
                                <td class="review_text">${testimonial.review}</td>
                                <td>${testimonial.added_by}</td>
                                <td>
                                    <a href="javascript:;" onclick="openModal(${testimonial.id})" class="btn btn-primary btn-sm">
                                        <span class="pc-micon"><i class="ti ti-edit-circle"></i></span>
                                    </a>
                                    <button onclick="deleteTestimonial(${testimonial.id})" class="btn btn-danger btn-sm">
                                        <span class="pc-micon"><i class="ti ti-trash"></i></span>
                                    </button>
                                </td>
                            </tr>
                        `;
                    });
                    testimonialsContainer.innerHTML = htmlContent;
                    enhanceDataTable('#order-table', [[0, 'asc']]);
                } else {
                    testimonialsContainer.innerHTML = '<tr><td colspan="4">' + renderEmptyState('No testimonials found', 'New reviews will appear here after they are added.') + '</td></tr>';
                }
            },
            error: function (xhr, status, error) {
                testimonialsContainer.innerHTML = '<tr><td colspan="4">' + renderEmptyState('Unable to load testimonials', 'Please try again in a moment.') + '</td></tr>';
                console.error('AJAX Error: ' + status + error);
            }
        });
    }
}

function deleteTestimonial(testimonialId) {
    uiConfirm('Are you sure you want to delete this testimonial?', 'Delete Testimonial').then(function (confirmed) {
        if (!confirmed) {
            return;
        }

        $.ajax({
            url: endpointUrl + '?resource=testimonials&action=delete&id=' + testimonialId,
            type: 'POST',
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    uiAlert('Testimonial deleted successfully.', 'success', 'Deleted');
                    location.reload();
                } else {
                    uiAlert('Failed to delete testimonial: Contact Developer', 'error', 'Delete Failed');
                }
            },
            error: function (xhr, status, error) {
                uiAlert('AJAX Error: ' + status + error, 'error', 'Server Error');
            }
        });
    });
}

function getTestimonialById(testimonialId) {
    let testimonialData = null;
    $.ajax({
        url: endpointUrl + '?resource=testimonials&action=get&id=' + testimonialId,
        type: 'GET',
        async: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                testimonialData = res.data;
            } else {
                console.error('Failed to fetch testimonial: ' + res.message);
            }
        }
    });
    return testimonialData !== null ? testimonialData : false;
}

function openModal(id) {
    let modal = document.getElementById("testimonialModal");
    let testimonial = getTestimonialById(id);
    if (testimonial) {
        modal.querySelector("#reviewer_name").value = testimonial.reviewer_name;
        modal.querySelector("#review").value = testimonial.review;
        modal.querySelector("#testimonial_id").value = testimonial.id;
    }
    var myModal = new bootstrap.Modal(modal);
    myModal.show();
}

function closeModal(id) {
    let modal = document.getElementById(id);
    var modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
}

function updateTestimonial(e) {
    e.preventDefault();
    let form = document.getElementById('updateTestimonial');
    let messageBox = form.querySelector('#form-message');
    let id = form.querySelector('#testimonial_id').value;
    let formData = new FormData(form);
    if (!lockFormSubmit(form, 3000)) {
        return;
    }
    hideInlineMessage(messageBox);
    $.ajax({
        url: endpointUrl + '?resource=testimonials&action=update&id=' + id,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('Testimonial updated successfully.', 'success', 'Updated');
                setTimeout(function () {
                    location.reload();
                }, 1500);
            } else {
                toastMessage('Failed to update testimonial: ' + (res.message || 'Unknown error'), 'error', 'Update Failed');
            }
        },
        error: function (xhr, status, error) {
            toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
            console.log('AJAX Error: ' + status + error);
        }
    });

}

function addTestimonial(e) {
    e.preventDefault();
    let form = document.getElementById('addTestimonial');
    let messageBox = form.querySelector('#form-message');

    let formData = new FormData(form);
    if (!lockFormSubmit(form, 3000)) {
        return;
    }
    hideInlineMessage(messageBox);
    $.ajax({
        url: endpointUrl + '?resource=testimonials&action=add',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('Testimonial added successfully.', 'success', 'Added');
                setTimeout(function () {
                    if (form.querySelector("#isStay").checked) {
                        location.reload();
                    } else {
                        window.location.href = adminUrl + "testimonials/"
                    }
                }, 1500);
            } else {
                toastMessage('Failed to add testimonial: ' + (res.message || 'Unknown error'), 'error', 'Add Failed');
            }
        },
        error: function (xhr, status, error) {
            toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
            console.log('AJAX Error: ' + status + error);
        }
    });
}

function fetchUsers() {
    let usersContainer = document.getElementById('users');
    let data;
    if (usersContainer) {
        $.ajax({
            url: endpointUrl + '?resource=users&action=get',
            type: 'GET',
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    let users = res.data;
                    let htmlContent = '';
                    users.forEach(function (user) {
                        htmlContent += `
                            <tr>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>${user.role}</td>
                                <td>${user.ministry == null ? "Not applicable" : user.ministry}</td>
                                <td>
                                    <a href="${webUrl}admin/users/update-pass.php?uid=${user.id}" class="btn btn-primary btn-sm">
                                        <span class="pc-micon"><i class="ti ti-edit-circle"></i></span> Password
                                    </a>
                                    <a href="javascript:;" onclick="openModalForUser(${user.id})" class="btn btn-primary btn-sm">
                                        <span class="pc-micon"><i class="ti ti-edit-circle"></i></span> Details
                                    </a>
                                    <button onclick="deleteUser(${user.id})" class="btn btn-danger btn-sm">
                                        <span class="pc-micon"><i class="ti ti-trash"></i></span>
                                    </button>
                                </td>
                            </tr>
                        `;
                    });
                    usersContainer.innerHTML = htmlContent;
                    enhanceDataTable('#order-table', [[2, 'asc']]);
                } else {
                    usersContainer.innerHTML = '<tr><td colspan="5">' + renderEmptyState('No staff members found', 'Create a staff account to assign roles and ministries.') + '</td></tr>';
                }
            },
            error: function (xhr, status, error) {
                usersContainer.innerHTML = '<tr><td colspan="5">' + renderEmptyState('Unable to load staff records', 'Please try again later.') + '</td></tr>';
                console.error('AJAX Error: ' + status + error);
            }
        });
    }
}

function deleteUser(userId) {
    uiConfirm('Are you sure you want to delete this user?', 'Delete User').then(function (confirmed) {
        if (!confirmed) {
            return;
        }

        $.ajax({
            url: endpointUrl + '?resource=users&action=delete&id=' + userId,
            type: 'POST',
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    uiAlert('User deleted successfully.', 'success', 'Deleted');
                    location.reload();
                } else {
                    uiAlert('Failed to delete user: Contact Developer', 'error', 'Delete Failed');
                }
            },
            error: function (xhr, status, error) {
                uiAlert('AJAX Error: ' + status + error, 'error', 'Server Error');
            }
        });
    });
}

function getUserById(userId) {
    let userData = null;
    $.ajax({
        url: endpointUrl + '?resource=users&action=get&id=' + userId,
        type: 'GET',
        async: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                userData = res.data;
            } else {
                console.error('Failed to fetch user: ' + res.message);
            }
        }
    });
    return userData !== null ? userData : false;
}

function fetchRoles() {
    let roleSelect = document.getElementById('role');
    if (roleSelect) {
        $.ajax({
            url: endpointUrl + '?resource=roles&action=get',
            type: 'GET',
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    let roles = res.data;
                    let htmlContent = '';
                    roles.forEach(function (role) {
                        htmlContent += `
                            <option value="${role.id}">${role.name}</option>
                        `;
                    });
                    roleSelect.innerHTML = htmlContent;
                } else {
                    roleSelect.innerHTML = '<p>No users found.</p>';
                }
            },
            error: function (xhr, status, error) {
                roleSelect.innerHTML = '<p>Failed to load users. Please try again later.</p>';
                console.error('AJAX Error: ' + status + error);
            }
        });
    }
}

function fetchMinistries(option) {
    let ministrySelect = document.getElementById('ministry');
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
                        if (option == 'main') {
                            htmlContent += `
                                <tr>
                                    <td>${ministry.name}</td>
                                    <td>
                                        <button onclick="deleteMinistry(${ministry.id})" class="btn btn-danger btn-sm">
                                        <span class="pc-micon"><i class="ti ti-trash"></i></span> Delete
                                        </button>
                                    </td>
                                </tr>
                            `;
                        } else {
                            htmlContent += `
                                <option value="${ministry.id}">${ministry.name}</option>
                            `;
                        }
                    });
                    ministrySelect.innerHTML = htmlContent;
                    if (option == 'main') {
                        enhanceDataTable('#order-table', [[0, 'asc']]);
                    }
                } else {
                    ministrySelect.innerHTML = option == 'main'
                        ? '<tr><td colspan="2">' + renderEmptyState('No ministries found', 'Create a ministry to organize authors and content.') + '</td></tr>'
                        : '<option value="">No ministries available</option>';
                }
            },
            error: function (xhr, status, error) {
                ministrySelect.innerHTML = option == 'main'
                    ? '<tr><td colspan="2">' + renderEmptyState('Unable to load ministries', 'Please try again later.') + '</td></tr>'
                    : '<option value="">Unable to load ministries</option>';
                console.error('AJAX Error: ' + status + error);
            }
        });
    }
}

function openModalForUser(id) {
    let modal = document.getElementById("userModal");
    let user = getUserById(id);
    if (user) {
        modal.querySelector("#name").value = user.name;
        modal.querySelector("#role").value = user.role;
        modal.querySelector("#user_id").value = user.id;
        checkMinistry(user.role);
        modal.querySelector("#ministry").value = user.ministry == null ? "Not Applicable" : user.ministry;
    }
    var myModal = new bootstrap.Modal(modal);
    myModal.show();
}

function checkMinistry(selectElement) {
    const value = selectElement;
    let ministryBox = document.getElementById("ministryBox");
    if (value == 3) {
        ministryBox.style.display = "block";
        fetchMinistries();
    } else {
        ministryBox.style.display = "none";
        ministryBox.querySelector("#ministry").innerHTML = `<option value="0"></option>`;
    }
}

function updateUser(event) {
    event.preventDefault();
    let form = document.getElementById('updateUser');
    let messageBox = form.querySelector('#form-message');
    let id = form.querySelector('#user_id').value;
    let formData = new FormData(form);
    if (!lockFormSubmit(form, 3000)) {
        return;
    }
    hideInlineMessage(messageBox);
    // console.log(...formData);
    $.ajax({
        url: endpointUrl + '?resource=users&action=update&id=' + id,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('User updated successfully.', 'success', 'Updated');
                setTimeout(function () {
                    location.reload();
                }, 1500);
            } else {
                toastMessage('Failed to update user: ' + (res.message || 'Unknown error'), 'error', 'Update Failed');
            }
        },
        error: function (xhr, status, error) {
            toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
            console.log('AJAX Error: ' + status + error);
        }
    });
}

function checkPass(id, value, textBox, btn) {
    let parentBox = document.getElementById(id);
    let textArea = document.getElementById(textBox);
    if (parentBox.value == value) {
        textArea.textContent = "Password matched!"
        if (btn != null) {
            document.getElementById(btn).removeAttribute("disabled", "")
        }
    } else {
        if (btn != null) {
            document.getElementById(btn).setAttribute("disabled", "")
        }
        textArea.textContent = "Password not matched!"
    }
}
function showPass(passId, confirmId) {
    let passInput = document.getElementById(passId),
        confirmInput = document.getElementById(confirmId);

    if (passInput.type == "password") {
        passInput.type = "text";
        confirmInput.type = "text";
    } else {
        passInput.type = "password";
        confirmInput.type = "password";
    }
}

function updatePass(e) {
    e.preventDefault();
    let form = document.getElementById("updatePass");
    let messageBox = form.querySelector('#form-message');
    let id = form.querySelector('#user_id').value;
    let formData = new FormData(form);
    if (!lockFormSubmit(form, 3000)) {
        return;
    }
    hideInlineMessage(messageBox);
    // console.log(...formData);
    $.ajax({
        url: endpointUrl + '?resource=users&action=updatePass&id=' + id,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('Password updated successfully.', 'success', 'Updated');
                setTimeout(function () {
                    window.location.href = adminUrl + "users/"
                }, 1500);
            } else {
                toastMessage('Failed to update user password: ' + (res.message || 'Unknown error'), 'error', 'Update Failed');
            }
        },
        error: function (xhr, status, error) {
            toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
            console.log('AJAX Error: ' + status + error);
        }
    });

}

function addUser(e) {
    e.preventDefault();
    let form = document.getElementById('addUser');
    let messageBox = form.querySelector('#form-message');

    let formData = new FormData(form);
    if (!lockFormSubmit(form, 3000)) {
        return;
    }
    hideInlineMessage(messageBox);
    $.ajax({
        url: endpointUrl + '?resource=users&action=add',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('User added successfully.', 'success', 'Added');
                setTimeout(function () {
                    if (form.querySelector("#isStay").checked) {
                        location.reload();
                    } else {
                        window.location.href = adminUrl + "users/"
                    }
                }, 1500);
            } else {
                toastMessage('Failed to add user: ' + (res.message || 'Unknown error'), 'error', 'Add Failed');
            }
        },
        error: function (xhr, status, error) {
            toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
            console.log('AJAX Error: ' + status + error);
        }
    });
}

function deleteMinistry(ministryId) {
    uiConfirm('Are you sure you want to delete this ministry?', 'Delete Ministry').then(function (confirmed) {
        if (!confirmed) {
            return;
        }

        $.ajax({
            url: endpointUrl + '?resource=ministry&action=delete&id=' + ministryId,
            type: 'POST',
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    uiAlert('Ministry deleted successfully.', 'success', 'Deleted');
                    location.reload();
                } else {
                    uiAlert('Failed to delete ministry: Contact Developer', 'error', 'Delete Failed');
                }
            },
            error: function (xhr, status, error) {
                uiAlert('AJAX Error: ' + status + error, 'error', 'Server Error');
            }
        });
    });
}

function addMinistry(e) {
    e.preventDefault();
    let form = document.getElementById('addMinistry');
    let messageBox = form.querySelector('#form-message');

    let formData = new FormData(form);
    if (!lockFormSubmit(form, 3000)) {
        return;
    }
    hideInlineMessage(messageBox);
    $.ajax({
        url: endpointUrl + '?resource=ministry&action=add',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('Ministry added successfully.', 'success', 'Added');
                setTimeout(function () {
                    location.reload();
                }, 1500);
            } else {
                toastMessage('Failed to add ministry: ' + (res.message || 'Unknown error'), 'error', 'Add Failed');
            }
        },
        error: function (xhr, status, error) {
            toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
            console.log('AJAX Error: ' + status + error);
        }
    });
}

function addDonation(e) {
    e.preventDefault();
    let form = document.getElementById('addDonation');
    let messageBox = form.querySelector('#form-message');
    let formData = new FormData(form);
    if (!lockFormSubmit(form, 3000)) {
        return;
    }
    hideInlineMessage(messageBox);
    $.ajax({
        url: endpointUrl + '?resource=donations&action=add',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('Donation added successfully.', 'success', 'Added');
                setTimeout(function () {
                    if (form.querySelector("#isStay").checked) {
                        location.reload();
                    } else {
                        window.location.href = adminUrl + "donations/"
                    }
                }, 1500);
            } else {
                toastMessage('Failed to add donation: ' + (res.message || 'Unknown error'), 'error', 'Add Failed');
            }
        },
        error: function (xhr, status, error) {
            toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
            console.log('AJAX Error: ' + status + error);
        }
    });
}

function fetchDonations() {
    let donationsContainer = document.getElementById('donations');
    if (donationsContainer) {
        $.ajax({
            url: endpointUrl + '?resource=donations&action=get',
            type: 'GET',
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    let donations = res.data;
                    let htmlContent = '';
                    if (!donations.length) {
                        donationsContainer.innerHTML = renderEmptyState('No campaigns yet', 'Create your first donation campaign to start tracking progress.');
                        return;
                    }
                    donations.forEach(function (donation) {
                        let target = Number(donation.target_amount || 0);
                        let raised = Number(donation.raised_amount || 0);
                        let progress = target > 0 ? Math.min(100, (raised / target) * 100) : 0;
                        let imagePath = donation.placeholder ? assetUrl + 'img/uploads/' + donation.placeholder : assetUrl + 'images/user/avatar-2.jpg';
                        htmlContent += `
                            <div class="col-12 col-md-6 col-lg-4">
                                <div class="donation-item">
                                    <div class="donation-cover">
                                        <img src="${imagePath}" alt="${escapeHtml(donation.title)}" class="w-100">
                                    </div>
                                    <div class="content">
                                        <div class="donation-tags">
                                            <span class="badge bg-secondary">Campaign</span>
                                            <span class="badge bg-secondary">${progress.toFixed(1)}% funded</span>
                                            ${donation.end_date == '0000-00-00' || donation.end_date == null ? '' : `<span class="badge bg-secondary">Ends ${donation.end_date}</span>`}
                                        </div>
                                        <h4 class="mt-3">${donation.title}</h4>
                                        <p>${donation.description || 'No campaign summary provided yet.'}</p>
                                        <div class="progress mt-3" style="height:10px;">
                                            <div class="progress-bar bg-primary" role="progressbar" style="width:${progress.toFixed(1)}%"></div>
                                        </div>
                                        <div class="stat-pair mt-2"><span>Progress</span><strong>${progress.toFixed(1)}%</strong></div>
                                        <div class="price-box donation-tags">
                                            <div class="detail-list-item"><span>Target</span><strong>${formatMoney(target, 'USD')}</strong></div>
                                            <div class="detail-list-item"><span>Raised</span><strong>${formatMoney(raised, 'USD')}</strong></div>
                                        </div>
                                        <div class="date-box donation-tags">
                                            <div class="detail-list-item"><span>Start</span><strong>${donation.start_date || '-'}</strong></div>
                                            ${donation.end_date == '0000-00-00' || donation.end_date == null ? '' : `<div class="detail-list-item"><span>End</span><strong>${donation.end_date}</strong></div>`}
                                        </div>
                                        <div class="actions">
                                            <a href="javascript:;" onclick="openModalForDonation(${donation.id})" class="btn btn-primary btn-sm">
                                                <span class="pc-micon"><i class="ti ti-edit-circle"></i></span> Edit
                                            </a>
                                            <button onclick="delDonation(${donation.id})" class="btn btn-danger btn-sm">
                                                <span class="pc-micon"><i class="ti ti-trash"></i></span> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    donationsContainer.innerHTML = htmlContent;
                } else {
                    donationsContainer.innerHTML = renderEmptyState('No campaigns available', 'Create a donation campaign to populate this view.');
                }
            },
            error: function (xhr, status, error) {
                donationsContainer.innerHTML = renderEmptyState('Unable to load donations', 'Please try again later.');
                console.error('AJAX Error: ' + status + error);
            }
        });
    }
}

function openModalForDonation(id) {
    window.location.href = adminUrl + 'donations/update.php?id=' + id;
}

function getDonationById(donationId) {
    let donationData = null;
    $.ajax({
        url: endpointUrl + '?resource=donations&action=get&id=' + donationId,
        type: 'GET',
        async: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                donationData = res.data;
            } else {
                console.error('Failed to fetch user: ' + res.message);
            }
        }
    });
    return donationData !== null ? donationData : false;
}

function updateDonation(e) {
    e.preventDefault();
    let form = document.getElementById("updateDonation");
    let messageBox = form.querySelector('#form-message');
    let id = form.querySelector('#donation_id').value;
    let formData = new FormData(form);
    if (!lockFormSubmit(form, 3000)) {
        return;
    }
    hideInlineMessage(messageBox);
    // console.log(...formData);
    $.ajax({
        url: endpointUrl + '?resource=donations&action=update&id=' + id,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('Donation updated successfully.', 'success', 'Updated');
                setTimeout(function () {
                    if (document.body.classList.contains('donation-edit-page')) {
                        window.location.href = adminUrl + 'donations/';
                    } else {
                        location.reload();
                    }
                }, 1500);
            } else {
                toastMessage('Failed to update donation: ' + (res.message || 'Unknown error'), 'error', 'Update Failed');
            }
        },
        error: function (xhr, status, error) {
            toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
            console.log('AJAX Error: ' + status + error);
        }
    });
}

function delDonation(donationId) {
    uiConfirm('Are you sure you want to delete this donation?', 'Delete Donation').then(function (confirmed) {
        if (!confirmed) {
            return;
        }

        $.ajax({
            url: endpointUrl + '?resource=donations&action=delete&id=' + donationId,
            type: 'POST',
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    uiAlert('Donation deleted successfully.', 'success', 'Deleted');
                    location.reload();
                } else {
                    uiAlert('Failed to delete donation: Contact Developer', 'error', 'Delete Failed');
                }
            },
            error: function (xhr, status, error) {
                uiAlert('AJAX Error: ' + status + error, 'error', 'Server Error');
            }
        });
    });
}

function initDonationEditPage(donationId) {
    var form = document.getElementById('updateDonation');
    if (!form) {
        return;
    }

    var donation = getDonationById(donationId);
    if (!donation) {
        toastMessage('Unable to load donation details.', 'error', 'Load Failed');
        return;
    }

    form.querySelector('#title').value = donation.title || '';
    form.querySelector('#description').value = donation.description || '';
    form.querySelector('#target_amount').value = donation.target_amount || '';
    form.querySelector('#start_date').value = donation.start_date || '';
    form.querySelector('#end_date').value = donation.end_date && donation.end_date !== '0000-00-00' ? donation.end_date : '';
    form.querySelector('#donation_id').value = donation.id;

    var preview = document.getElementById('placeholderImage');
    if (preview) {
        preview.src = donation.placeholder ? (assetUrl + 'img/uploads/' + donation.placeholder) : preview.getAttribute('data-fallback-src');
    }
}

function fetchBooksAdmin() {
    const container = document.getElementById('books-admin-list');
    if (!container) {
        return;
    }

    container.innerHTML = '';

    $.ajax({
        url: endpointUrl + '?resource=books&action=get',
        type: 'GET',
        success: function (response) {
            const res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (!res.success || !Array.isArray(res.data) || !res.data.length) {
                container.innerHTML = renderEmptyState('No books found', 'Add a book to populate the public books page.');
                return;
            }

            let htmlContent = '';
            res.data.forEach(function (book) {
                const imagePath = resolveBookImageUrl(book.cover_image);
                const previewText = stripHtml(book.description).slice(0, 220);
                const status = Number(book.is_deleted) === 1 ? 'Deleted' : (Number(book.is_published) === 1 ? 'Published' : 'Draft');

                htmlContent += `
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="donation-item h-100">
                            <div class="donation-cover">
                                <img src="${imagePath}" alt="${escapeHtml(book.title)}" class="card-img-top" style="height: 280px; object-fit: contain;">
                            </div>
                            <div class="card-body">
                                <div class="donation-tags">
                                    ${renderStatusBadge(status)}
                                    <span class="badge bg-secondary">Order ${Number(book.sort_order || 0)}</span>
                                    ${book.language ? `<span class="badge bg-secondary">${escapeHtml(book.language)}</span>` : ''}
                                </div>
                                <h3 class="card-title mt-3">${escapeHtml(book.title)}</h3>
                                <p>${escapeHtml(previewText || 'No summary provided yet.')}</p>
                                <div class="detail-list mt-3">
                                    <div class="detail-list-item">
                                        <span>Author</span>
                                        <strong>${escapeHtml(book.author_name || 'Boksoon Kim')}</strong>
                                    </div>
                                    <div class="detail-list-item">
                                        <span>Button</span>
                                        <strong>${escapeHtml(book.link_label || 'Check Out on Amazon')}</strong>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer d-flex justify-content-between gap-2">
                                <a href="${adminUrl}books/update.php?id=${book.id}" class="btn btn-sm btn-primary">Edit</a>
                                <button class="btn btn-sm btn-danger" onclick="deleteBook(${book.id})">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = htmlContent;
        },
        error: function () {
            container.innerHTML = renderEmptyState('Unable to load books', 'Please try again later.');
        }
    });
}

function addBook(e) {
    e.preventDefault();
    const form = document.getElementById('addBookForm');
    if (!form || !lockFormSubmit(form, 3000)) {
        return;
    }

    hideInlineMessage(document.getElementById('form-message'));
    const formData = new FormData(form);

    $.ajax({
        url: endpointUrl + '?resource=books&action=add',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            const res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('Book saved successfully.', 'success', 'Added');
                setTimeout(function () {
                    window.location.href = adminUrl + 'books/';
                }, 800);
            } else {
                toastMessage(res.message || 'Error saving book.', 'error', 'Add Failed');
            }
        },
        error: function () {
            toastMessage('Server error', 'error', 'Server Error');
        }
    });
}

function getBookById(bookId) {
    let bookData = null;
    $.ajax({
        url: endpointUrl + '?resource=books&action=get&id=' + bookId,
        type: 'GET',
        async: false,
        success: function (response) {
            const res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                bookData = res.data;
            }
        }
    });
    return bookData;
}

function updateBook(e) {
    e.preventDefault();
    const form = document.getElementById('updateBookForm');
    if (!form || !lockFormSubmit(form, 3000)) {
        return;
    }

    hideInlineMessage(document.getElementById('form-message'));
    const id = form.querySelector('#book_id').value;
    const formData = new FormData(form);

    $.ajax({
        url: endpointUrl + '?resource=books&action=update&id=' + id,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            const res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('Book updated successfully.', 'success', 'Updated');
                setTimeout(function () {
                    window.location.href = adminUrl + 'books/';
                }, 800);
            } else {
                toastMessage(res.message || 'Error updating book.', 'error', 'Update Failed');
            }
        },
        error: function () {
            toastMessage('Server error', 'error', 'Server Error');
        }
    });
}

function deleteBook(bookId) {
    uiConfirm('Are you sure you want to delete this book?', 'Delete Book').then(function (confirmed) {
        if (!confirmed) {
            return;
        }

        $.ajax({
            url: endpointUrl + '?resource=books&action=delete&id=' + bookId,
            type: 'POST',
            success: function (response) {
                const res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    uiAlert('Book deleted successfully.', 'success', 'Deleted');
                    fetchBooksAdmin();
                } else {
                    uiAlert(res.message || 'Failed to delete book.', 'error', 'Delete Failed');
                }
            },
            error: function () {
                uiAlert('Server error while deleting book.', 'error', 'Server Error');
            }
        });
    });
}

function initBookEditPage(bookId) {
    const form = document.getElementById('updateBookForm');
    if (!form) {
        return;
    }

    const book = getBookById(bookId);
    if (!book) {
        toastMessage('Unable to load book details.', 'error', 'Load Failed');
        return;
    }

    form.querySelector('#title').value = book.title || '';
    form.querySelector('#description').value = book.description || '';
    form.querySelector('#link_url').value = book.link_url || '';
    form.querySelector('#link_label').value = book.link_label || '';
    form.querySelector('#language').value = book.language || '';
    form.querySelector('#author_name').value = book.author_name || 'Boksoon Kim';
    form.querySelector('#sort_order').value = book.sort_order || 0;
    form.querySelector('#is_published').value = Number(book.is_published || 0);

    const preview = document.getElementById('bookCoverPreview');
    if (preview) {
        preview.src = resolveBookImageUrl(book.cover_image) || preview.getAttribute('data-fallback-src');
    }
}

function fetchBlogs(id) {
    const container = document.getElementById(id);
    if (!container) {
        return;
    }

    container.innerHTML = "";

    fetch(`${webUrl}endpoint/?resource=blogs&action=get`)
        .then(res => res.json())
        .then(response => {

            if (!response.success || response.data.length === 0) {
                container.innerHTML = renderEmptyState('No blog posts yet', 'Start with a new story, update, or editorial note.');
                return;
            }

            response.data.forEach(blog => {
                const banner = blog.banner_image ? (webUrl + blog.banner_image.replace(/^\/+/, '')) : (assetUrl + 'images/user/avatar-2.jpg');
                container.innerHTML += `
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="donation-item h-100">

                            <div class="donation-cover">
                                <img src="${banner}"
                                     class="card-img-top"
                                     style="height:100%;object-fit:cover">
                            </div>

                            <div class="card-body">
                                <span class="badge bg-secondary">Article</span>
                                <h3 class="card-title mt-3">${blog.title}</h3>

                                ${blog.ministry_name
                        ? `<span class="badge bg-primary p-1 mt-2">${blog.ministry_name}</span>`
                        : ""
                    }
                                ${blog.is_published === "1"
                        ? `<span class="badge bg-success p-1 mt-2">Published</span>`
                        : `<span class="badge bg-secondary p-1 mt-2">Draft</span>`
                    }
                                ${blog.is_deleted === "1"
                        ? `<span class="badge bg-danger p-1 mt-2">Deleted</span>`
                        : ``
                    }
                            </div>

                            <!-- ACTION BUTTONS -->
                            <div class="card-footer d-flex justify-content-between gap-2">
                                <a href="${adminUrl}blogs/update.php?id=${blog.id}"
                                    class="btn btn-sm btn-primary">
                                    Edit
                                </a>

                                <button class="btn btn-sm btn-danger"
                                    onclick="deleteBlog(${blog.id})">
                                    Delete
                                </button>
                            </div>

                        </div>
                    </div>
                `;
            });
        })
        .catch(err => console.error("Blog Fetch Error:", err));
}

function fetchBlogById(id, inputs) {
    let [title, ministry, status, content] = inputs;

    $.ajax({
        url: endpointUrl + '?resource=blogs&action=get&id=' + id,
        type: 'GET',
        dataType: 'json',
        success: function (res) {

            if (!res.success) {
                console.error('Failed to fetch blog: ' + res.message);
                return;
            }

            const data = res.data;

            console.log(data);

            // Title
            $('#' + title).val(data.title);

            // Ministry
            $('#' + ministry).val(data.ministry_id).trigger('change');

            // Publish status
            $('#' + status).val(data.is_published).trigger('change');

            // CKEditor 5 content
            if (blogEditor) {
                blogEditor.setData(data.content);
            } else {
                console.error('CKEditor 5 not ready yet');
            }
        }
    });
}



function updateBlogs(id) {
    document.getElementById("updateBlog").addEventListener("submit", function (e) {
        e.preventDefault();

        const form = document.getElementById("updateBlog");
        if (!lockFormSubmit(form, 3000)) {
            return;
        }
        hideInlineMessage(document.getElementById('form-message'));
        if (window.blogEditor && typeof window.blogEditor.updateSourceElement === 'function') {
            window.blogEditor.updateSourceElement();
        }
        const formData = new FormData(form);

        fetch(endpointUrl + "?resource=blogs&action=update&id=" + id, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(response => {
                if (response.success) {
                    toastMessage('Blog saved successfully.', 'success', 'Updated');
                    setTimeout(function () {
                        window.location.href = adminUrl + "blogs";
                    }, 800)
                } else {
                    toastMessage(response.message || 'Error saving blog.', 'error', 'Update Failed');
                }
            })
            .catch(error => {
                console.error(error);
                toastMessage('Server error', 'error', 'Server Error');
            });
    });

}

function deleteBlog(id) {
    uiConfirm('Are you sure you want to delete this blog?', 'Delete Blog').then(function (confirmed) {
        if (!confirmed) {
            return;
        }

        $.ajax({
            url: endpointUrl + '?resource=blogs&action=delete&id=' + id,
            type: 'POST',
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    uiAlert('Blog deleted successfully.', 'success', 'Deleted');
                    location.reload();
                } else {
                    uiAlert('Failed to delete blog: Contact Developer', 'error', 'Delete Failed');
                }
            },
            error: function (xhr, status, error) {
                uiAlert('AJAX Error: ' + status + error, 'error', 'Server Error');
            }
        });
    });
}

function addBlogs() {
    document.getElementById("addBlogForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem("userData"));
        const isAdmin = user && user.role_name === "admin";

        const form = document.getElementById("addBlogForm");
        if (!lockFormSubmit(form, 3000)) {
            return;
        }
        hideInlineMessage(document.getElementById('form-message'));
        if (window.blogEditor && typeof window.blogEditor.updateSourceElement === 'function') {
            window.blogEditor.updateSourceElement();
        }
        const formData = new FormData(form);

        fetch(endpointUrl + "?resource=blogs&action=add", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(response => {
                if (response.success) {
                    toastMessage('Blog saved successfully.', 'success', 'Added');
                    form.reset();
                    setTimeout(function () {
                        window.location.href = adminUrl + "blogs";
                    }, 800)
                } else {
                    toastMessage(response.message || 'Error saving blog.', 'error', 'Add Failed');
                }
            })
            .catch(error => {
                console.error(error);
                toastMessage('Server error', 'error', 'Server Error');
            });
    });
}

function fetchContacts() {
    let usersContainer = document.getElementById('contacts');
    let data;
    if (usersContainer) {
        $.ajax({
            url: endpointUrl + '?resource=contacts&action=get',
            type: 'GET',
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    let users = res.data;
                    let htmlContent = '';
                    users.forEach(function (user) {
                        htmlContent += `
                            <tr>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>${user.number}</td>
                                <td>${user.message}</td>
                            </tr>
                        `;
                    });
                    usersContainer.innerHTML = htmlContent;
                    enhanceDataTable('#order-table', [[0, 'asc']]);
                } else {
                    usersContainer.innerHTML = '<tr><td colspan="4">' + renderEmptyState('No contact submissions', 'Incoming messages will appear here.') + '</td></tr>';
                }
            },
            error: function (xhr, status, error) {
                usersContainer.innerHTML = '<tr><td colspan="4">' + renderEmptyState('Unable to load contacts', 'Please try again later.') + '</td></tr>';
                console.error('AJAX Error: ' + status + error);
            }
        });
    }
}


function fetchNewsLetters() {
    let usersContainer = document.getElementById('NewsLetters');
    let data;
    if (usersContainer) {
        $.ajax({
            url: endpointUrl + '?resource=newsletters&action=get',
            type: 'GET',
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    let users = res.data;
                    let htmlContent = '';
                    users.forEach(function (user, index) {
                        htmlContent += `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${user.email}</td>
                            </tr>
                        `;
                    });
                    usersContainer.innerHTML = htmlContent;
                    enhanceDataTable('#order-table', [[0, 'asc']]);
                } else {
                    usersContainer.innerHTML = '<tr><td colspan="2">' + renderEmptyState('No newsletter signups', 'Subscriber emails will appear here.') + '</td></tr>';
                }
            },
            error: function (xhr, status, error) {
                usersContainer.innerHTML = '<tr><td colspan="2">' + renderEmptyState('Unable to load newsletter signups', 'Please try again later.') + '</td></tr>';
                console.error('AJAX Error: ' + status + error);
            }
        });
    }
}

function fetchDonors() {
    let donorsContainer = document.getElementById('donors');
    if (!donorsContainer) {
        return;
    }

    $.ajax({
        url: endpointUrl + '?resource=donors&action=get',
        type: 'GET',
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                let donors = res.data;
                let htmlContent = '';

                donors.forEach(function (donor) {
                    htmlContent += `
                        <tr>
                            <td>${donor.name}</td>
                            <td>${donor.email}</td>
                            <td>${donor.phone_number || '-'}</td>
                            <td>${String(donor.is_hidden) === '1' ? '<span class="badge bg-warning">Yes</span>' : '<span class="badge bg-success">No</span>'}</td>
                            <td>
                                <a href="javascript:;" onclick="openModalForDonor(${donor.id})" class="btn btn-primary btn-sm">
                                    <span class="pc-micon"><i class="ti ti-edit-circle"></i></span> Edit
                                </a>
                                <button onclick="deleteDonor(${donor.id})" class="btn btn-danger btn-sm">
                                    <span class="pc-micon"><i class="ti ti-trash"></i></span> Delete
                                </button>
                            </td>
                        </tr>
                    `;
                });

                donorsContainer.innerHTML = htmlContent;
                enhanceDataTable('#order-table', [[0, 'asc']]);
            } else {
                donorsContainer.innerHTML = '<tr><td colspan="5">' + renderEmptyState('No donors found', 'Create a donor record to build your supporter base.') + '</td></tr>';
            }
        },
        error: function (xhr, status, error) {
            donorsContainer.innerHTML = '<tr><td colspan="5">' + renderEmptyState('Unable to load donors', 'Please try again later.') + '</td></tr>';
            console.error('AJAX Error: ' + status + error);
        }
    });
}

function getDonorById(donorId) {
    let donorData = null;
    $.ajax({
        url: endpointUrl + '?resource=donors&action=get&id=' + donorId,
        type: 'GET',
        async: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                donorData = res.data;
            }
        }
    });
    return donorData !== null ? donorData : false;
}

function openModalForDonor(id) {
    let modal = document.getElementById('donorModal');
    let donor = getDonorById(id);
    if (modal && donor) {
        modal.querySelector('#name').value = donor.name || '';
        modal.querySelector('#email').value = donor.email || '';
        modal.querySelector('#phone_number').value = donor.phone_number || '';
        modal.querySelector('#address').value = donor.address || '';
        modal.querySelector('#is_hidden').value = String(donor.is_hidden || '0');
        modal.querySelector('#donor_id').value = donor.id;
    }
    var myModal = new bootstrap.Modal(modal);
    myModal.show();
}

function addDonor(e) {
    e.preventDefault();
    let form = document.getElementById('addDonor');
    let messageBox = form.querySelector('#form-message');
    let formData = new FormData(form);
    if (!lockFormSubmit(form, 3000)) {
        return;
    }
    hideInlineMessage(messageBox);

    $.ajax({
        url: endpointUrl + '?resource=donors&action=add',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('Donor added successfully.', 'success', 'Added');
                setTimeout(function () {
                    if (form.querySelector('#isStay').checked) {
                        location.reload();
                    } else {
                        window.location.href = adminUrl + 'donors/';
                    }
                }, 1200);
            } else {
                toastMessage('Failed to add donor: ' + (res.message || 'Unknown error'), 'error', 'Add Failed');
            }
        },
        error: function (xhr, status, error) {
            toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
            console.error('AJAX Error: ' + status + error);
        }
    });
}

function updateDonor(e) {
    e.preventDefault();
    let form = document.getElementById('updateDonor');
    let messageBox = form.querySelector('#form-message');
    let id = form.querySelector('#donor_id').value;
    let formData = new FormData(form);
    if (!lockFormSubmit(form, 3000)) {
        return;
    }
    hideInlineMessage(messageBox);

    $.ajax({
        url: endpointUrl + '?resource=donors&action=update&id=' + id,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('Donor updated successfully.', 'success', 'Updated');
                setTimeout(function () {
                    location.reload();
                }, 1200);
            } else {
                toastMessage('Failed to update donor: ' + (res.message || 'Unknown error'), 'error', 'Update Failed');
            }
        },
        error: function (xhr, status, error) {
            toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
            console.error('AJAX Error: ' + status + error);
        }
    });
}

function deleteDonor(donorId) {
    uiConfirm('Are you sure you want to delete this donor?', 'Delete Donor').then(function (confirmed) {
        if (!confirmed) {
            return;
        }

        $.ajax({
            url: endpointUrl + '?resource=donors&action=delete&id=' + donorId,
            type: 'POST',
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    uiAlert('Donor deleted successfully.', 'success', 'Deleted').then(function () {
                        location.reload();
                    });
                } else {
                    uiAlert(res.message || 'Failed to delete donor.', 'error', 'Delete Failed');
                }
            },
            error: function (xhr, status, error) {
                uiAlert('AJAX Error: ' + status + error, 'error', 'Server Error');
            }
        });
    });
}

function fetchDonorsForSelect(selectId, selectedId) {
    var select = document.getElementById(selectId);
    if (!select) {
        return Promise.resolve();
    }

    return fetch(endpointUrl + '?resource=donors&action=get')
        .then(function (res) { return res.json(); })
        .then(function (payload) {
            var donors = payload && payload.success ? payload.data : [];
            var options = '<option value="">Select donor</option>';
            donors.forEach(function (donor) {
                options += '<option value="' + donor.id + '">' + donor.name + ' (' + donor.email + ')</option>';
            });
            select.innerHTML = options;
            if (selectedId) {
                select.value = String(selectedId);
            }
        })
        .catch(function () {
            select.innerHTML = '<option value="">No donors available</option>';
        });
}

function fetchDonationsForSelect(selectId, selectedId) {
    var select = document.getElementById(selectId);
    if (!select) {
        return Promise.resolve();
    }

    return fetch(endpointUrl + '?resource=donations&action=get')
        .then(function (res) { return res.json(); })
        .then(function (payload) {
            var donations = payload && payload.success ? payload.data : [];
            var options = '<option value="">Select campaign</option>';
            donations.forEach(function (donation) {
                options += '<option value="' + donation.id + '">' + donation.title + '</option>';
            });
            select.innerHTML = options;
            if (selectedId) {
                select.value = String(selectedId);
            }
        })
        .catch(function () {
            select.innerHTML = '<option value="">No campaigns available</option>';
        });
}

function fetchTransactions() {
    let transactionsContainer = document.getElementById('transactions');
    if (!transactionsContainer) {
        return;
    }

    $.ajax({
        url: endpointUrl + '?resource=transactions&action=get',
        type: 'GET',
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                let transactions = res.data;
                let htmlContent = '';
                transactions.forEach(function (trx) {
                    htmlContent += `
                        <tr>
                            <td>${trx.id}</td>
                            <td>${trx.donor_name || trx.donor_email || '-'}</td>
                            <td>${trx.donation_title || '-'}</td>
                            <td>${formatMoney(trx.amount, trx.currency || 'USD')}</td>
                            <td>${renderStatusBadge(trx.status)}</td>
                            <td>${trx.created_at || '-'}</td>
                            <td>
                                <a href="javascript:;" onclick="openModalForTransaction(${trx.id})" class="btn btn-primary btn-sm">
                                    <span class="pc-micon"><i class="ti ti-edit-circle"></i></span> Edit
                                </a>
                                <button onclick="deleteTransaction(${trx.id})" class="btn btn-danger btn-sm">
                                    <span class="pc-micon"><i class="ti ti-trash"></i></span> Delete
                                </button>
                            </td>
                        </tr>
                    `;
                });

                transactionsContainer.innerHTML = htmlContent;
                enhanceDataTable('#order-table', [[0, 'desc']]);
            } else {
                transactionsContainer.innerHTML = '<tr><td colspan="7">' + renderEmptyState('No transactions found', 'Payments and manual entries will appear here.') + '</td></tr>';
            }
        },
        error: function (xhr, status, error) {
            transactionsContainer.innerHTML = '<tr><td colspan="7">' + renderEmptyState('Unable to load transactions', 'Please try again later.') + '</td></tr>';
            console.error('AJAX Error: ' + status + error);
        }
    });
}

function getTransactionById(transactionId) {
    let transactionData = null;
    $.ajax({
        url: endpointUrl + '?resource=transactions&action=get&id=' + transactionId,
        type: 'GET',
        async: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                transactionData = res.data;
            }
        }
    });
    return transactionData !== null ? transactionData : false;
}

function openModalForTransaction(id) {
    let modal = document.getElementById('transactionModal');
    let transaction = getTransactionById(id);
    if (!modal || !transaction) {
        return;
    }

    fetchDonorsForSelect('donor_id', transaction.donor_id).then(function () {
        fetchDonationsForSelect('donation_id', transaction.donation_id).then(function () {
            modal.querySelector('#transaction_id').value = transaction.id;
            modal.querySelector('#amount').value = transaction.amount || '';
            modal.querySelector('#payment_method').value = transaction.payment_method || '';
            modal.querySelector('#currency').value = transaction.currency || 'USD';
            modal.querySelector('#last_four').value = transaction.last_four || '';
            modal.querySelector('#status').value = transaction.status || 'completed';

            var myModal = new bootstrap.Modal(modal);
            myModal.show();
        });
    });
}

function addTransaction(e) {
    e.preventDefault();
    let form = document.getElementById('addTransaction');
    let messageBox = form.querySelector('#form-message');
    let formData = new FormData(form);
    if (!lockFormSubmit(form, 3000)) {
        return;
    }
    hideInlineMessage(messageBox);

    $.ajax({
        url: endpointUrl + '?resource=transactions&action=add',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('Transaction added successfully.', 'success', 'Added');
                setTimeout(function () {
                    if (form.querySelector('#isStay').checked) {
                        location.reload();
                    } else {
                        window.location.href = adminUrl + 'transactions/';
                    }
                }, 1200);
            } else {
                toastMessage('Failed to add transaction: ' + (res.message || 'Unknown error'), 'error', 'Add Failed');
            }
        },
        error: function (xhr, status, error) {
            toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
            console.error('AJAX Error: ' + status + error);
        }
    });
}

function updateTransaction(e) {
    e.preventDefault();
    let form = document.getElementById('updateTransaction');
    let messageBox = form.querySelector('#form-message');
    let id = form.querySelector('#transaction_id').value;
    let formData = new FormData(form);
    if (!lockFormSubmit(form, 3000)) {
        return;
    }
    hideInlineMessage(messageBox);

    $.ajax({
        url: endpointUrl + '?resource=transactions&action=update&id=' + id,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            res = (typeof response === 'string') ? JSON.parse(response) : response;
            if (res.success) {
                toastMessage('Transaction updated successfully.', 'success', 'Updated');
                setTimeout(function () {
                    location.reload();
                }, 1200);
            } else {
                toastMessage('Failed to update transaction: ' + (res.message || 'Unknown error'), 'error', 'Update Failed');
            }
        },
        error: function (xhr, status, error) {
            toastMessage('Something went wrong! Please try again later.', 'error', 'Server Error');
            console.error('AJAX Error: ' + status + error);
        }
    });
}

function deleteTransaction(id) {
    uiConfirm('Are you sure you want to delete this transaction?', 'Delete Transaction').then(function (confirmed) {
        if (!confirmed) {
            return;
        }

        $.ajax({
            url: endpointUrl + '?resource=transactions&action=delete&id=' + id,
            type: 'POST',
            success: function (response) {
                res = (typeof response === 'string') ? JSON.parse(response) : response;
                if (res.success) {
                    uiAlert('Transaction deleted successfully.', 'success', 'Deleted').then(function () {
                        location.reload();
                    });
                } else {
                    uiAlert(res.message || 'Failed to delete transaction.', 'error', 'Delete Failed');
                }
            },
            error: function (xhr, status, error) {
                uiAlert('AJAX Error: ' + status + error, 'error', 'Server Error');
            }
        });
    });
}

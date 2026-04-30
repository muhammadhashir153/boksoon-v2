(function () {
  'use strict';

  var THEME_STORAGE_KEY = 'adminTheme';

  function revealSections() {
    var nodes = document.querySelectorAll('.page-header, .page-toolbar, .card, .table-responsive, .dt-responsive, .donation-item, .auth-form');
    nodes.forEach(function (node, index) {
      node.classList.add('ui-reveal');
      window.setTimeout(function () {
        node.classList.add('ui-reveal-on');
      }, 32 * (index + 1));
    });
  }

  function attachCardPointerEffect() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    document.querySelectorAll('.card, .donation-item').forEach(function (card) {
      card.addEventListener('mousemove', function (event) {
        if (resolveCurrentTheme() !== 'dark') {
          card.style.background = '';
          return;
        }
        var rect = card.getBoundingClientRect();
        var x = ((event.clientX - rect.left) / rect.width) * 100;
        var y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.background =
          'radial-gradient(circle at ' + x + '% ' + y + '%, rgba(255,255,255,0.24), transparent 38%), ' +
          'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))';
      });

      card.addEventListener('mouseleave', function () {
        card.style.background = '';
      });
    });
  }

  function persistTheme(theme) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      return;
    }
  }

  function resolveCurrentTheme() {
    var bodyTheme = document.body.getAttribute('data-pc-theme');
    return bodyTheme === 'dark' ? 'dark' : 'light';
  }

  function updateThemeToggle(theme) {
    var icon = document.getElementById('theme-toggle-icon');
    var btn = document.getElementById('theme-toggle-btn');
    if (!icon || !btn) {
      return;
    }

    icon.className = theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    btn.setAttribute('title', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function applyTheme(theme) {
    if (typeof window.layout_change === 'function') {
      window.layout_change(theme);
    } else {
      document.body.setAttribute('data-pc-theme', theme);
    }

    document.body.dataset.pcTheme = theme;
    document.querySelectorAll('.card, .donation-item').forEach(function (card) {
      card.style.background = '';
    });
    persistTheme(theme);
    updateThemeToggle(theme);
  }

  function initThemeToggle() {
    var btn = document.getElementById('theme-toggle-btn');
    if (!btn) {
      return;
    }

    updateThemeToggle(resolveCurrentTheme());
    btn.addEventListener('click', function () {
      applyTheme(resolveCurrentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  function updateUploadPreview(input, file) {
    var previewSelector = input.getAttribute('data-upload-preview');
    if (!previewSelector || !file || !/^image\//i.test(file.type)) {
      return;
    }

    var previewNode = document.querySelector(previewSelector);
    if (!previewNode) {
      return;
    }

    var reader = new FileReader();
    reader.onload = function (event) {
      previewNode.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function syncUploadDropzone(input, zone, file) {
    var title = zone.querySelector('.upload-dropzone-copy strong');
    var helper = zone.querySelector('.upload-dropzone-copy span');
    var meta = zone.querySelector('.upload-dropzone-meta');
    var action = zone.querySelector('.upload-dropzone-action');
    var defaultTitle = input.getAttribute('data-upload-label') || 'Drop file here';
    var defaultHelper = input.getAttribute('data-upload-help') || 'Drag and drop or click to browse.';

    if (file) {
      zone.classList.add('is-has-file');
      title.textContent = file.name;
      helper.textContent = 'Ready to upload';
      meta.textContent = (file.type || 'file').replace('/', ' / ') + '  •  ' + Math.max(1, Math.round(file.size / 1024)) + ' KB';
      action.textContent = 'Replace file';
      updateUploadPreview(input, file);
    } else {
      zone.classList.remove('is-has-file');
      title.textContent = defaultTitle;
      helper.textContent = defaultHelper;
      meta.textContent = input.hasAttribute('accept') && input.getAttribute('accept') ? 'Accepted: ' + input.getAttribute('accept') : 'Drag and drop or click to browse.';
      action.textContent = 'Browse files';
    }
  }

  function initUploadFields() {
    document.querySelectorAll('input[type="file"][data-upload-label]').forEach(function (input) {
      if (input.dataset.uploadEnhanced === '1') {
        return;
      }

      input.dataset.uploadEnhanced = '1';
      input.classList.add('upload-input-native');

      var zone = document.createElement('div');
      zone.className = 'upload-dropzone';
      zone.tabIndex = 0;
      zone.innerHTML =
        '<div class="upload-dropzone-icon"><i class="ti ti-cloud-upload"></i></div>' +
        '<div class="upload-dropzone-copy">' +
        '  <strong></strong>' +
        '  <span></span>' +
        '  <div class="upload-dropzone-meta"></div>' +
        '</div>' +
        '<div class="upload-dropzone-action">Browse files</div>';

      input.insertAdjacentElement('afterend', zone);

      syncUploadDropzone(input, zone, input.files && input.files[0] ? input.files[0] : null);

      zone.addEventListener('click', function () {
        input.click();
      });

      zone.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          input.click();
        }
      });

      input.addEventListener('change', function () {
        syncUploadDropzone(input, zone, input.files && input.files[0] ? input.files[0] : null);
      });

      ['dragenter', 'dragover'].forEach(function (eventName) {
        zone.addEventListener(eventName, function (event) {
          event.preventDefault();
          zone.classList.add('is-dragover');
        });
      });

      ['dragleave', 'dragend', 'drop'].forEach(function (eventName) {
        zone.addEventListener(eventName, function (event) {
          event.preventDefault();
          zone.classList.remove('is-dragover');
        });
      });

      zone.addEventListener('drop', function (event) {
        var files = event.dataTransfer && event.dataTransfer.files;
        if (!files || !files.length) {
          return;
        }

        var transfer = new DataTransfer();
        Array.prototype.slice.call(files, 0, 1).forEach(function (file) {
          transfer.items.add(file);
        });
        input.files = transfer.files;
        syncUploadDropzone(input, zone, input.files[0]);
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  window.initAdminUploadFields = initUploadFields;

  function getAdminBlogUploadUrl() {
    if (window.location && window.location.origin) {
      return window.location.origin + '/api/admin/blogs/upload-image';
    }

    return '/api/admin/blogs/upload-image';
  }

  function createCkeditorUploadAdapter(loader) {
    return {
      upload: function () {
        return loader.file.then(function (file) {
          return new Promise(function (resolve, reject) {
            if (!file) {
              reject('No file selected.');
              return;
            }

            var formData = new FormData();
            formData.append('upload', file);

            fetch(getAdminBlogUploadUrl(), {
              method: 'POST',
              body: formData,
              credentials: 'same-origin',
              headers: {
                Accept: 'application/json'
              }
            })
              .then(function (response) {
                return response.json().catch(function () {
                  return { success: false, message: 'Invalid upload response.' };
                });
              })
              .then(function (result) {
                var payload = result && result.data ? result.data : result;
                if (!result || !result.success || !payload || !payload.url) {
                  reject((result && result.message) || 'Image upload failed.');
                  return;
                }

                resolve({
                  default: payload.url
                });
              })
              .catch(function () {
                reject('Image upload failed.');
              });
          });
        });
      },
      abort: function () {
        return;
      }
    };
  }

  function adminCkeditorUploadPlugin(editor) {
    var repository = editor.plugins.get('FileRepository');
    repository.createUploadAdapter = function (loader) {
      return createCkeditorUploadAdapter(loader);
    };
  }

  window.createAdminBlogEditor = function (selector, config) {
    if (!window.ClassicEditor) {
      return Promise.reject(new Error('ClassicEditor is not available.'));
    }

    var element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!element) {
      return Promise.reject(new Error('Editor element not found.'));
    }

    var baseConfig = {
      extraPlugins: [adminCkeditorUploadPlugin]
    };

    return window.ClassicEditor.create(element, Object.assign(baseConfig, config || {}));
  };

  window.uiAlert = window.uiAlert || function (message, type, title) {
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
        timer: 2800,
        timerProgressBar: true
      });
    }

    alert(message);
    return Promise.resolve();
  };

  window.uiConfirm = window.uiConfirm || function (message, title) {
    title = title || 'Please Confirm';
    if (window.Swal && typeof window.Swal.fire === 'function') {
      return window.Swal.fire({
        title: title,
        text: message,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      }).then(function (result) {
        return !!result.isConfirmed;
      });
    }

    return Promise.resolve(confirm(message));
  };

  document.addEventListener('DOMContentLoaded', function () {
    revealSections();
    attachCardPointerEffect();
    initThemeToggle();
    window.initAdminUploadFields();
  });
})();

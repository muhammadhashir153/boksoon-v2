'use strict';

document.addEventListener('DOMContentLoaded', function () {
  loadNgoDashboard();
});

function getEndpointBase() {
  if (window.APP_URLS && window.APP_URLS.endpoint) {
    return window.APP_URLS.endpoint;
  }

  if (window.APP_BASE_URL) {
    return window.APP_BASE_URL + 'endpoint/';
  }

  return '/endpoint/';
}

function getDashboardRole() {
  try {
    var userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return String(userData.role_name || '').toLowerCase();
  } catch (e) {
    return '';
  }
}

function fetchResource(resource, action) {
  var url = getEndpointBase() + '?resource=' + encodeURIComponent(resource) + '&action=' + encodeURIComponent(action || 'get');

  return fetch(url, {
    credentials: 'same-origin'
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (payload) {
      return payload && payload.success && Array.isArray(payload.data) ? payload.data : [];
    })
    .catch(function () {
      return [];
    });
}

function toNumber(value) {
  var n = parseFloat(value);
  return isNaN(n) ? 0 : n;
}

function formatCurrency(amount, currency) {
  var safeCurrency = (currency || 'USD').toUpperCase();
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: safeCurrency, maximumFractionDigits: 0 }).format(amount);
  } catch (e) {
    return '$' + amount.toFixed(0);
  }
}

function setText(id, value) {
  var node = document.getElementById(id);
  if (node) {
    node.textContent = value;
  }
}

function renderCampaignProgress(donations) {
  var container = document.getElementById('campaign-progress-list');
  if (!container) {
    return;
  }

  if (!donations.length) {
    container.innerHTML = '<div class="empty-state"><strong>No donation campaigns found</strong><div>Create a campaign to start tracking fundraising performance.</div></div>';
    return;
  }

  var html = '';
  donations.slice(0, 6).forEach(function (campaign) {
    var target = toNumber(campaign.target_amount);
    var raised = toNumber(campaign.raised_amount);
    var percent = target > 0 ? Math.min(100, (raised / target) * 100) : 0;

    html += '' +
      '<div class="detail-list-item">' +
      '  <div class="d-flex justify-content-between mb-1">' +
      '    <span class="fw-semibold">' + (campaign.title || 'Untitled Campaign') + '</span>' +
      '    <span class="text-muted">' + percent.toFixed(1) + '%</span>' +
      '  </div>' +
      '  <div class="progress" style="height:10px">' +
      '    <div class="progress-bar bg-primary" role="progressbar" style="width:' + percent.toFixed(2) + '%"></div>' +
      '  </div>' +
      '  <div class="d-flex justify-content-between mt-2 small text-muted">' +
      '    <span>Raised: ' + formatCurrency(raised, 'USD') + '</span>' +
      '    <span>Target: ' + formatCurrency(target, 'USD') + '</span>' +
      '  </div>' +
      '</div>';
  });

  container.innerHTML = html;
}

function renderActivity(transactions, blogs) {
  var container = document.getElementById('dashboard-activity-list');
  if (!container) {
    return;
  }

  var activity = [];

  transactions.slice(0, 8).forEach(function (item) {
    activity.push({
      type: 'transaction',
      title: item.donation_title || 'Donation Payment',
      sub: item.donor_name || item.donor_email || 'Unknown donor',
      amount: formatCurrency(toNumber(item.amount), item.currency || 'USD'),
      date: item.created_at || ''
    });
  });

  blogs.slice(0, 5).forEach(function (item) {
    activity.push({
      type: 'blog',
      title: item.title || 'Blog Post',
      sub: item.ministry_name || 'General',
      amount: (item.is_published === '1' || item.is_published === 1) ? 'Published' : 'Draft',
      date: item.created_at || ''
    });
  });

  activity.sort(function (a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (!activity.length) {
    container.innerHTML = '<div class="list-group-item">No recent activity found.</div>';
    return;
  }

  var html = '';
  activity.slice(0, 8).forEach(function (item) {
    var icon = item.type === 'transaction' ? 'ti-wallet' : 'ti-news';
    var color = item.type === 'transaction' ? 'text-success bg-light-success' : 'text-primary bg-light-primary';
    html += '' +
      '<div class="list-group-item list-group-item-action">' +
      '  <div class="d-flex">' +
      '    <div class="flex-shrink-0">' +
      '      <div class="avtar avtar-s rounded-circle ' + color + '">' +
      '        <i class="ti ' + icon + ' f-18"></i>' +
      '      </div>' +
      '    </div>' +
      '    <div class="flex-grow-1 ms-3">' +
      '      <h6 class="mb-1">' + item.title + '</h6>' +
      '      <p class="mb-0 text-muted">' + item.sub + '</p>' +
      '    </div>' +
      '    <div class="flex-shrink-0 text-end">' +
      '      <h6 class="mb-1">' + item.amount + '</h6>' +
      '      <p class="mb-0 text-muted">' + (item.date ? new Date(item.date).toLocaleDateString() : '-') + '</p>' +
      '    </div>' +
      '  </div>' +
      '</div>';
  });

  container.innerHTML = html;
}

function loadNgoDashboard() {
  var role = getDashboardRole();
  var requests = [
    fetchResource('donations', 'get'),
    fetchResource('blogs', 'get'),
    role === 'admin' ? fetchResource('transactions', 'get') : Promise.resolve([])
  ];

  Promise.all(requests).then(function (result) {
    var donations = result[0] || [];
    var blogs = result[1] || [];
    var transactions = result[2] || [];

    var totals = donations.reduce(function (acc, item) {
      acc.target += toNumber(item.target_amount);
      acc.raised += toNumber(item.raised_amount);
      return acc;
    }, { target: 0, raised: 0 });

    var progress = totals.target > 0 ? (totals.raised / totals.target) * 100 : 0;
    var completedCount = donations.filter(function (item) {
      var target = toNumber(item.target_amount);
      return target > 0 && toNumber(item.raised_amount) >= target;
    }).length;

    setText('kpi-campaigns', String(donations.length));
    setText('kpi-campaigns-sub', completedCount + ' campaigns reached target');
    setText('kpi-blogs', String(blogs.length));
    setText('kpi-blogs-sub', 'Content across ministries');
    setText('kpi-raised', formatCurrency(totals.raised, 'USD'));
    setText('kpi-raised-sub', 'Target: ' + formatCurrency(totals.target, 'USD'));
    setText('kpi-progress', progress.toFixed(1) + '%');
    setText('kpi-progress-sub', 'Overall progress against target');
    setText('kpi-target', 'Raised ' + formatCurrency(totals.raised, 'USD') + ' of ' + formatCurrency(totals.target, 'USD'));

    renderCampaignProgress(donations);
    renderActivity(transactions, blogs);

    if (role === 'manager') {
      setText('kpi-blogs-sub', 'Campaign and publishing coverage');
      setText('kpi-progress-sub', 'Progress without transaction visibility');

      var activityHeader = document.querySelector('#dashboard-activity-list');
      if (activityHeader && !blogs.length) {
        activityHeader.innerHTML = '<div class="list-group-item">No recent publishing activity found.</div>';
      }
    }
  });
}

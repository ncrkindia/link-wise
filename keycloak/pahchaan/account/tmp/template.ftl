<!DOCTYPE html>
<html lang="${(locale.current!'en')}">
<head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex, nofollow">
    <title>${msg("accountManagementTitle")}</title>



    <style>
      /* Pahchaan Account Console Theme */

      :root {
        --primary-600: #4f46e5;
        --primary-700: #4338ca;
        --purple-600: #741515;
        --pink-500: #ec4899;
        --green-50: #f0fdf4;
        --green-100: #dcfce7;
        --green-500: #22c55e;
        --green-600: #16a34a;
        --green-700: #15803d;
        --red-50: #fef2f2;
        --red-100: #fee2e2;
        --red-600: #dc2626;
        --red-700: #b91c1c;
        --yellow-50: #fffbeb;
        --yellow-100: #fef3c7;
        --yellow-600: #d97706;
        --indigo-50: #eef2ff;
        --indigo-100: #e0e7ff;
        --indigo-600: #4f46e5;
        --indigo-700: #4338ca;
        --blue-50: #eff6ff;
        --blue-600: #2563eb;
        --purple-50: #faf5ff;
        --purple-100: #f3e8ff;
        --gray-50: #f9fafb;
        --gray-100: #f3f4f6;
        --gray-200: #e5e7eb;
        --gray-300: #d1d5db;
        --gray-400: #9ca3af;
        --gray-500: #6b7280;
        --gray-600: #4b5563;
        --gray-700: #374151;
        --gray-800: #1f2937;
        --gray-900: #111827;
      }

      * {
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        line-height: 1.5;
        color: var(--gray-900);
        background-color: var(--gray-50);
        margin: 0;
        padding: 0;
      }

      /* Header */
      .account-header {
        background: white;
        border-bottom: 1px solid var(--gray-200);
        position: sticky;
        top: 0;
        z-index: 50;
      }

      .header-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 4rem;
      }

      .header-logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .logo-icon {
        background: linear-gradient(135deg, var(--primary-600), var(--purple-600));
        padding: 0.5rem;
        border-radius: 0.5rem;
        color: white;
        font-size: 1.5rem;
        width: 2.5rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .logo-text h1 {
        font-size: 1.125rem;
        font-weight: bold;
        background: linear-gradient(to right, var(--primary-600), var(--purple-600));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0;
      }

      .logo-text p {
        font-size: 0.75rem;
        color: var(--gray-500);
        margin: 0;
      }

      .header-user {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .user-info {
        text-align: right;
      }

      .user-info p {
        margin: 0;
        font-size: 0.875rem;
      }

      .user-name {
        font-weight: 500;
        color: var(--gray-900);
      }

      .user-email {
        color: var(--gray-500);
        font-size: 0.75rem;
      }

      .user-avatar {
        width: 2.5rem;
        height: 2.5rem;
        background: linear-gradient(135deg, var(--primary-500), var(--purple-500));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
      }

      /* Main Layout */
      .account-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
        display: flex;
        gap: 2rem;
      }

      /* Sidebar */
      .account-sidebar {
        width: 16rem;
        flex-shrink: 0;
      }

      .sidebar-nav {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        border: 1px solid var(--gray-200);
        padding: 1rem;
        position: sticky;
        top: 6rem;
      }

      .sidebar-nav a {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 0.5rem;
        color: var(--gray-700);
        text-decoration: none;
        font-weight: 500;
        transition: all 0.15s;
        border: 2px solid transparent;
        margin-bottom: 0.25rem;
      }

      .sidebar-nav a:hover {
        background: var(--gray-50);
      }

      .sidebar-nav a.active {
        background: var(--indigo-50);
        color: var(--indigo-600);
        border-color: var(--indigo-200);
      }

      .nav-icon {
        width: 1.25rem;
        height: 1.25rem;
      }

      /* Main Content */
      .account-content {
        flex: 1;
      }

      /* Card */
      .card {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        border: 1px solid var(--gray-200);
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: between;
        margin-bottom: 1rem;
      }

      .card h2 {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--gray-900);
        margin: 0 0 0.25rem 0;
      }

      .card p.subtitle {
        color: var(--gray-600);
        margin: 0;
      }

      /* Gradient Card */
      .gradient-card {
        background: linear-gradient(135deg, var(--primary-600) 0%, var(--purple-600) 50%, var(--pink-500) 100%);
        color: white;
        border: none;
        padding: 2rem;
      }

      .gradient-card h1 {
        font-size: 1.875rem;
        font-weight: bold;
        margin: 0 0 0.5rem 0;
      }

      .gradient-card p {
        opacity: 0.9;
        font-size: 1.125rem;
        margin: 0 0 1.5rem 0;
      }

      .stat-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .stat-item {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 0.5rem;
        padding: 0.75rem 1rem;
      }

      .stat-label {
        opacity: 0.8;
        font-size: 0.875rem;
        margin: 0;
      }

      .stat-value {
        font-weight: 600;
        margin: 0;
      }

      /* Form Elements */
      .form-group {
        margin-bottom: 1.25rem;
      }

      .form-group label {
        display: block;
        font-weight: 500;
        color: var(--gray-700);
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
      }

      .form-group input[type="text"],
      .form-group input[type="email"],
      .form-group input[type="password"],
      .form-group input[type="tel"],
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: 0.5rem 1rem;
        border: 1px solid var(--gray-300);
        border-radius: 0.5rem;
        font-size: 1rem;
        transition: all 0.15s;
      }

      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: var(--primary-600);
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }

      .form-group input:disabled,
      .form-group select:disabled,
      .form-group textarea:disabled {
        background: var(--gray-50);
        color: var(--gray-600);
        cursor: not-allowed;
      }

      /* Buttons */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        font-weight: 500;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.15s;
        border: none;
        text-decoration: none;
      }

      .btn-primary {
        background: var(--primary-600);
        color: white;
      }

      .btn-primary:hover {
        background: var(--primary-700);
      }

      .btn-secondary {
        background: white;
        color: var(--gray-700);
        border: 1px solid var(--gray-300);
      }

      .btn-secondary:hover {
        background: var(--gray-50);
      }

      .btn-danger {
        background: var(--red-600);
        color: white;
        border: 1px solid var(--red-600);
      }

      .btn-danger:hover {
        background: var(--red-700);
      }

      /* Base Google Sign-In button */
      .social-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: #ffffff;
        color: #444;
        border: 1px solid #dadce0;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        padding: 10px 16px;
        cursor: pointer;
        transition: box-shadow 0.2s ease, background-color 0.2s ease;
      }

      /* Add Google logo inside */
      .social-button img {
        height: 18px;
        width: 18px;
        margin-right: 8px;
      }

      /* Hover effect */
      .social-button:hover {
        background-color: #f7f8f9;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }

      /* Active (pressed) state */
      .social-button:active {
        background-color: #f1f3f4;
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
      }


      /* Alerts */
      .alert {
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .alert-success {
        background: var(--green-50);
        border: 1px solid var(--green-100);
        color: var(--green-700);
      }

      .alert-error {
        background: var(--red-50);
        border: 1px solid var(--red-100);
        color: var(--red-700);
      }

      .alert-warning {
        background: var(--yellow-50);
        border: 1px solid var(--yellow-100);
        color: var(--yellow-700);
      }

      .alert-info {
        background: var(--blue-50);
        border: 1px solid var(--blue-100);
        color: var(--blue-700);
      }

      /* Quick Actions Grid */
      .quick-actions {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .action-card {
        background: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        border: 1px solid var(--gray-200);
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        text-decoration: none;
        color: inherit;
        transition: all 0.15s;
        display: block;
      }

      .action-card:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .action-icon {
        width: 3rem;
        height: 3rem;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }

      .action-card h3 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-900);
        margin: 0 0 0.25rem 0;
      }

      .action-card p {
        font-size: 0.875rem;
        color: var(--gray-600);
        margin: 0;
      }

      /* Table */
      .data-table {
        width: 100%;
        border-collapse: collapse;
      }

      .data-table th {
        text-align: left;
        padding: 0.75rem;
        border-bottom: 1px solid var(--gray-200);
        font-weight: 600;
        color: var(--gray-700);
        font-size: 0.875rem;
      }

      .data-table td {
        padding: 1rem 0.75rem;
        border-bottom: 1px solid var(--gray-100);
      }

      .data-table tr:last-child td {
        border-bottom: none;
      }

      /* Badge */
      .badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
      }

      .badge-success {
        background: var(--green-100);
        color: var(--green-700);
      }

      .badge-error {
        background: var(--red-100);
        color: var(--red-700);
      }

      .badge-warning {
        background: var(--yellow-100);
        color: var(--yellow-700);
      }

      /* Responsive */
      @media (max-width: 768px) {
        .account-container {
          flex-direction: column;
        }

        .account-sidebar {
          width: 100%;
        }

        .sidebar-nav {
          position: static;
        }

        .header-user .user-info {
          display: none;
        }

        .quick-actions {
          grid-template-columns: 1fr;
        }
      }

    </style>
</head>
<body class="${bodyClass!'account'}">
    <header>
        <h1>${msg("accountManagementTitle")}</h1>
        <a href="${(url.logoutUrl!'#')}" class="btn btn-danger">${msg("doSignOut")}</a>
    </header>

    <nav>
        <ul>
            <li><a href="${(url.accountUrl!'#')}" <#if active == "account">class="active"</#if>>${msg("account")}</a></li>
            <li><a href="${(url.passwordUrl!'#')}" <#if active == "password">class="active"</#if>>${msg("password")}</a></li>
            <li><a href="${(url.sessionsUrl!'#')}" <#if active == "sessions">class="active"</#if>>${msg("sessions")}</a></li>
            <li><a href="${(url.applicationsUrl!'#')}" <#if active == "applications">class="active"</#if>>${msg("applications")}</a></li>
        </ul>
    </nav>

    <main>
        <#if section == "top">
            <#nested "top">
        </#if>
        <#nested "content">
    </main>
</body>
</html>

<#import "template.ftl" as layout>
<@layout.mainLayout active='account' bodyClass='user'; section>

    <div class="card gradient-card">
        <h1>${msg("welcomeMessage", account.username)}</h1>
        <p>${msg("accountManagementWelcome")}</p>
        
        <div class="stat-grid">
            <div class="stat-item">
                <p class="stat-label">${msg("memberSince")}</p>
                <p class="stat-value">${msg("dateFormat", account.createdTimestamp)}</p>
            </div>
            <div class="stat-item">
                <p class="stat-label">${msg("emailVerified")}</p>
                <p class="stat-value">
                    <#if account.emailVerified>${msg("yes")}<#else>${msg("no")}</#if>
                </p>
            </div>
            <div class="stat-item">
                <p class="stat-label">${msg("lastAccess")}</p>
                <p class="stat-value">${msg("justNow")}</p>
            </div>
        </div>
    </div>

    <div class="quick-actions">
        <a href="${url.accountUrl}" class="action-card">
            <div class="action-icon" style="background: var(--indigo-100); color: var(--indigo-600);">👤</div>
            <h3>${msg("personalInfo")}</h3>
            <p>${msg("personalInfoDescription")}</p>
        </a>

        <a href="${url.passwordUrl}" class="action-card">
            <div class="action-icon" style="background: var(--green-100); color: var(--green-600);">🔐</div>
            <h3>${msg("security")}</h3>
            <p>${msg("securityDescription")}</p>
        </a>

        <a href="${url.sessionsUrl}" class="action-card">
            <div class="action-icon" style="background: var(--purple-100); color: var(--purple-600);">💻</div>
            <h3>${msg("activeSessions")}</h3>
            <p>${msg("activeSessionsDescription")}</p>
        </a>
    </div>

    <div class="card">
        <h2>${msg("accountSecurity")}</h2>
        <p class="subtitle">${msg("reviewAccountSecurity")}</p>

        <div style="margin-top: 1.5rem;">
            <#if account.emailVerified>
                <div class="alert alert-success">
                    <span>✓</span>
                    <div>
                        <strong>${msg("emailVerified")}</strong>
                        <p style="margin: 0; font-size: 0.875rem;">${account.email} ${msg("isVerified")}</p>
                    </div>
                </div>
            <#else>
                <div class="alert alert-warning">
                    <span>⚠</span>
                    <div>
                        <strong>${msg("emailNotVerified")}</strong>
                        <p style="margin: 0; font-size: 0.875rem;">${msg("pleaseVerifyEmail")}</p>
                    </div>
                </div>
            </#if>

            <#if passwordSet>
                <div class="alert alert-success">
                    <span>✓</span>
                    <div>
                        <strong>${msg("passwordConfigured")}</strong>
                        <p style="margin: 0; font-size: 0.875rem;">${msg("passwordIsSet")}</p>
                    </div>
                </div>
            </#if>
        </div>
    </div>

    <div class="card">
        <h2>${msg("accountActivity")}</h2>
        <p class="subtitle">${msg("recentActivity")}</p>

        <table class="data-table" style="margin-top: 1rem;">
            <thead>
                <tr>
                    <th>${msg("action")}</th>
                    <th>${msg("application")}</th>
                    <th>${msg("timestamp")}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${msg("signedIn")}</td>
                    <td>${msg("accountConsole")}</td>
                    <td>${msg("justNow")}</td>
                </tr>
            </tbody>
        </table>
    </div>

</@layout.mainLayout>

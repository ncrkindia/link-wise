<#import "template.ftl" as layout>
<@layout.mainLayout active='password' bodyClass='password'; section>

    <div class="card">
        <h2>${msg("changePassword")}</h2>
        <p class="subtitle">${msg("changePasswordDescription")}</p>
    </div>

    <!-- Security Score Card -->
    <div class="card" style="background: linear-gradient(135deg, var(--green-500), var(--green-600)); color: white; border: none;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
                <h2 style="color: white; margin-bottom: 0.5rem;">${msg("securityScore")}</h2>
                <p style="opacity: 0.9; margin: 0;">${msg("accountSecurityStrong")}</p>
            </div>
            <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 50%; width: 6rem; height: 6rem; display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">85</div>
                    <div style="font-size: 0.75rem;">/ 100</div>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 1.5rem; display: grid; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>✓</span>
                <span style="font-size: 0.875rem;">${msg("strongPasswordInUse")}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>⚠</span>
                <span style="font-size: 0.875rem;">${msg("passwordNotChanged60Days")}</span>
            </div>
        </div>
    </div>

    <!-- Change Password Form -->
    <div class="card">
        <form action="${url.passwordUrl}" method="post">
            <input type="hidden" id="stateChecker" name="stateChecker" value="${stateChecker}">

            <#if password.passwordSet>
                <div class="form-group">
                    <label for="password">${msg("password")}</label>
                    <input type="password" id="password" name="password" autocomplete="current-password" placeholder="${msg("currentPassword")}" />
                </div>
            </#if>

            <div class="form-group">
                <label for="password-new">${msg("passwordNew")}</label>
                <input type="password" id="password-new" name="password-new" autocomplete="new-password" placeholder="${msg("newPassword")}" />
                <p style="font-size: 0.75rem; color: var(--gray-500); margin: 0.25rem 0 0 0;">
                    ${msg("passwordRequirements")}
                </p>
            </div>

            <div class="form-group">
                <label for="password-confirm">${msg("passwordConfirm")}</label>
                <input type="password" id="password-confirm" name="password-confirm" autocomplete="new-password" placeholder="${msg("confirmNewPassword")}" />
            </div>

            <div style="display: flex; gap: 0.5rem;">
                <button type="submit" class="btn btn-primary" name="submitAction" value="Save">
                    💾 ${msg("doSave")}
                </button>
                <button type="submit" class="btn btn-secondary" name="submitAction" value="Cancel">
                    ${msg("doCancel")}
                </button>
            </div>
        </form>
    </div>

    <!-- Two-Factor Authentication -->
    <div class="card">
        <div style="display: flex; align-items: start; gap: 0.75rem; margin-bottom: 1.5rem;">
            <div style="background: var(--green-100); color: var(--green-600); padding: 0.5rem; border-radius: 0.5rem; font-size: 1.25rem;">
                📱
            </div>
            <div>
                <h2 style="margin: 0 0 0.25rem 0;">${msg("twoFactorAuthentication")}</h2>
                <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">${msg("twoFactorDescription")}</p>
            </div>
        </div>

        <div class="alert alert-success">
            <span>✓</span>
            <div>
                <strong>${msg("authenticatorAppEnabled")}</strong>
                <p style="margin: 0; font-size: 0.875rem;">${msg("usingAuthenticatorFor2FA")}</p>
            </div>
        </div>

        <div style="margin-top: 1rem;">
            <a href="${url.totpUrl}" class="btn btn-secondary">
                ⚙️ ${msg("manage2FA")}
            </a>
        </div>
    </div>

    <!-- Recent Login History -->
    <div class="card">
        <h2>${msg("recentLoginHistory")}</h2>
        <p class="subtitle">${msg("reviewRecentLogins")}</p>

        <table class="data-table" style="margin-top: 1rem;">
            <thead>
                <tr>
                    <th>${msg("device")}</th>
                    <th>${msg("location")}</th>
                    <th>${msg("timestamp")}</th>
                    <th>${msg("status")}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Chrome on Windows</td>
                    <td>Mumbai, India</td>
                    <td>${msg("justNow")}</td>
                    <td><span class="badge badge-success">${msg("currentSession")}</span></td>
                </tr>
                <tr>
                    <td>Safari on iPhone</td>
                    <td>Mumbai, India</td>
                    <td>2 hours ago</td>
                    <td><span class="badge badge-success">${msg("success")}</span></td>
                </tr>
            </tbody>
        </table>
    </div>

</@layout.mainLayout>

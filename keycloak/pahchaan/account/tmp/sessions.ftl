<#import "template.ftl" as layout>
<@layout.mainLayout active='sessions' bodyClass='sessions'; section>

    <div class="card">
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
                <h2>${msg("activeSessions")}</h2>
                <p class="subtitle">${msg("manageDevicesSessions")}</p>
            </div>
            <form action="${url.sessionsUrl}" method="post">
                <input type="hidden" id="stateChecker" name="stateChecker" value="${stateChecker}">
                <button type="submit" class="btn btn-danger">
                    🚫 ${msg("signOutAllSessions")}
                </button>
            </form>
        </div>
    </div>

    <!-- Session Stats -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        <div class="card">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <p style="font-size: 0.875rem; color: var(--gray-600); margin: 0;">${msg("totalSessions")}</p>
                    <p style="font-size: 1.875rem; font-weight: bold; color: var(--gray-900); margin: 0.25rem 0 0 0;">
                        ${sessions?size}
                    </p>
                </div>
                <div style="background: var(--indigo-100); color: var(--indigo-600); padding: 0.75rem; border-radius: 0.5rem; font-size: 1.5rem;">
                    💻
                </div>
            </div>
        </div>

        <div class="card">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <p style="font-size: 0.875rem; color: var(--gray-600); margin: 0;">${msg("activeDevices")}</p>
                    <p style="font-size: 1.875rem; font-weight: bold; color: var(--green-600); margin: 0.25rem 0 0 0;">
                        ${sessions?size}
                    </p>
                </div>
                <div style="background: var(--green-100); color: var(--green-600); padding: 0.75rem; border-radius: 0.5rem; font-size: 1.5rem;">
                    📱
                </div>
            </div>
        </div>

        <div class="card">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <p style="font-size: 0.875rem; color: var(--gray-600); margin: 0;">${msg("locations")}</p>
                    <p style="font-size: 1.875rem; font-weight: bold; color: var(--purple-600); margin: 0.25rem 0 0 0;">
                        1
                    </p>
                </div>
                <div style="background: var(--purple-100); color: var(--purple-600); padding: 0.75rem; border-radius: 0.5rem; font-size: 1.5rem;">
                    📍
                </div>
            </div>
        </div>
    </div>

    <!-- Sessions List -->
    <#list sessions as session>
        <div class="card" style="<#if session.current>background: var(--green-50); border-color: var(--green-500); border-width: 2px;</#if>">
            <div style="display: flex; align-items: start; justify-content: space-between; gap: 1rem;">
                <div style="display: flex; align-items: start; gap: 1rem; flex: 1;">
                    <!-- Device Icon -->
                    <div style="background: <#if session.current>var(--green-100)<#else>var(--gray-100)</#if>; color: <#if session.current>var(--green-600)<#else>var(--gray-600)</#if>; padding: 0.75rem; border-radius: 0.5rem; font-size: 1.5rem;">
                        💻
                    </div>

                    <!-- Session Details -->
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                            <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600; color: var(--gray-900);">
                                ${session.browser!"Unknown Browser"} on ${session.os!"Unknown OS"}
                            </h3>
                            <#if session.current>
                                <span class="badge badge-success">${msg("currentSession")}</span>
                            </#if>
                        </div>

                        <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.75rem;">
                            <span style="display: flex; align-items: center; gap: 0.375rem;">
                                <span>📍</span>
                                <span>${session.ipAddress!"Unknown"}</span>
                            </span>
                            <span>•</span>
                            <span style="display: flex; align-items: center; gap: 0.375rem;">
                                <span>🕐</span>
                                <span>${msg("lastAccess")}: ${session.lastAccess}</span>
                            </span>
                            <span>•</span>
                            <span style="display: flex; align-items: center; gap: 0.375rem;">
                                <span>📅</span>
                                <span>${msg("startedAt")}: ${session.started}</span>
                            </span>
                        </div>

                        <div>
                            <p style="font-size: 0.75rem; font-weight: 500; color: var(--gray-700); margin: 0 0 0.5rem 0;">
                                ${msg("appsAccessedSession")}:
                            </p>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                <#list session.clients as client>
                                    <span style="padding: 0.25rem 0.5rem; background: var(--indigo-50); color: var(--indigo-700); font-size: 0.75rem; border-radius: 9999px;">
                                        ${client}
                                    </span>
                                </#list>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sign Out Button -->
                <#if !session.current>
                    <form action="${url.sessionsUrl}" method="post">
                        <input type="hidden" id="stateChecker" name="stateChecker" value="${stateChecker}">
                        <input type="hidden" name="sessions" value="${session.id}">
                        <button type="submit" style="padding: 0.5rem; color: var(--red-600); background: none; border: none; cursor: pointer; font-size: 1.25rem;" title="${msg("doSignOut")}">
                            ✕
                        </button>
                    </form>
                </#if>
            </div>
        </div>
    </#list>

    <!-- Security Tips -->
    <div class="card" style="background: var(--blue-50); border-color: var(--blue-200);">
        <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--blue-900); margin: 0 0 0.75rem 0;">
            🔒 ${msg("securityTips")}
        </h3>
        <ul style="margin: 0; padding-left: 1.25rem; color: var(--blue-700); font-size: 0.875rem; line-height: 1.75;">
            <li>${msg("securityTip1")}</li>
            <li>${msg("securityTip2")}</li>
            <li>${msg("securityTip3")}</li>
            <li>${msg("securityTip4")}</li>
        </ul>
    </div>

</@layout.mainLayout>

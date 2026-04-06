<#import "template.ftl" as layout>
<@layout.mainLayout active='applications' bodyClass='applications'; section>

    <div class="card">
        <h2>${msg("connectedApplications")}</h2>
        <p class="subtitle">${msg("manageApplicationsAccess")}</p>
    </div>

    <!-- Stats -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        <div class="card">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <p style="font-size: 0.875rem; color: var(--gray-600); margin: 0;">${msg("totalApps")}</p>
                    <p style="font-size: 1.875rem; font-weight: bold; color: var(--gray-900); margin: 0.25rem 0 0 0;">
                        ${applications?size}
                    </p>
                </div>
                <div style="background: var(--indigo-100); color: var(--indigo-600); padding: 0.75rem; border-radius: 0.5rem; font-size: 1.5rem;">
                    🛡️
                </div>
            </div>
        </div>

        <div class="card">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <p style="font-size: 0.875rem; color: var(--gray-600); margin: 0;">${msg("active")}</p>
                    <p style="font-size: 1.875rem; font-weight: bold; color: var(--green-600); margin: 0.25rem 0 0 0;">
                        ${applications?size}
                    </p>
                </div>
                <div style="background: var(--green-100); color: var(--green-600); padding: 0.75rem; border-radius: 0.5rem; font-size: 1.5rem;">
                    ✓
                </div>
            </div>
        </div>
    </div>

    <!-- Applications List -->
    <div class="card">
        <h2 style="margin-bottom: 1rem;">${msg("activeApplications")}</h2>
        
        <#list applications as application>
            <div style="border: 1px solid var(--gray-200); border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1rem; transition: all 0.15s; <#if application?is_last>margin-bottom: 0;</#if>">
                <div style="display: flex; align-items: start; justify-content: space-between; gap: 1rem;">
                    <div style="display: flex; align-items: start; gap: 1rem; flex: 1;">
                        <!-- App Icon -->
                        <div style="font-size: 3rem;">
                            <#if application.clientName?contains("Khojo")>🔍
                            <#elseif application.clientName?contains("Campaign")>📊
                            <#elseif application.clientName?contains("Giga")>🛍️
                            <#elseif application.clientName?contains("Short")>🔗
                            <#elseif application.clientName?contains("AI") || application.clientName?contains("Samvaad")>🤖
                            <#else>⚙️
                            </#if>
                        </div>

                        <!-- App Details -->
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600;">
                                    ${application.clientName}
                                </h3>
                                <span class="badge badge-success">${msg("active")}</span>
                            </div>

                            <p style="color: var(--gray-600); margin: 0 0 0.75rem 0; font-size: 0.875rem;">
                                ${application.description!msg("applicationDescription")}
                            </p>

                            <#if application.effectiveUrl?has_content>
                                <div style="margin-bottom: 0.75rem;">
                                    <a href="${application.effectiveUrl}" 
                                       target="_blank" 
                                       style="display: inline-flex; align-items: center; gap: 0.25rem; color: var(--indigo-600); text-decoration: none; font-size: 0.875rem;">
                                        ${application.effectiveUrl?replace("https://", "")?replace("http://", "")}
                                        <span style="font-size: 0.75rem;">↗</span>
                                    </a>
                                </div>
                            </#if>

                            <#if application.consent??>
                                <div style="margin-bottom: 0.75rem;">
                                    <p style="font-size: 0.75rem; font-weight: 500; color: var(--gray-700); margin: 0 0 0.5rem 0;">
                                        ${msg("permissions")}:
                                    </p>
                                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                        <#list application.consent.grantedClientScopes as scope>
                                            <span style="padding: 0.25rem 0.5rem; background: var(--gray-100); color: var(--gray-700); font-size: 0.75rem; border-radius: 0.25rem;">
                                                ${scope}
                                            </span>
                                        </#list>
                                    </div>
                                </div>
                            </#if>

                            <p style="font-size: 0.75rem; color: var(--gray-500); margin: 0;">
                                ${msg("connectedSince")}: ${application.consent.createDate!msg("unknown")}
                            </p>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <#if application.effectiveUrl?has_content>
                            <a href="${application.effectiveUrl}" class="btn btn-secondary" style="font-size: 0.875rem;">
                                ${msg("viewDetails")}
                            </a>
                        </#if>
                        
                        <#if application.consent??>
                            <form action="${url.applicationsUrl}" method="post">
                                <input type="hidden" id="stateChecker" name="stateChecker" value="${stateChecker}">
                                <input type="hidden" name="clientId" value="${application.clientId}">
                                <input type="hidden" name="revoke" value="true">
                                <button type="submit" class="btn btn-danger" style="font-size: 0.875rem; width: 100%;">
                                    ${msg("revokeAccess")}
                                </button>
                            </form>
                        </#if>
                    </div>
                </div>
            </div>
        </#list>

        <#if !applications?has_content>
            <div style="text-align: center; padding: 3rem 0; color: var(--gray-500);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
                <p>${msg("noApplicationsConnected")}</p>
            </div>
        </#if>
    </div>

    <!-- Info Box -->
    <div class="card" style="background: var(--blue-50); border-color: var(--blue-200);">
        <h3 style="font-size: 0.875rem; font-weight: 600; color: var(--blue-900); margin: 0 0 0.75rem 0;">
            ℹ️ ${msg("aboutConnectedApplications")}
        </h3>
        <ul style="margin: 0; padding-left: 1.25rem; color: var(--blue-700); font-size: 0.875rem; line-height: 1.75;">
            <li>${msg("applicationsInfo1")}</li>
            <li>${msg("applicationsInfo2")}</li>
            <li>${msg("applicationsInfo3")}</li>
            <li>${msg("applicationsInfo4")}</li>
        </ul>
    </div>

</@layout.mainLayout>

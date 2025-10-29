import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "backstage/apis/admin/law-firm-admin-provisioning-api-logto-managed-rbac",
    },
    {
      type: "category",
      label: "Admin — Law Firms",
      items: [
        {
          type: "doc",
          id: "backstage/apis/admin/create-a-new-law-firm-tenant-and-optionally-its-logto-organization",
          label: "Create a new law firm (tenant) and optionally its Logto organization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/list-law-firms",
          label: "List law firms",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/get-a-law-firm",
          label: "Get a law firm",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Admin — Users & Lawyers",
      items: [
        {
          type: "doc",
          id: "backstage/apis/admin/search-auth-users-use-logto-user-id-to-resolve-the-caller",
          label: "Search auth users (use logtoUserId to resolve the caller)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/provision-a-user-identity-profile-roles-optional-credentials",
          label: "Provision a user (identity + profile + roles + optional credentials)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/list-professional-credentials-for-a-user",
          label: "List professional credentials for a user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/add-a-professional-credential-to-a-user",
          label: "Add a professional credential to a user",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/remove-a-professional-credential-from-a-user",
          label: "Remove a professional credential from a user",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/list-user-profiles-in-a-firm-filterable-by-role-credential",
          label: "List user profiles in a firm (filterable by role/credential)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/deprecated-list-lawyers-in-a-firm",
          label: "(Deprecated) List lawyers in a firm",
          className: "menu__list-item--deprecated api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/deprecated-provision-a-lawyer-use-post-users",
          label: "(Deprecated) Provision a lawyer (use POST /users)",
          className: "menu__list-item--deprecated api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/deprecated-provision-a-staff-member-use-post-users",
          label: "(Deprecated) Provision a staff member (use POST /users)",
          className: "menu__list-item--deprecated api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Admin — Logto Bridge",
      items: [
        {
          type: "doc",
          id: "backstage/apis/admin/list-logto-orgs-known-to-the-app",
          label: "List Logto orgs known to the app",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/sync-a-firms-logto-organization-and-memberships-into-local-mirrors",
          label: "Sync a firm's Logto organization and memberships into local mirrors",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/list-org-members-from-logto-locally-cached",
          label: "List org members (from Logto; locally cached)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/add-or-invite-a-member-to-the-firms-logto-org",
          label: "Add or invite a member to the firm's Logto org",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/get-a-specific-member",
          label: "Get a specific member",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/remove-a-member-from-the-firms-logto-org",
          label: "Remove a member from the firm's Logto org",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/replace-a-members-logto-org-roles",
          label: "Replace a member's Logto org roles",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/list-available-logto-org-roles",
          label: "List available Logto org roles",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Admin — Access Grants",
      items: [
        {
          type: "doc",
          id: "backstage/apis/admin/list-allowed-resource-types-domain-level",
          label: "List allowed resource types (domain-level)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/list-allowed-subresource-types-for-a-resource-type",
          label: "List allowed subresource types for a resource type",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/search-resource-access-grants",
          label: "Search resource access grants",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/list-access-grants-for-a-resource-root-level",
          label: "List access grants for a resource (root-level)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/create-a-manual-access-grant-for-a-resource-root-level",
          label: "Create a manual access grant for a resource (root-level)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/revoke-a-manual-access-grant-root-level",
          label: "Revoke a manual access grant (root-level)",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/list-access-grants-for-a-subresource",
          label: "List access grants for a subresource",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/create-a-manual-access-grant-for-a-subresource",
          label: "Create a manual access grant for a subresource",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/revoke-a-manual-access-grant-subresource",
          label: "Revoke a manual access grant (subresource)",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Admin — Capabilities",
      items: [
        {
          type: "doc",
          id: "backstage/apis/admin/get-effective-resource-field-policies-for-a-user-in-a-firm",
          label: "Get effective resource field policies for a user in a firm",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/get-user-capabilities-scopes-field-policies-case-id-sets",
          label: "Get user capabilities (scopes + field policies + case id sets)",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Admin — Support Access",
      items: [
        {
          type: "doc",
          id: "backstage/apis/admin/start-a-support-access-session-act-as-target-user",
          label: "Start a support access session (act as target user)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/list-support-access-sessions",
          label: "List support access sessions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/get-a-support-access-session",
          label: "Get a support access session",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/revoke-a-support-access-session",
          label: "Revoke a support access session",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/acquire-an-exclusive-admin-lock-on-a-resource",
          label: "Acquire an exclusive admin lock on a resource",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/admin/release-a-lock",
          label: "Release a lock",
          className: "api-method delete",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;

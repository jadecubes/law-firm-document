import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "admin-api/law-firm-admin-provisioning-api-logto-managed-rbac",
    },
    {
      type: "category",
      label: "Admin — Law Firms",
      items: [
        {
          type: "doc",
          id: "admin-api/create-a-new-law-firm-tenant-and-optionally-its-logto-organization",
          label: "Create a new law firm (tenant) and optionally its Logto organization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "admin-api/list-law-firms",
          label: "List law firms",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "admin-api/get-a-law-firm",
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
          id: "admin-api/search-auth-users-use-logto-user-id-to-resolve-the-caller",
          label: "Search auth users (use logtoUserId to resolve the caller)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "admin-api/provision-a-lawyer-logto-identity-local-profile-licenses-optional-invite-org-roles",
          label: "Provision a lawyer (Logto identity + local profile + licenses + optional invite + org roles)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "admin-api/list-lawyers-in-a-firm-firm-user-profiles-is-lawyer-true",
          label: "List lawyers in a firm (FIRM_USER_PROFILES.isLawyer=true)",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Admin — Logto Bridge",
      items: [
        {
          type: "doc",
          id: "admin-api/list-logto-orgs-known-to-the-app",
          label: "List Logto orgs known to the app",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "admin-api/sync-a-firms-logto-organization-and-memberships-into-local-mirrors",
          label: "Sync a firm's Logto organization and memberships into local mirrors",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "admin-api/list-org-members-from-logto-locally-cached",
          label: "List org members (from Logto; locally cached)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "admin-api/add-or-invite-a-member-to-the-firms-logto-org",
          label: "Add or invite a member to the firm's Logto org",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "admin-api/get-a-specific-member",
          label: "Get a specific member",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "admin-api/remove-a-member-from-the-firms-logto-org",
          label: "Remove a member from the firm's Logto org",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "admin-api/replace-a-members-logto-org-roles",
          label: "Replace a member's Logto org roles",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "admin-api/list-available-logto-org-roles",
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
          id: "admin-api/list-allowed-resource-types-domain-level",
          label: "List allowed resource types (domain-level)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "admin-api/list-allowed-subresource-types-for-a-resource-type",
          label: "List allowed subresource types for a resource type",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "admin-api/search-resource-access-grants",
          label: "Search resource access grants",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "admin-api/list-access-grants-for-a-resource-root-level",
          label: "List access grants for a resource (root-level)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "admin-api/create-a-manual-access-grant-for-a-resource-root-level",
          label: "Create a manual access grant for a resource (root-level)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "admin-api/revoke-a-manual-access-grant-root-level",
          label: "Revoke a manual access grant (root-level)",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "admin-api/list-access-grants-for-a-subresource",
          label: "List access grants for a subresource",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "admin-api/create-a-manual-access-grant-for-a-subresource",
          label: "Create a manual access grant for a subresource",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "admin-api/revoke-a-manual-access-grant-subresource",
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
          id: "admin-api/get-effective-resource-field-policies-for-a-user-in-a-firm",
          label: "Get effective resource field policies for a user in a firm",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "admin-api/get-user-capabilities-scopes-field-policies-case-id-sets",
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
          id: "admin-api/start-a-support-access-session-act-as-target-user",
          label: "Start a support access session (act as target user)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "admin-api/list-active-support-access-sessions",
          label: "List active support access sessions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "admin-api/get-a-support-access-session",
          label: "Get a support access session",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "admin-api/revoke-a-support-access-session",
          label: "Revoke a support access session",
          className: "api-method delete",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;

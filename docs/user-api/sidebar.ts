import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "user-api/law-firm-user-portal-api",
    },
    {
      type: "category",
      label: "User — Profile",
      items: [
        {
          type: "doc",
          id: "user-api/get-current-users-profile",
          label: "Get current user's profile",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/update-current-users-profile",
          label: "Update current user's profile",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "User — Firm Members",
      items: [
        {
          type: "doc",
          id: "user-api/list-members-in-users-firm",
          label: "List members in user's firm",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/get-a-specific-firm-members-profile",
          label: "Get a specific firm member's profile",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "User — Cases",
      items: [
        {
          type: "doc",
          id: "user-api/list-cases-accessible-to-current-user",
          label: "List cases accessible to current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/create-a-new-case",
          label: "Create a new case",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "user-api/get-case-details",
          label: "Get case details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/update-case-details",
          label: "Update case details",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "user-api/list-members-assigned-to-a-case",
          label: "List members assigned to a case",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/add-a-member-to-a-case",
          label: "Add a member to a case",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "user-api/remove-a-member-from-a-case",
          label: "Remove a member from a case",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "User — Clients",
      items: [
        {
          type: "doc",
          id: "user-api/list-clients-accessible-to-current-user",
          label: "List clients accessible to current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/create-a-new-client",
          label: "Create a new client",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "user-api/get-client-details",
          label: "Get client details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/update-client-details",
          label: "Update client details",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "User — Documents",
      items: [
        {
          type: "doc",
          id: "user-api/list-documents-accessible-to-current-user",
          label: "List documents accessible to current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/upload-a-new-document",
          label: "Upload a new document",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "user-api/get-document-metadata-and-download-url",
          label: "Get document metadata and download URL",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/update-document-metadata",
          label: "Update document metadata",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "user-api/delete-a-document",
          label: "Delete a document",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "User — Appointments",
      items: [
        {
          type: "doc",
          id: "user-api/list-appointments-for-current-user",
          label: "List appointments for current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/create-a-new-appointment",
          label: "Create a new appointment",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "user-api/get-appointment-details",
          label: "Get appointment details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/update-appointment",
          label: "Update appointment",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "user-api/cancel-appointment",
          label: "Cancel appointment",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "user-api/respond-to-appointment-invitation",
          label: "Respond to appointment invitation",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "User — Time & Billing",
      items: [
        {
          type: "doc",
          id: "user-api/list-time-entries-for-current-user",
          label: "List time entries for current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/create-a-new-time-entry",
          label: "Create a new time entry",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "user-api/get-time-entry-details",
          label: "Get time entry details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/update-time-entry",
          label: "Update time entry",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "user-api/delete-time-entry",
          label: "Delete time entry",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "user-api/submit-time-entry-for-approval",
          label: "Submit time entry for approval",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "User — Invoices",
      items: [
        {
          type: "doc",
          id: "user-api/list-invoices-accessible-to-current-user",
          label: "List invoices accessible to current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/get-invoice-details",
          label: "Get invoice details",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "User — Notifications",
      items: [
        {
          type: "doc",
          id: "user-api/list-notifications-for-current-user",
          label: "List notifications for current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/mark-notification-as-read",
          label: "Mark notification as read",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "user-api/mark-all-notifications-as-read",
          label: "Mark all notifications as read",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "User — Collaboration",
      items: [
        {
          type: "doc",
          id: "user-api/list-comments-on-a-resource",
          label: "List comments on a resource",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "user-api/add-a-comment-to-a-resource",
          label: "Add a comment to a resource",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "user-api/edit-a-comment",
          label: "Edit a comment",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "user-api/delete-a-comment",
          label: "Delete a comment",
          className: "api-method delete",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;

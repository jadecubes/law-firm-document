import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "backstage/apis/user/law-firm-user-portal-api",
    },
    {
      type: "category",
      label: "User — Profile",
      items: [
        {
          type: "doc",
          id: "backstage/apis/user/get-current-users-profile",
          label: "Get current user's profile",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/update-current-users-profile",
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
          id: "backstage/apis/user/list-members-in-users-firm",
          label: "List members in user's firm",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/get-a-specific-firm-members-profile",
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
          id: "backstage/apis/user/list-cases-accessible-to-current-user",
          label: "List cases accessible to current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/create-a-new-case",
          label: "Create a new case",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/user/get-case-details",
          label: "Get case details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/update-case-details",
          label: "Update case details",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "backstage/apis/user/list-members-assigned-to-a-case",
          label: "List members assigned to a case",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/add-a-member-to-a-case",
          label: "Add a member to a case",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/user/remove-a-member-from-a-case",
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
          id: "backstage/apis/user/list-clients-accessible-to-current-user",
          label: "List clients accessible to current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/create-a-new-client",
          label: "Create a new client",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/user/get-client-details",
          label: "Get client details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/update-client-details",
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
          id: "backstage/apis/user/list-documents-accessible-to-current-user",
          label: "List documents accessible to current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/upload-a-new-document",
          label: "Upload a new document",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/user/get-document-metadata-and-download-url",
          label: "Get document metadata and download URL",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/update-document-metadata",
          label: "Update document metadata",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "backstage/apis/user/delete-a-document",
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
          id: "backstage/apis/user/list-appointments-for-current-user",
          label: "List appointments for current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/create-a-new-appointment",
          label: "Create a new appointment",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/user/get-appointment-details",
          label: "Get appointment details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/update-appointment",
          label: "Update appointment",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "backstage/apis/user/cancel-appointment",
          label: "Cancel appointment",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "backstage/apis/user/respond-to-appointment-invitation",
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
          id: "backstage/apis/user/list-time-entries-for-current-user",
          label: "List time entries for current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/create-a-new-time-entry",
          label: "Create a new time entry",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/user/get-time-entry-details",
          label: "Get time entry details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/update-time-entry",
          label: "Update time entry",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "backstage/apis/user/delete-time-entry",
          label: "Delete time entry",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "backstage/apis/user/submit-time-entry-for-approval",
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
          id: "backstage/apis/user/list-invoices-accessible-to-current-user",
          label: "List invoices accessible to current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/get-invoice-details",
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
          id: "backstage/apis/user/list-notifications-for-current-user",
          label: "List notifications for current user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/mark-notification-as-read",
          label: "Mark notification as read",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/user/mark-all-notifications-as-read",
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
          id: "backstage/apis/user/list-comments-on-a-resource",
          label: "List comments on a resource",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "backstage/apis/user/add-a-comment-to-a-resource",
          label: "Add a comment to a resource",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "backstage/apis/user/edit-a-comment",
          label: "Edit a comment",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "backstage/apis/user/delete-a-comment",
          label: "Delete a comment",
          className: "api-method delete",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;

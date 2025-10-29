---
sidebar_position: 1
---

# System Context Diagram

This page demonstrates C4 model diagrams using Mermaid in Docusaurus.

## Law Firm Management System - Context

The following diagram shows the system context for our Law Firm Management System, illustrating how different users and external systems interact with it.

```mermaid
C4Context
    title System Context diagram for Law Firm Management System

    Person(client, "Client", "A person seeking legal services")
    Person(attorney, "Attorney", "Law firm attorney managing cases")
    Person(admin, "Administrator", "System administrator")

    System(lawfirm, "Law Firm System", "Allows attorneys to manage cases, clients, and documents")

    System_Ext(email, "Email System", "Sends notifications and correspondence")
    System_Ext(court, "Court Filing System", "External court document filing system")
    System_Ext(payment, "Payment Gateway", "Processes client payments")
    System_Ext(storage, "Cloud Storage", "Stores documents securely")

    Rel(client, lawfirm, "Views case status, uploads documents")
    Rel(attorney, lawfirm, "Manages cases, clients, documents")
    Rel(admin, lawfirm, "Configures system, manages users")

    Rel(lawfirm, email, "Sends notifications using")
    Rel(lawfirm, court, "Files documents to")
    Rel(lawfirm, payment, "Processes payments via")
    Rel(lawfirm, storage, "Stores documents in")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Key Components

- **Clients**: Can view their case status and upload documents
- **Attorneys**: Manage cases, clients, and legal documents
- **Administrators**: Configure system settings and manage users
- **External Systems**: Integration with email, court filing, payments, and storage

## System Boundaries

The Law Firm Management System acts as the central hub, integrating with various external systems while providing different interfaces for different user types.

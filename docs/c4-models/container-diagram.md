---
sidebar_position: 2
---

# Container Diagram

This diagram shows the high-level technology choices and how containers communicate with each other.

## Law Firm System - Container Level

```mermaid
C4Container
    title Container diagram for Law Firm Management System

    Person(attorney, "Attorney", "Law firm attorney")
    Person(client, "Client", "Law firm client")

    Container_Boundary(c1, "Law Firm Management System") {
        Container(web, "Web Application", "React", "Provides law firm functionality via web browser")
        Container(mobile, "Mobile App", "React Native", "Provides limited functionality for clients via mobile")
        Container(api, "API Application", "Node.js, Express", "Provides law firm functionality via JSON/HTTPS API")
        ContainerDb(db, "Database", "PostgreSQL", "Stores cases, clients, documents metadata")
        Container(fileProcessor, "File Processor", "Node.js", "Processes and validates uploaded documents")
        ContainerQueue(queue, "Message Queue", "RabbitMQ", "Handles async tasks")
    }

    System_Ext(email, "Email System", "SendGrid")
    System_Ext(storage, "Cloud Storage", "AWS S3")
    System_Ext(court, "Court System", "External API")

    Rel(attorney, web, "Uses", "HTTPS")
    Rel(client, mobile, "Uses", "HTTPS")

    Rel(web, api, "Makes API calls to", "JSON/HTTPS")
    Rel(mobile, api, "Makes API calls to", "JSON/HTTPS")

    Rel(api, db, "Reads from and writes to", "SQL/TCP")
    Rel(api, queue, "Publishes messages to", "AMQP")
    Rel(api, storage, "Stores files in", "HTTPS")

    Rel(fileProcessor, queue, "Subscribes to", "AMQP")
    Rel(fileProcessor, db, "Updates metadata in", "SQL/TCP")
    Rel(fileProcessor, storage, "Reads/writes files", "HTTPS")

    Rel(api, email, "Sends emails using", "HTTPS")
    Rel(api, court, "Files documents to", "HTTPS")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Container Descriptions

### Web Application
- **Technology**: React with TypeScript
- **Purpose**: Full-featured interface for attorneys and administrators
- **Responsibilities**: Case management, client management, document handling

### Mobile App
- **Technology**: React Native
- **Purpose**: Client portal for viewing case status
- **Responsibilities**: Limited read-only access for clients

### API Application
- **Technology**: Node.js with Express
- **Purpose**: Central business logic and data access layer
- **Responsibilities**: Authentication, authorization, business rules, data validation

### Database
- **Technology**: PostgreSQL
- **Purpose**: Persistent data storage
- **Stores**: Cases, clients, users, document metadata, audit logs

### File Processor
- **Technology**: Node.js worker service
- **Purpose**: Asynchronous document processing
- **Responsibilities**: Virus scanning, OCR, metadata extraction, thumbnails

### Message Queue
- **Technology**: RabbitMQ
- **Purpose**: Asynchronous task processing
- **Use cases**: Document processing, email notifications, report generation

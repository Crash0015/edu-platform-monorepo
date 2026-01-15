# Domain Definition – Educational Platform

## 1. Purpose

This document defines the **business domains** of the Educational Platform following a **Domain-Driven Design (DDD) inspired approach**.  
Domains are identified and grouped according to **business processes and core logic**, not technical or infrastructure concerns.

The objective is to:

- Align microservices with real business processes
- Reduce coupling between components
- Improve scalability and maintainability
- Provide a clear foundation for database modeling and architecture decisions

---

## 2. Domain Overview

The Educational Platform enables:

- Teachers to manage courses, materials, schedules, and tutorings
- Students to access academic content and book tutorings
- Secure authentication, authorization, auditing, and automation

Domains are **conceptual** and are later implemented through **microservices**.

---

## 3. Identified Domains

### 3.1 Identity & Access Domain

**Purpose:**  
Manage authentication, authorization, and access control across the platform.

**Responsibilities:**

- User authentication (login/logout)
- Password recovery
- Role-based access control (RBAC)
- Token management (JWT)
- Security policies enforcement

**Core Entities:**

- User
- Role
- Permission
- PasswordResetToken

**Associated Microservices:**

- auth-service
- user-service

---

### 3.2 Academic Management Domain

**Purpose:**  
Manage the academic structure of the platform.

**Responsibilities:**

- Course creation and management
- Assignment of teachers to courses
- Management of academic periods (optional)

**Core Entities:**

- Course
- TeacherCourse
- AcademicPeriod

**Associated Microservice:**

- course-service

---

### 3.3 Enrollment Domain

**Purpose:**  
Manage student enrollment in academic courses.

**Responsibilities:**

- Enroll students into courses
- Maintain enrollment status
- Support many-to-many relationships between students and courses

**Core Entities:**

- Enrollment

**Associated Microservice:**

- enrollment-service

---

### 3.4 Content & Materials Domain

**Purpose:**  
Manage educational content and learning materials.

**Responsibilities:**

- Upload and manage academic materials (PDFs, links, videos)
- Organize materials by course
- Control publication states (draft, published)

**Core Entities (logical):**

- Material
- MaterialAsset

**Associated Services:**

- material-service
- Strapi (Headless CMS – PaaS)

---

### 3.5 Tutoring Domain

The tutoring domain is divided into two subdomains for clarity and proper normalization.

#### 3.5.1 Schedule Subdomain

**Purpose:**  
Define teacher availability.

**Responsibilities:**

- Create and manage availability time slots
- Prevent schedule conflicts
- Support fixed or recurring schedules

**Core Entities:**

- AvailabilitySlot

**Associated Microservice:**

- schedule-service

---

#### 3.5.2 Tutoring Booking Subdomain

**Purpose:**  
Manage tutoring reservations.

**Responsibilities:**

- Search available tutorings
- Reserve and cancel tutoring sessions
- Manage tutoring lifecycle states

**Core Entities:**

- TutoringSession
- Booking

**Associated Microservice:**

- tutoring-service

---

### 3.6 Search & Discovery Domain

**Purpose:**  
Provide search and discovery capabilities across the platform.

**Responsibilities:**

- Search tutorings by availability
- Search materials by keywords
- Support advanced filtering and queries

**Associated Microservice:**

- search-service

---

### 3.7 Notification & Communication Domain

**Purpose:**  
Handle system notifications and messaging.

**Responsibilities:**

- Notify students and teachers of important events
- Manage email and alert delivery

**Associated Microservice:**

- notification-service

---

### 3.8 Audit & Compliance Domain

**Purpose:**  
Ensure traceability and compliance.

**Responsibilities:**

- Record critical system events
- Maintain immutable audit logs
- Support monitoring and compliance requirements

**Associated Microservice:**

- audit-service

---

### 3.9 Automation Domain

**Purpose:**  
Automate business processes and workflows.

**Responsibilities:**

- Trigger workflows based on domain events
- Integrate notifications and audit processes
- Reduce manual intervention

**Associated Services:**

- automation-service
- n8n (workflow engine)

---

## 4. Domain-to-Microservice Mapping Summary

| Domain              | Microservice(s)            |
| ------------------- | -------------------------- |
| Identity & Access   | auth-service, user-service |
| Academic Management | course-service             |
| Enrollment          | enrollment-service         |
| Content & Materials | material-service, Strapi   |
| Schedule            | schedule-service           |
| Tutoring Booking    | tutoring-service           |
| Search & Discovery  | search-service             |
| Notifications       | notification-service       |
| Audit & Compliance  | audit-service              |
| Automation          | automation-service         |

---

## 5. Design Principles Applied

- Separation of concerns
- Low coupling between domains
- High cohesion within domains
- Event-driven integration
- UUID-based entity identification
- Alignment with normalized relational models (3NF)

---

## 6. Conclusion

This domain definition establishes a solid foundation for:

- Database design
- Microservice implementation
- Event-driven integration
- Secure and scalable architecture

All subsequent implementation decisions must align with these domain boundaries.

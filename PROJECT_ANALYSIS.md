# NotaryNow - Project Analysis & System Design Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Authorization](#authentication--authorization)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Data Flow Analysis](#data-flow-analysis)
8. [Technical Stack](#technical-stack)
9. [Current Implementation Status](#current-implementation-status)
10. [System Requirements](#system-requirements)
11. [Recommendations for Architecture](#recommendations-for-architecture)

---

## Project Overview

**NotaryNow** is a comprehensive online notary services platform that connects customers with professional notaries. The system facilitates appointment booking, service management, and provides role-based dashboards for different user types.

### Core Business Logic
- **Customer Journey**: Search notaries → Book appointments → Get services → Leave reviews
- **Notary Journey**: Manage profile → Set services → Handle appointments → Track earnings
- **Admin Journey**: Approve notaries → Manage system → View analytics → Handle certifications

### Key Features
- Multi-role user management (Customer, Notary, Secretary, Admin)
- Real-time appointment booking system
- Notary certification and approval workflow
- Service pricing and customization
- Review and rating system
- Comprehensive admin dashboard with analytics

---

## System Architecture

### Architecture Pattern
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (Prisma +     │
│                 │    │                 │    │   SQLite)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │    │   Middleware    │    │   Seed Data     │
│   - UI Library  │    │   - Auth Guard  │    │   - Test Users  │
│   - Role-based  │    │   - Route Prot. │    │   - Services    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Application Layers

#### 1. Presentation Layer (Frontend)
- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables
- **State Management**: React hooks + Context API
- **Authentication**: NextAuth.js client-side session management

#### 2. Business Logic Layer (API Routes)
- **Authentication**: NextAuth.js with JWT sessions
- **Authorization**: Role-based access control
- **Data Validation**: Zod schemas (partially implemented)
- **Business Rules**: Embedded in API route handlers

#### 3. Data Access Layer
- **ORM**: Prisma Client
- **Database**: SQLite (development) / PostgreSQL (recommended for production)
- **Migrations**: Prisma migrate
- **Seeding**: Automated test data generation

---

## Database Schema

### Entity Relationship Overview

```
User (1) ──────── (0..1) NotaryProfile
│                           │
│ (1)                      │ (1)
│                           │
│ (0..*)                   ├── (0..*) NotaryCertification ──── (0..*) Certification
│                           │
Appointment                 └── (0..*) NotaryService ──────── (0..*) Service
│                                                                │
│ (1)                                                           │ (1)
│                                                               │
└── (0..*) Review                                              │
                                                                │
                                                    Appointment ──┘ (0..*)
```

### Detailed Schema Definitions

#### Core Entities

**User Table**
```sql
User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String    -- bcrypt hashed
  role          UserRole  @default(CUSTOMER)
  phone         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

UserRole ENUM {
  CUSTOMER
  NOTARY
  SECRETARY
  ADMIN
}
```

**NotaryProfile Table**
```sql
NotaryProfile {
  id            String    @id @default(cuid())
  userId        String    @unique
  isApproved    Boolean   @default(false)
  address       String
  city          String
  state         String
  zip           String
  hourlyRate    Float
  averageRating Float     @default(0)
  bio           String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

**Service Table**
```sql
Service {
  id          String    @id @default(cuid())
  name        String    @unique
  description String
  basePrice   Float
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Appointment Table**
```sql
Appointment {
  id            String   @id @default(cuid())
  customerId    String
  notaryId      String
  serviceId     String
  scheduledTime DateTime
  duration      Int      -- in minutes
  status        String   @default("pending")
  totalCost     Float
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

-- Status values: pending, approved, denied, completed, cancelled
```

#### Junction Tables

**NotaryService** (Many-to-Many: Notary ↔ Service)
```sql
NotaryService {
  id              String        @id @default(cuid())
  notaryProfileId String
  serviceId       String
  customPrice     Float?        -- Override base price
  createdAt       DateTime      @default(now())
  
  @@unique([notaryProfileId, serviceId])
}
```

**NotaryCertification** (Many-to-Many: Notary ↔ Certification)
```sql
NotaryCertification {
  id              String        @id @default(cuid())
  notaryProfileId String
  certificationId String
  dateObtained    DateTime?
  documentUrl     String?       -- File upload path
  createdAt       DateTime      @default(now())
  
  @@unique([notaryProfileId, certificationId])
}
```

**Certification Table**
```sql
Certification {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Review Table**
```sql
Review {
  id            String   @id @default(cuid())
  appointmentId String
  customerId    String
  rating        Int      -- 1-5 scale
  comment       String?
  createdAt     DateTime @default(now())
}
```

---

## API Endpoints

### Authentication Endpoints
```
POST   /api/auth/register           -- User registration
GET    /api/auth/[...nextauth]      -- NextAuth.js handlers
POST   /api/auth/[...nextauth]      -- NextAuth.js handlers
```

### Public Endpoints
```
GET    /api/notaries               -- Search notaries (public)
GET    /api/services               -- List all services
GET    /api/certifications         -- List certification types
```

### User-Specific Endpoints
```
GET    /api/appointments           -- User's appointments (role-filtered)
POST   /api/appointments           -- Create appointment
GET    /api/appointments/[id]      -- Appointment details
PATCH  /api/appointments/[id]      -- Update appointment

GET    /api/notaries/profile       -- Notary profile management
PATCH  /api/notaries/profile       -- Update notary profile
GET    /api/notaries/services/[id] -- Notary's services
POST   /api/notaries/services/[id] -- Add service to notary
DELETE /api/notaries/services/[id] -- Remove service from notary

GET    /api/notaries/certifications/[id] -- Notary certifications
POST   /api/notaries/certifications/[id] -- Add certification
DELETE /api/notaries/certifications/[id] -- Remove certification

POST   /api/reviews                -- Create review
GET    /api/reviews                -- List reviews
```

### Admin-Only Endpoints
```
GET    /api/admin/stats            -- Dashboard statistics
GET    /api/admin/users            -- User management
GET    /api/admin/notaries         -- Notary management
PATCH  /api/admin/notaries/approve/[id] -- Approve/deny notary

GET    /api/admin/certifications   -- Certification management
POST   /api/admin/certifications   -- Create certification type
GET    /api/admin/certifications/pending -- Pending certifications
PATCH  /api/admin/certifications/approve/[id] -- Approve certification
```

---

## Authentication & Authorization

### Authentication Flow
```
1. User Login Request
   ↓
2. Credentials Validation (bcrypt)
   ↓
3. JWT Token Generation (30-day expiry)
   ↓
4. Session Storage (client-side)
   ↓
5. Automatic Role-Based Redirect
```

### Authorization Matrix

| Endpoint Category | Customer | Notary | Secretary | Admin |
|------------------|----------|--------|-----------|-------|
| Public APIs      | ✅       | ✅     | ✅        | ✅    |
| Own Profile      | ✅       | ✅     | ✅        | ✅    |
| Appointments     | ✅ (own) | ✅ (own) | ✅ (view) | ✅ (all) |
| Notary Profile   | ❌       | ✅     | ✅        | ✅    |
| Reviews          | ✅       | ❌     | ❌        | ✅    |
| Admin Functions  | ❌       | ❌     | ❌        | ✅    |

### Session Management
- **JWT Strategy**: Stateless tokens with user info
- **Session Duration**: 30 days with automatic refresh
- **Session Data**: `{ id, name, email, role }`
- **Security**: HTTP-only cookies, CSRF protection

---

## User Roles & Permissions

### Role Definitions

#### CUSTOMER
**Capabilities:**
- Search and browse notaries
- Book appointments with available notaries
- View and manage own appointments
- Leave reviews after completed appointments
- Manage personal profile and settings

**Dashboard Access:** `/dashboard/customer`
**Key Features:** Appointment history, booking interface, document management

#### NOTARY
**Capabilities:**
- Manage notary profile and bio
- Set availability and service areas
- Configure custom pricing for services
- Accept/decline appointment requests
- View customer information for appointments
- Manage certifications and qualifications

**Dashboard Access:** `/dashboard/notary`
**Key Features:** Appointment management, earnings tracking, customer communication

#### SECRETARY
**Capabilities:**
- Assist notaries with administrative tasks
- View notary appointments and schedules
- Help manage customer communications
- Limited access to system functions

**Dashboard Access:** `/dashboard/secretary` (partially implemented)
**Key Features:** Assistant interface, limited admin functions

#### ADMIN
**Capabilities:**
- Full system administration
- Approve/deny notary applications
- Manage all users and roles
- View system-wide analytics
- Manage service types and pricing
- Handle certification approvals
- System configuration and maintenance

**Dashboard Access:** `/dashboard/admin`
**Key Features:** User management, analytics, system configuration

---

## Data Flow Analysis

### Critical Business Processes

#### 1. Notary Onboarding Flow
```
Registration → Profile Creation → Certification Upload → Admin Review → Approval → Active Status
```

#### 2. Appointment Booking Flow
```
Customer Search → Notary Selection → Service Choice → Time Scheduling → Payment → Confirmation
```

#### 3. Service Delivery Flow
```
Appointment Reminder → Meeting Execution → Service Completion → Review Request → Rating Submission
```

#### 4. Admin Management Flow
```
Pending Requests → Review Process → Approval/Denial → Notification → Status Update
```

### Data Dependencies

**User Creation:**
1. User record created with basic info
2. Role-specific profile creation (if NOTARY)
3. Default permissions assigned
4. Welcome email/notification

**Appointment Creation:**
1. Validation: Customer + Notary + Service + Time
2. Availability check
3. Price calculation
4. Conflict resolution
5. Confirmation notifications

**Notary Approval:**
1. Profile completeness check
2. Certification verification
3. Background check status
4. Admin review process
5. Status update + notifications

---

## Technical Stack

### Frontend Technologies
- **Framework**: Next.js 15 (App Router)
- **React Version**: 19.0.0
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form (implied usage)
- **Notifications**: Sonner (toast notifications)
- **Theme**: next-themes (dark mode support)

### Backend Technologies
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Authentication**: NextAuth.js 4.24.11
- **Database ORM**: Prisma 6.4.1
- **Database**: SQLite (dev) / PostgreSQL (recommended)
- **Validation**: Zod 3.24.2
- **Password Hashing**: bcrypt 5.1.1

### Development Tools
- **TypeScript**: 5.x
- **ESLint**: 9.x with Next.js config
- **Package Manager**: npm
- **Database Tools**: Prisma Studio
- **Code Quality**: TypeScript strict mode

---

## Current Implementation Status

### ✅ Completed Features

#### Authentication System
- [x] User registration with role selection
- [x] JWT-based authentication
- [x] Role-based route protection
- [x] Session management
- [x] Password hashing and security

#### User Management
- [x] Multi-role user system
- [x] Profile management for all roles
- [x] Notary approval workflow
- [x] Admin user management interface

#### Core Business Logic
- [x] Service catalog management
- [x] Appointment booking system
- [x] Notary search and filtering
- [x] Review and rating system
- [x] Certification management

#### Dashboard Interfaces
- [x] Admin dashboard with analytics
- [x] Notary management interface
- [x] Customer booking interface
- [x] Real-time data updates

#### Database Design
- [x] Complete schema design
- [x] Proper relationships and constraints
- [x] Data seeding for testing
- [x] Migration system

### ⚠️ Partially Implemented

#### API Layer
- [x] Core endpoints functional
- [⚠️] Inconsistent input validation
- [⚠️] Missing error handling in some routes
- [⚠️] No rate limiting or caching

#### Security
- [x] Basic authentication
- [x] Role-based authorization
- [⚠️] Missing CSRF protection
- [⚠️] No audit logging
- [⚠️] Input sanitization needs improvement

#### User Experience
- [x] Responsive design
- [x] Loading states
- [⚠️] Error handling could be enhanced
- [⚠️] Offline functionality missing

### ❌ Missing Features

#### Production Readiness
- [ ] File upload system for documents
- [ ] Email notification system
- [ ] Production database setup
- [ ] Performance monitoring
- [ ] Backup and recovery procedures

#### Advanced Features
- [ ] Real-time chat/messaging
- [ ] Calendar integration
- [ ] Payment processing
- [ ] Mobile app API
- [ ] Advanced search filters

#### Secretary Role
- [ ] Complete secretary interface
- [ ] Assistant workflow implementation
- [ ] Permission refinement

---

## System Requirements

### Functional Requirements

#### User Management
- Multi-role authentication system
- Profile management for each role type
- Account approval workflow for notaries
- Password reset and account recovery

#### Appointment System
- Real-time availability checking
- Booking confirmation and notifications
- Appointment status management
- Calendar integration capability

#### Service Management
- Dynamic service catalog
- Custom pricing per notary
- Service category organization
- Bulk service assignments

#### Admin Features
- Comprehensive user management
- System analytics and reporting
- Certification approval workflow
- Content management capabilities

### Non-Functional Requirements

#### Performance
- Page load time < 3 seconds
- API response time < 500ms
- Support for 1000+ concurrent users
- Database query optimization

#### Security
- OWASP security compliance
- Data encryption at rest and in transit
- Role-based access control
- Input validation and sanitization

#### Scalability
- Horizontal scaling capability
- Database replication support
- CDN integration for static assets
- Microservices migration path

#### Reliability
- 99.9% uptime availability
- Automated backup system
- Disaster recovery procedures
- Monitoring and alerting

---

## Recommendations for Architecture

### Immediate Improvements (Phase 1)

#### Database Migration
- **Current**: SQLite (development only)
- **Recommended**: PostgreSQL or MySQL
- **Rationale**: Production scalability, concurrent connections, advanced features

#### Input Validation Enhancement
- Implement comprehensive Zod schemas for all API endpoints
- Add request sanitization middleware
- Standardize error response formats

#### File Upload System
- Add file upload capability for certification documents
- Implement file storage (AWS S3 or similar)
- Add image processing for profile pictures

#### Email Notifications
- Integrate email service (SendGrid, AWS SES)
- Create email templates for all user actions
- Implement notification preferences

### Medium-term Enhancements (Phase 2)

#### Performance Optimization
- Implement Redis caching layer
- Add database query optimization
- Implement API rate limiting
- Add image optimization and CDN

#### Security Hardening
- Add CSRF protection
- Implement audit logging
- Add input rate limiting
- Enhance session security

#### Advanced Features
- Real-time messaging system
- Calendar integration (Google, Outlook)
- Advanced search with Elasticsearch
- Mobile API optimization

### Long-term Architecture (Phase 3)

#### Microservices Migration
```
Monolith → API Gateway → Microservices
                     ├── User Service
                     ├── Appointment Service  
                     ├── Notification Service
                     ├── Payment Service
                     └── Analytics Service
```

#### Infrastructure Scaling
- Container orchestration (Kubernetes)
- Service mesh implementation
- Auto-scaling capabilities
- Multi-region deployment

#### Advanced Analytics
- Business intelligence dashboard
- Predictive analytics for demand
- Revenue optimization algorithms
- Customer behavior analysis

### Technical Debt Resolution

#### Code Quality
- Implement comprehensive testing (unit, integration, e2e)
- Add API documentation (OpenAPI/Swagger)
- Standardize coding conventions
- Add performance monitoring

#### Monitoring and Observability
- Application performance monitoring (APM)
- Error tracking and alerting
- User behavior analytics
- System health dashboards

---

## Conclusion

NotaryNow represents a well-architected foundation for a notary services platform with solid authentication, role-based access control, and a comprehensive data model. The current implementation provides a strong MVP that can handle the core business requirements.

The system demonstrates good separation of concerns, modern development practices, and scalable architecture patterns. With the recommended enhancements, it can evolve into a production-ready platform capable of serving thousands of users while maintaining security, performance, and reliability standards.

The modular design allows for incremental improvements and feature additions without major architectural changes, making it suitable for both startup environments and enterprise-scale deployments.
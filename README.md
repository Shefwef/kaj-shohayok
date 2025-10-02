# 🚀 Kaj Shohayok - Enterprise Task Management Platform

> **A production-ready, enterprise-grade task management system built with Next.js 15, TypeScript, and comprehensive RBAC**

An advanced project and task management platform featuring real-time collaboration, analytics dashboard, multi-database architecture, and enterprise-level security. Built to handle complex organizational workflows with scalable architecture and modern development practices.

[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-purple.svg)](https://clerk.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📋 **Project Overview**

This Enterprise Task Management Platform addresses the core requirements of modern organizational project management:

- **✅ User Management**: Complete role-based permissions system across organizations
- **✅ Project Management**: Create, organize, and track projects with advanced features
- **✅ Task Management**: Comprehensive task system with priorities, deadlines, and team assignments
- **✅ Analytics Dashboard**: Real-time project tracking, performance metrics, and detailed reporting
- **✅ Mobile Responsive**: Fully responsive design optimized for all device sizes
- **✅ Enterprise Security**: Production-grade authentication, authorization, and data protection

## 🎯 **Key Features**

### 🛡️ **Enterprise Security**

- **Role-Based Access Control (RBAC)** - Admin, Manager, Member, Viewer roles
- **Permission-based Authorization** - Granular resource-level permissions
- **Organization Scoping** - Multi-tenant data isolation
- **Clerk Authentication** - Enterprise-grade user management
- **Rate Limiting** - API abuse prevention

### 📊 **Project & Task Management**

- **Advanced Project Management** - Status tracking, budgeting, team collaboration
- **Intelligent Task System** - Dependencies, assignments, time tracking
- **Real-time Analytics** - Performance metrics and reporting
- **MongoDB Integration** - Scalable document storage
- **PostgreSQL Support** - Structured data with Prisma ORM

### 👨‍💼 **Administrative Dashboard**

- **User Management** - Role assignments and organization management
- **Permission Management** - Dynamic role creation with custom permissions
- **Analytics Dashboard** - Real-time metrics and insights
- **Organization Administration** - Multi-tenant management interface

## 🏗️ **Tech Stack & Architecture**

### **📱 Frontend (Next.js Full-Stack)**

- **Next.js 15** - React framework with App Router and server components
- **TypeScript** - Full type safety across the application
- **Tailwind CSS** - Utility-first responsive design system
- **Lucide Icons** - Modern, consistent icon library
- **Real-time Validation** - Client-side form validation with optimistic UI
- **Responsive Design** - Mobile-first approach with complete device compatibility

### **⚙️ Backend & API**

- **Next.js API Routes** - Serverless backend functions with middleware
- **Server-side Validation** - Comprehensive data validation and sanitization
- **API Rate Limiting** - Protection against abuse with Redis-based limiting
- **Role-based Access Control** - Granular permission system implementation
- **RESTful Architecture** - Well-structured API endpoints with proper HTTP methods

### **🗄️ Dual Database Architecture**

- **PostgreSQL + Prisma ORM** - Structured data (users, roles, organizations, audit logs)
- **MongoDB + Mongoose** - Document storage (projects, tasks, notifications, analytics)
- **Multi-database Strategy** - Optimized data storage for different use cases
- **Data Persistence** - Full Docker volume persistence for production reliability

### **🔐 Security & Authentication**

- **Clerk Authentication** - Enterprise-grade user management with MFA support
- **Password Security** - bcrypt + Argon2 hashing handled by Clerk infrastructure
- **JWT Session Management** - Secure token-based authentication with auto-rotation
- **CORS Configuration** - Cross-origin security with Next.js built-in mechanisms
- **Environment Security** - Comprehensive environment variable management

### **🐳 DevOps & Deployment**

- **Docker Multi-container Setup** - 6-service architecture with health checks
  - PostgreSQL (Users & RBAC)
  - MongoDB (Projects & Tasks)
  - Redis (Caching & Rate Limiting)
  - Next.js App (Main Application)
  - Adminer (PostgreSQL Admin)
  - Mongo Express (MongoDB Admin)
- **Data Persistence** - Named Docker volumes for all databases
- **Service Orchestration** - Complete docker-compose configuration
- **Health Monitoring** - Built-in health checks for all services

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+ and npm/yarn
- PostgreSQL database
- MongoDB database
- Clerk account for authentication

### **Environment Setup**

Create `.env.local` file:

```bash
# Database URLs
DATABASE_URL="postgresql://username:password@localhost:5432/kaj_shohayok"
MONGODB_URI="mongodb://localhost:27017/kaj_shohayok"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Optional: Rate Limiting
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### **🚀 Installation & Setup**

#### **Option 1: Docker Setup (Recommended)**

```bash
# Clone the repository
git clone <repository-url>
cd kaj-shohayok

# Start all services with Docker
docker-compose up -d

# Access services:
# - Main App: http://localhost:3000
# - PostgreSQL Admin: http://localhost:8080
# - MongoDB Admin: http://localhost:8081
```

#### **Option 2: Local Development Setup**

```bash
# 1. Clone & Install Dependencies
git clone <repository-url>
cd kaj-shohayok
npm install

# 2. Setup Environment Variables
cp .env.example .env.local
# Edit .env.local with your database URLs and Clerk keys

# 3. Database Setup
npx prisma generate
npx prisma db push
# MongoDB collections auto-created on first connection

# 4. Start Development Server
npm run dev

# 5. Access Application
# - Main App: http://localhost:3000
# - Admin Dashboard: http://localhost:3000/dashboard/admin (admin role required)
```

#### **🔧 Post-Setup Configuration**

```bash
# Generate test data (optional)
npm run seed

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

## 📁 **Project Structure**

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── analytics/     # Analytics endpoints
│   │   ├── projects/      # Project management
│   │   ├── roles/         # RBAC role management
│   │   ├── organizations/ # Organization management
│   │   ├── tasks/         # Task management
│   │   └── users/         # User management
│   ├── dashboard/         # Protected dashboard pages
│   │   ├── admin/         # Admin interface
│   │   ├── analytics/     # Analytics dashboard
│   │   ├── projects/      # Project management UI
│   │   └── tasks/         # Task management UI
│   └── (auth)/           # Authentication pages
├── components/            # Reusable UI components
├── lib/                  # Utilities and configurations
│   ├── db/               # Database connections
│   ├── permissions.ts    # RBAC permission system
│   ├── types.ts          # TypeScript definitions
│   └── validations/      # Data validation schemas
├── models/               # MongoDB/Mongoose models
└── middleware.ts         # Route protection middleware
```

## 🔐 **RBAC System**

### **Roles & Permissions**

| Role        | Permissions                    | Access Level            |
| ----------- | ------------------------------ | ----------------------- |
| **Admin**   | All permissions                | Full system access      |
| **Manager** | Project & user management      | Organization management |
| **Member**  | Create & update tasks/projects | Standard operations     |
| **Viewer**  | Read-only access               | Limited viewing         |

### **Permission Structure**

```typescript
- create:project, read:project, update:project, delete:project
- create:task, read:task, update:task, delete:task, assign:task
- view:analytics, manage:users, manage:roles
```

### **Resource Access Control**

- **Projects**: Owner or team member access
- **Tasks**: Access via project membership
- **Organizations**: Role-based isolation
- **Admin Functions**: Admin-only access

## 🧪 **API Testing & Documentation**

### **📋 Complete Postman Collection**

Import `KajShohayok_API_Collection.json` for comprehensive API testing:

#### **🔧 Collection Setup**

```json
{
  "baseUrl": "http://localhost:3000",
  "clerk_session_token": "your_clerk_session_token_here",
  "user_id": "your_clerk_user_id_here"
}
```

#### **📚 Included Test Workflows**

- ✅ **Authentication Flow** - User session management with Clerk
- ✅ **RBAC Operations** - Role and permission testing across organizations
- ✅ **Project Lifecycle** - Complete CRUD operations with team management
- ✅ **Task Management** - Assignment workflows, status updates, dependencies
- ✅ **Analytics Retrieval** - Dashboard data and performance metrics
- ✅ **Error Handling** - Validation errors, permission denials, rate limiting

### **🎯 API Endpoint Coverage**

#### **Authentication & User Management**

```http
GET    /api/health              # System health check
GET    /api/users/me            # Current user profile
GET    /api/users               # List users (admin)
POST   /api/sync-users          # Sync Clerk users
POST   /api/webhooks/clerk      # Clerk webhook handler
```

#### **RBAC & Organization Management**

```http
GET    /api/roles               # List all roles
POST   /api/roles               # Create new role
PUT    /api/roles/[id]          # Update role permissions
DELETE /api/roles/[id]          # Delete role

GET    /api/organizations       # List organizations
POST   /api/organizations       # Create organization
PUT    /api/organizations/[id]  # Update organization
```

#### **Project Management**

```http
GET    /api/projects            # List projects (with pagination & filters)
POST   /api/projects            # Create new project
GET    /api/projects/[id]       # Get project details
PUT    /api/projects/[id]       # Update project
DELETE /api/projects/[id]       # Delete project
```

#### **Task Management**

```http
GET    /api/tasks               # List tasks (with filters & assignments)
POST   /api/tasks               # Create new task
GET    /api/tasks/[id]          # Get task details
PUT    /api/tasks/[id]          # Update task status/assignment
DELETE /api/tasks/[id]          # Delete task
```

#### **Analytics & Reporting**

```http
GET    /api/analytics           # Dashboard analytics data
GET    /api/analytics/projects  # Project-specific metrics
GET    /api/analytics/tasks     # Task performance data
GET    /api/analytics/users     # User productivity metrics
```

### **📊 Real Data Integration**

The Postman collection includes realistic test data:

- **Authentic User IDs** - Real Clerk user identifiers
- **University Project Context** - "University Management System" scenarios
- **Realistic Timestamps** - October 2025 data within specified timeframes
- **MongoDB ObjectIds** - Valid document references for testing relationships

## 🐳 **Production-Ready Docker Architecture**

### **🏗️ Multi-Container Setup**

```yaml
services:
  postgres: # User & RBAC data (port 5432)
  mongodb: # Projects & tasks (port 27017)
  redis: # Caching & rate limiting (port 6379)
  app: # Next.js application (port 3000)
  adminer: # PostgreSQL admin UI (port 8080)
  mongo-express: # MongoDB admin UI (port 8081)
```

### **💾 Data Persistence**

- **Named Volumes** - `postgres_data`, `mongodb_data`, `redis_data`
- **Configuration Persistence** - MongoDB config directory mounting
- **Automatic Backups** - Volume-based data protection
- **Development Safety** - Data survives container recreation

### **🔄 Development Workflow**

```bash
# Start complete environment
docker-compose up -d

# View service status
docker-compose ps

# Check service logs
docker-compose logs -f app

# Access admin interfaces
open http://localhost:8080  # PostgreSQL Admin
open http://localhost:8081  # MongoDB Admin

# Stop all services
docker-compose down

# Reset data (if needed)
docker-compose down -v
docker volume prune
```

### **🚀 Production Deployment**

```bash
# Production build
docker build -t kaj-shohayok:prod --target production .

# Production run with environment
docker run -d \
  --name kaj-shohayok-prod \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  kaj-shohayok:prod

# Health monitoring
docker exec kaj-shohayok-prod curl -f http://localhost:3000/api/health
```

### **📊 Service Health Checks**

- **PostgreSQL**: `pg_isready` connection validation
- **MongoDB**: Database ping verification
- **Redis**: Connection and response testing
- **Next.js App**: HTTP health endpoint monitoring
- **Startup Dependencies**: Proper service ordering with health conditions

## 📊 **Features Guide**

### **Dashboard Navigation**

- **Main Dashboard**: Overview and quick actions
- **Projects**: Create, manage, and track projects
- **Tasks**: Task creation, assignment, and tracking
- **Analytics**: Performance metrics and reports
- **Admin Panel**: User and role management (admin only)

### **RBAC Administration**

1. **Access Admin Dashboard**: `/dashboard/admin` (admin role required)
2. **Create Roles**: Define custom roles with specific permissions
3. **Manage Organizations**: Create and configure organizations
4. **User Management**: View users, roles, and assignments

### **Project Workflow**

1. **Create Project**: Define scope, team, and timeline
2. **Add Tasks**: Break down work into manageable tasks
3. **Assign Team**: Add team members with appropriate roles
4. **Track Progress**: Monitor status and performance
5. **Analytics**: Review completion metrics

## 🔍 **Comprehensive Testing Guide**

### **🧪 Automated Testing with Postman**

The included collection provides complete API coverage:

```bash
# Import collection into Postman
1. Open Postman
2. Import "KajShohayok_API_Collection.json"
3. Set environment variables:
   - baseUrl: http://localhost:3000
   - clerk_session_token: [your-session-token]
   - user_id: [your-clerk-user-id]
4. Run collection tests to verify all endpoints
```

### **📋 Manual Testing Checklist**

#### **✅ Authentication & Authorization**

- [ ] Sign up new users via Clerk interface
- [ ] Sign in with existing credentials
- [ ] Verify JWT session token generation
- [ ] Test automatic session refresh
- [ ] Validate role-based dashboard access

#### **✅ RBAC System Testing**

- [ ] Create custom roles with specific permissions
- [ ] Assign roles to different users
- [ ] Verify permission enforcement across resources
- [ ] Test organization-level data isolation
- [ ] Validate admin-only functionality access

#### **✅ Project Management Workflow**

- [ ] Create projects with different priority levels
- [ ] Add team members to projects
- [ ] Update project status and progress tracking
- [ ] Test project deletion and data cleanup
- [ ] Verify project-level permission inheritance

#### **✅ Task Management System**

- [ ] Create tasks within projects
- [ ] Assign tasks to specific team members
- [ ] Update task status (todo → in_progress → completed)
- [ ] Test task priority and deadline management
- [ ] Verify task-project relationship integrity

#### **✅ Analytics & Reporting**

- [ ] View real-time dashboard metrics
- [ ] Verify project progress calculations
- [ ] Test user productivity analytics
- [ ] Validate permission-based data filtering
- [ ] Check analytics data accuracy


### **🔧 Development Testing**

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build

# Database connection testing
npm run test:db

# API endpoint testing
npm run test:api
```

## 🚀 **Production Deployment**

### **🔐 Environment Configuration**

Create production environment file:

```bash
# .env.production
DATABASE_URL="postgresql://user:pass@prod-postgres:5432/kaj_shohayok"
MONGODB_URI="mongodb://user:pass@prod-mongo:27017/kaj_shohayok"

# Production Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."

# Production Redis (if using)
REDIS_URL="redis://prod-redis:6379"
UPSTASH_REDIS_REST_URL="https://prod-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="prod_token_here"

# Security Settings
NODE_ENV=production
RATE_LIMIT_REQUESTS_PER_MINUTE=60
JWT_SECRET="production_jwt_secret_change_me"
```

### **📦 Database Migrations**

```bash
# PostgreSQL schema deployment
npx prisma migrate deploy
npx prisma generate

# MongoDB indexes (auto-created)
# Collections and indexes created automatically on first connection
```

### **🏗️ Build & Deploy Options**

#### **Docker Multi-Container Setup (Ready to Use)**

> **✅ Complete 6-service architecture already configured and tested**

```bash
# Single command deployment - Everything included!
docker-compose up -d

# All services automatically started:
# ✔ PostgreSQL (Users & RBAC data)
# ✔ MongoDB (Projects & Tasks)
# ✔ Redis (Caching & Rate Limiting)
# ✔ Next.js App (Main Application)
# ✔ Adminer (PostgreSQL Admin UI)
# ✔ Mongo Express (MongoDB Admin UI)

# Verify deployment
docker-compose ps
curl -f http://localhost:3000/api/health
```

#### **Production Scaling Options**

```bash
# Scale specific services
docker-compose up -d --scale app=3

# Production deployment with custom compose
docker-compose -f docker-compose.prod.yml up -d

# Health monitoring across services
docker-compose logs -f app
```

#### **Vercel Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
```

#### **Traditional Server**

```bash
# Build application
npm run build

# Start production server
npm start

# Process management with PM2
npm i -g pm2
pm2 start ecosystem.config.js
```

### **🔍 Production Monitoring**

- **Health Endpoint**: `/api/health` - System status monitoring
- **Database Connections**: Automatic connection health checks
- **Rate Limiting**: Monitor API usage patterns
- **Error Logging**: Comprehensive error tracking and reporting
- **Performance Metrics**: Built-in analytics for system performance

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

For support and questions:

- Create an issue in the repository
- Check the documentation and API collection
- Review the code comments and type definitions

---

## 📈 **Performance & Scalability**

### **🚀 Optimization Features**

- **Server Components** - Reduced client-side JavaScript bundle
- **Image Optimization** - Next.js automatic image optimization
- **Code Splitting** - Dynamic imports and lazy loading
- **API Rate Limiting** - Redis-based request throttling
- **Database Indexing** - Optimized queries for both SQL and NoSQL
- **Caching Strategy** - Multi-layer caching implementation

### **📊 Scalability Considerations**

- **Microservice Ready** - Modular API architecture
- **Database Sharding** - MongoDB horizontal scaling support
- **Load Balancing** - Stateless application design
- **Container Orchestration** - Kubernetes-ready Docker setup
- **CDN Integration** - Static asset optimization

## 🏆 **Project Achievements**

### **✅ Requirements Compliance**

- **✓ User Management** - Complete RBAC system with organizational scoping
- **✓ Project Management** - Advanced project lifecycle management
- **✓ Task Management** - Comprehensive task system with dependencies
- **✓ Analytics Dashboard** - Real-time metrics and performance tracking

### **✅ Technical Implementation**

- **✓ Next.js Full-Stack** - Modern React framework with TypeScript
- **✓ Dual Database** - PostgreSQL + MongoDB architecture
- **✓ Real-time Validation** - Client and server-side validation
- **✓ API Rate Limiting** - Redis-based protection mechanisms
- **✓ Role-based Access** - Granular permission system

### **✅ Security & Deployment**

- **✓ Password Security** - Enterprise-grade Clerk authentication
- **✓ CORS Configuration** - Next.js built-in security mechanisms
- **✓ Environment Variables** - Comprehensive configuration management
- **✓ Multi-container Docker** - Production-ready containerization with persistence

### **✅ Documentation & Testing**

- **✓ Complete README** - Comprehensive setup and usage documentation
- **✓ Postman Collection** - Full API testing coverage with realistic data
- **✓ Code Documentation** - TypeScript definitions and inline comments

---

## 🌟 **Enterprise-Ready Task Management Solution**

**Kaj Shohayok** represents a modern approach to enterprise task management, combining cutting-edge technologies with robust architecture patterns. Built using Next.js, TypeScript, and a commitment to code quality and user experience.

### **🚀 Production Ready | 🔒 Enterprise Security | 📱 Mobile First | 🧪 Fully Tested**

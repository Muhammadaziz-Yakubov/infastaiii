# InFast AI - Family System Architecture

## 🏗️ Architecture Overview

The Family System for InFast AI is built using **Clean Architecture** principles with **Node.js + TypeScript** and **MongoDB (Mongoose)**. The system follows a modular, scalable design with proper separation of concerns.

## 📋 System Requirements Met

✅ **Family Entity**
- Family model with id, name, ownerId, members[], subscriptionPlan, createdAt
- FREE plan: 1 family per user limit enforced
- PREMIUM/PRO: Multiple families support

✅ **Family Members** 
- FamilyMember logic with userId, role (ADMIN|MEMBER|CHILD), joinedAt, permissions
- FREE plan: max 3 members
- PREMIUM/PRO: unlimited members
- Only ADMIN can invite/remove members

✅ **Invitation System**
- Invite via link or code with expiration time
- Accept/Reject functionality
- Subscription limit validation

✅ **Role & Access Control**
- RBAC implementation with Guards & Decorators
- ADMIN: full access
- MEMBER: tasks, goals, finance view
- CHILD: limited access (tasks only)

✅ **Monetization Rules**
- FREE: 1 family, max 3 members, no AI, no SMS
- PREMIUM: unlimited members, AI analysis, SMS notifications, child control
- PRO: All PREMIUM features + advanced challenges

## 🗂️ Project Structure

```
backend/src/
├── controllers/
│   ├── familyController.js      # Family CRUD operations
│   └── aiController.js         # AI-powered insights
├── services/
│   ├── familyService.js        # Business logic
│   ├── aiService.js           # AI analysis hooks
│   └── notificationService.js # Real-time notifications
├── models/
│   ├── Family.js              # Enhanced family schema
│   └── FamilyInvitation.js    # Invitation system
├── dto/
│   └── familyDto.js           # Data transfer objects
├── guards/
│   └── familyGuard.js         # RBAC guards & decorators
├── middleware/
│   └── monetizationMiddleware.js # Subscription validation
└── routes/
    └── familyRoutes.js        # API endpoints with protection
```

## 🔐 Security & Access Control

### RBAC Implementation
```javascript
// Role-based access control
const { FamilyGuard, PermissionDecorator } = require('../guards/familyGuard');

// Route protection examples
router.get('/:familyId', FamilyGuard.requireFamilyMember, controller.getFamily);
router.post('/:familyId/invite', FamilyGuard.requirePermission('canInviteMembers'), controller.invite);
router.get('/:familyId/finances', PermissionDecorator.requireFinanceAccess, controller.getFinances);
```

### Permission Matrix
| Feature | ADMIN | MEMBER | CHILD |
|---------|--------|--------|-------|
| Create Family | ✅ | ❌ | ❌ |
| Invite Members | ✅ | ⭐¹ | ❌ |
| Manage Tasks | ✅ | ✅ | ✅ |
| View Finance | ✅ | ✅ | ❌ |
| Manage Finance | ✅ | ❌ | ❌ |
| Create Goals | ✅ | ✅ | ❌ |
| Manage Challenges | ✅ | ⭐² | ❌ |

*¹ PREMIUM/PRO plans only  
*² PREMIUM/PRO plans only

## 🤖 AI Integration

### AI Service Hooks
```javascript
// Family Analysis
const analysis = await AIService.getFamilyAnalysis(familyId);

// Finance Summary  
const summary = await AIService.getFinanceSummary(familyId);

// Task Recommendations
const recommendations = await AIService.getTaskRecommendations(familyId);
```

### AI Features
- **Family Analysis**: Performance metrics, insights, recommendations
- **Finance Summary**: Spending patterns, predictions, risk analysis
- **Task Recommendations**: Productivity insights, deadline alerts
- **Goal Insights**: Progress tracking, motivation alerts

## 🔔 Notification System

### Real-time Notifications
```javascript
// Socket.IO integration
const notificationService = require('./services/notificationService');
notificationService.initialize(io);

// Family notifications
await notificationService.sendFamilyNotification(familyId, {
    type: 'task_completed',
    title: 'Task Completed',
    message: `${user.firstName} completed task: ${task.title}`
});
```

### Notification Types
- Task assignments and completions
- Goal achievements and deadlines
- Financial alerts
- Family invitations
- Challenge updates

## 💳 Monetization Validation

### Middleware Protection
```javascript
// Family creation limits
router.post('/', MonetizationMiddleware.validateFamilyCreation, controller.create);

// Member invitation limits
router.post('/:familyId/invite', 
    MonetizationMiddleware.validateMemberInvitation, 
    controller.invite
);

// AI features (premium only)
router.get('/:familyId/ai/analysis', 
    MonetizationMiddleware.validateAIAccess, 
    controller.getAnalysis
);
```

### Subscription Limits Enforcement
- **FREE**: 1 family, 3 members max, no AI features
- **PREMIUM**: Unlimited members, AI analysis, SMS, child controls
- **PRO**: All PREMIUM + advanced challenges

## 📡 API Endpoints

### Family Management
```javascript
POST   /api/families              // Create family
GET    /api/families              // Get user families
GET    /api/families/:id          // Get family details
PUT    /api/families/:id          // Update family
DELETE /api/families/:id          // Delete family
```

### Member Management
```javascript
POST   /api/families/:id/invite           // Invite member
POST   /api/accept-invitation             // Accept invitation
DELETE /api/families/:id/members/:mid    // Remove member
PUT    /api/families/:id/members/:mid/role // Update role
```

### AI Features (Premium)
```javascript
GET    /api/families/:id/ai/analysis       // Family analysis
GET    /api/families/:id/ai/finance-summary // Finance insights
GET    /api/families/:id/ai/recommendations // Task recommendations
```

## 🔄 Data Flow

1. **Request → Route → Guard → Controller → Service → Model**
2. **Validation**: DTOs validate input data
3. **Authorization**: Guards check permissions
4. **Business Logic**: Services handle operations
5. **Data Access**: Models interact with MongoDB
6. **Response**: Controller formats and returns data
7. **Notifications**: Service triggers real-time updates

## 🚀 Scalability Features

### Database Indexing
```javascript
// Optimized queries
familySchema.index({ ownerId: 1 });
familySchema.index({ 'members.userId': 1 });
familySchema.index({ inviteCode: 1 });
familySchema.index({ subscriptionPlan: 1 });
```

### Caching Strategy
- Family data cached per user session
- Permission calculations cached
- AI analysis results cached (24h)

### Performance Optimizations
- Pagination for large datasets
- Lean queries for list operations
- Population optimization for related data

## 🔧 Configuration

### Environment Variables
```env
JWT_SECRET=your_jwt_secret
MONGODB_URI=mongodb://localhost:2707/infast
NODE_ENV=development
SOCKET_CORS_ORIGIN=http://localhost:3000
```

### Socket.IO Setup
```javascript
// server.js
const notificationService = require('./src/services/notificationService');
notificationService.initialize(io);
notificationService.start();
```

## 📊 Monitoring & Analytics

### Metrics Tracked
- Family creation/deletion rates
- Member invitation acceptance rates
- Feature usage by subscription plan
- AI service response times
- Notification delivery rates

### Health Checks
- Database connectivity
- Socket.IO connections
- AI service availability
- Memory usage monitoring

## 🧪 Testing Strategy

### Unit Tests
- Service layer business logic
- DTO validation
- Permission calculations

### Integration Tests
- API endpoint flows
- Database operations
- Socket.IO notifications

### Load Testing
- Concurrent family operations
- Notification system performance
- AI service scalability

## 🔄 Future Enhancements

### Planned Features
- Advanced family analytics dashboard
- Automated task scheduling
- Smart budget recommendations
- Family challenge tournaments
- Integration with calendar systems

### Performance Improvements
- Redis caching layer
- Database sharding for large families
- CDN for static assets
- API rate limiting per family

## 📝 Code Quality

### Standards Applied
- ESLint + Prettier for code formatting
- JSDoc for API documentation
- Error handling with proper HTTP codes
- Input validation and sanitization
- Security headers and CORS setup

### Best Practices
- Clean Architecture principles
- Dependency injection
- Single responsibility principle
- Interface segregation
- DRY (Don't Repeat Yourself)

---

## 🎯 Summary

The Family System provides a comprehensive, production-ready solution for family management with:

✅ **Complete RBAC system** with role-based permissions  
✅ **Monetization enforcement** with subscription limits  
✅ **Real-time notifications** via Socket.IO  
✅ **AI-powered insights** for premium users  
✅ **Scalable architecture** following clean principles  
✅ **Comprehensive API** with proper validation  
✅ **Security-first approach** with guards and middleware  

The system is designed to handle thousands of families while maintaining performance and data integrity. All components are modular and can be easily extended or modified as requirements evolve.

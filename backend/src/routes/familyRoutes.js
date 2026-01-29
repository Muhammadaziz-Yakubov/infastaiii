const express = require('express');
const router = express.Router();
const FamilyController = require('../controllers/familyController');
const { FamilyGuard, PermissionDecorator } = require('../guards/familyGuard');
const MonetizationMiddleware = require('../middleware/monetizationMiddleware');
const protect = require('../middleware/authMiddleware');

router.use(protect);

// Family CRUD operations
router.post('/', 
    MonetizationMiddleware.validateFamilyCreation, 
    FamilyController.createFamily
);

router.get('/', 
    FamilyController.getUserFamilies
);

router.get('/:familyId', 
    FamilyGuard.requireFamilyMember, 
    FamilyController.getFamilyById
);

router.put('/:familyId', 
    FamilyGuard.requireFamilyAdmin, 
    FamilyController.updateFamily
);

router.delete('/:familyId', 
    FamilyGuard.requireFamilyOwner, 
    FamilyController.deleteFamily
);

router.get('/:familyId/stats', 
    FamilyGuard.requireFamilyMember, 
    FamilyController.getFamilyStats
);

router.get('/:familyId/dashboard', 
    FamilyGuard.requireFamilyMember, 
    FamilyController.getFamilyDashboard
);

// Member management
router.post('/:familyId/invite', 
    FamilyGuard.requirePermission('canInviteMembers'),
    MonetizationMiddleware.validateMemberInvitation,
    FamilyController.inviteMember
);

router.post('/accept-invitation', 
    FamilyController.acceptInvitation
);

router.post('/reject-invitation/:inviteCode', 
    FamilyController.rejectInvitation
);

router.get('/invitations/pending', 
    FamilyController.getPendingInvitations
);

router.get('/:familyId/invitations', 
    FamilyGuard.requireFamilyAdmin, 
    FamilyController.getFamilyInvitations
);

router.delete('/:familyId/members/:memberId', 
    FamilyGuard.requireFamilyAdmin, 
    FamilyController.removeMember
);

router.put('/:familyId/members/:memberId/role', 
    FamilyGuard.requireFamilyAdmin, 
    FamilyController.updateMemberRole
);

router.put('/:familyId/members/:memberId/permissions', 
    FamilyGuard.requireFamilyAdmin, 
    FamilyController.updateMemberPermissions
);

router.post('/:familyId/leave', 
    FamilyGuard.requireFamilyMember, 
    FamilyController.leaveFamily
);

router.post('/:familyId/transfer-ownership', 
    FamilyGuard.requireFamilyOwner, 
    FamilyController.transferOwnership
);

// Task management (protected by permissions)
router.post('/:familyId/tasks', 
    FamilyGuard.requirePermission('canManageTasks'),
    require('../controllers/taskController').createTask
);

router.get('/:familyId/tasks', 
    FamilyGuard.requireFamilyMember,
    require('../controllers/taskController').getFamilyTasks
);

router.put('/:familyId/tasks/:taskId', 
    FamilyGuard.requirePermission('canManageTasks'),
    require('../controllers/taskController').updateTask
);

router.delete('/:familyId/tasks/:taskId', 
    FamilyGuard.requirePermission('canManageTasks'),
    require('../controllers/taskController').deleteTask
);

// Goal management
router.post('/:familyId/goals', 
    PermissionDecorator.requireGoalCreation,
    require('../controllers/goalController').createGoal
);

router.get('/:familyId/goals', 
    FamilyGuard.requireFamilyMember,
    require('../controllers/goalController').getFamilyGoals
);

router.put('/:familyId/goals/:goalId', 
    PermissionDecorator.requireGoalCreation,
    require('../controllers/goalController').updateGoal
);

router.delete('/:familyId/goals/:goalId', 
    PermissionDecorator.requireGoalCreation,
    require('../controllers/goalController').deleteGoal
);

// Finance management (protected by permissions)
router.post('/:familyId/finances', 
    PermissionDecorator.requireFinanceManagement,
    require('../controllers/financeController').createFinance
);

router.get('/:familyId/finances', 
    PermissionDecorator.requireFinanceAccess,
    require('../controllers/financeController').getFamilyFinances
);

router.get('/:familyId/finances/summary', 
    PermissionDecorator.requireFinanceAccess,
    require('../controllers/financeController').getFinanceSummary
);

// AI features (premium only)
router.get('/:familyId/ai/analysis', 
    MonetizationMiddleware.validateAIAccess,
    require('../controllers/aiController').getFamilyAnalysis
);

router.get('/:familyId/ai/finance-summary', 
    MonetizationMiddleware.validateAIAccess,
    PermissionDecorator.requireFinanceAccess,
    require('../controllers/aiController').getFinanceSummary
);

// Challenges
router.post('/:familyId/challenges', 
    PermissionDecorator.requireChallengeManagement,
    require('../controllers/challengeController').createChallenge
);

router.get('/:familyId/challenges', 
    FamilyGuard.requireFamilyMember,
    require('../controllers/challengeController').getFamilyChallenges
);

router.post('/:familyId/challenges/:challengeId/join', 
    FamilyGuard.requireFamilyMember,
    require('../controllers/challengeController').joinChallenge
);

// Child controls (premium only)
router.put('/:familyId/child-controls', 
    MonetizationMiddleware.validateChildControls,
    FamilyGuard.requireFamilyAdmin,
    require('../controllers/familyController').updateChildControls
);

module.exports = router;

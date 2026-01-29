const express = require('express');
const router = express.Router();
const FamilyController = require('../controllers/familyController');
const { FamilyGuard, PermissionDecorator } = require('../guards/familyGuard');
const MonetizationMiddleware = require('../middleware/monetizationMiddleware');
const protect = require('../middleware/authMiddleware');

router.use(protect);

// Middleware wrapper functions
const validateFamilyCreation = (req, res, next) => MonetizationMiddleware.validateFamilyCreation(req, res, next);
const validateMemberInvitation = (req, res, next) => MonetizationMiddleware.validateMemberInvitation(req, res, next);
const validateAIAccess = (req, res, next) => MonetizationMiddleware.validateAIAccess(req, res, next);
const validateChildControls = (req, res, next) => MonetizationMiddleware.validateChildControls(req, res, next);
const requireFamilyMember = (req, res, next) => FamilyGuard.requireFamilyMember(req, res, next);
const requireFamilyAdmin = (req, res, next) => FamilyGuard.requireFamilyAdmin(req, res, next);
const requirePermission = (permission) => (req, res, next) => PermissionDecorator.requirePermission(permission)(req, res, next);
const requireFinanceAccess = (req, res, next) => PermissionDecorator.requireFinanceAccess(req, res, next);
const requireChallengeManagement = (req, res, next) => PermissionDecorator.requireChallengeManagement(req, res, next);

// Family CRUD operations
router.post('/test', 
    FamilyController.createFamily
);

router.post('/', 
    validateFamilyCreation, 
    FamilyController.createFamily
);

router.post('/join', 
    FamilyController.joinFamily
);

router.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Family routes are working',
        user: req.user.id
    });
});

router.get('/dashboard', 
    FamilyController.getUserFamilyDashboard
);

router.get('/', 
    FamilyController.getUserFamilies
);

router.get('/:familyId', 
    requireFamilyMember, 
    FamilyController.getFamilyById
);

router.put('/:familyId', 
    requireFamilyAdmin, 
    FamilyController.updateFamily
);

router.delete('/:familyId', 
    FamilyGuard.requireFamilyOwner, 
    FamilyController.deleteFamily
);

router.get('/:familyId/stats', 
    requireFamilyMember, 
    FamilyController.getFamilyStats
);

router.get('/:familyId/dashboard', 
    requireFamilyMember, 
    FamilyController.getFamilyDashboard
);

// Member management
router.post('/:familyId/invite', 
    validateMemberInvitation,
    requirePermission('canInviteMembers'),
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
    requireFamilyAdmin, 
    FamilyController.getFamilyInvitations
);

router.delete('/:familyId/members/:memberId', 
    requireFamilyAdmin, 
    FamilyController.removeMember
);

router.put('/:familyId/members/:memberId/role', 
    requireFamilyAdmin, 
    FamilyController.updateMemberRole
);

router.put('/:familyId/members/:memberId/permissions', 
    requireFamilyAdmin, 
    FamilyController.updateMemberPermissions
);

router.post('/:familyId/leave', 
    requireFamilyMember, 
    FamilyController.leaveFamily
);

router.post('/:familyId/transfer-ownership', 
    FamilyGuard.requireFamilyOwner, 
    FamilyController.transferOwnership
);

// Task management (protected by permissions)
router.post('/:familyId/tasks', 
    requirePermission('canManageTasks'),
    (req, res) => require('../controllers/taskController').createTask(req, res)
);

router.get('/:familyId/tasks', 
    requireFamilyMember,
    (req, res) => require('../controllers/taskController').getTasks(req, res)
);

router.put('/:familyId/tasks/:taskId', 
    requirePermission('canManageTasks'),
    (req, res) => require('../controllers/taskController').updateTask(req, res)
);

router.delete('/:familyId/tasks/:taskId', 
    requirePermission('canManageTasks'),
    (req, res) => require('../controllers/taskController').deleteTask(req, res)
);

// Goal management
router.post('/:familyId/goals', 
    requirePermission('canCreateGoals'),
    (req, res) => require('../controllers/goalController').createGoal(req, res)
);

router.get('/:familyId/goals', 
    requireFamilyMember,
    (req, res) => require('../controllers/goalController').getGoals(req, res)
);

router.put('/:familyId/goals/:goalId', 
    requirePermission('canCreateGoals'),
    (req, res) => require('../controllers/goalController').updateGoal(req, res)
);

router.delete('/:familyId/goals/:goalId', 
    requirePermission('canCreateGoals'),
    (req, res) => require('../controllers/goalController').deleteGoal(req, res)
);

// Finance management (protected by permissions)
router.post('/:familyId/finances', 
    requirePermission('canManageFinance'),
    (req, res) => require('../controllers/financeController').createFinance(req, res)
);

router.get('/:familyId/finances', 
    requireFinanceAccess,
    (req, res) => require('../controllers/financeController').getTransactions(req, res)
);

router.get('/:familyId/finances/summary', 
    requireFinanceAccess,
    (req, res) => require('../controllers/financeController').getFinanceSummary(req, res)
);

// AI features (premium only)
router.get('/:familyId/ai/analysis', 
    validateAIAccess,
    requireFamilyMember,
    (req, res) => require('../controllers/aiController').getFamilyAnalysis(req, res)
);

router.get('/:familyId/ai/finance-summary', 
    validateAIAccess,
    requireFinanceAccess,
    requireFamilyMember,
    (req, res) => require('../controllers/aiController').getFinanceSummary(req, res)
);

// Challenges
router.post('/:familyId/challenges', 
    requireChallengeManagement,
    requireFamilyMember,
    (req, res) => require('../controllers/challengeController').createChallenge(req, res)
);

router.get('/:familyId/challenges', 
    requireFamilyMember,
    (req, res) => require('../controllers/challengeController').getChallenges(req, res)
);

router.post('/:familyId/challenges/:challengeId/join', 
    requireFamilyMember,
    (req, res) => require('../controllers/challengeController').joinChallenge(req, res)
);

// Child controls (premium only)
router.put('/:familyId/child-controls', 
    validateChildControls,
    requireFamilyAdmin,
    (req, res) => require('../controllers/familyController').updateChildControls(req, res)
);

module.exports = router;

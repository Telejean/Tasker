import express from 'express';
import { policyController } from '../controllers/policy.controller';
import passport from 'passport';
import { RequestHandler } from 'express';

const router = express.Router();

// Using passport.authenticate for authentication
const authenticate = passport.authenticate('jwt', { session: false });

// Apply authenticate middleware to all routes
router.use(authenticate);

// Cast controller functions to RequestHandler to fix TypeScript errors
const asHandler = (fn: any): RequestHandler => fn as RequestHandler;

// Policy management routes
router.get('/', asHandler(policyController.getPolicies));
router.get('/:id', asHandler(policyController.getPolicy));
router.post('/', asHandler(policyController.createPolicy));
router.put('/:id', asHandler(policyController.updatePolicy));
router.delete('/:id', asHandler(policyController.deletePolicy));

// Add a rule to an existing policy
router.post('/:policyId/rules', asHandler(policyController.addRuleToPolicy));

// Policy assignment routes
router.post('/assign/user', asHandler(policyController.assignPolicyToUser));
router.post('/assign/project', asHandler(policyController.assignPolicyToProject));
router.post('/assign/task', asHandler(policyController.assignPolicyToTask));

// Get policy assignments for a resource
router.get('/assignments/:resourceType/:resourceId', asHandler(policyController.getPolicyAssignments));

// Remove policy assignment
router.delete('/assignments/:resourceType/:assignmentId', asHandler(policyController.removePolicyAssignment));

export default router;
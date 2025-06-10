import express from 'express';
import { policyController } from '../controllers/policy.controller';
import passport from 'passport';
import { RequestHandler } from 'express';

const router = express.Router();

// !! nu mai stiu daca mai e nevoie de autentificare aici
// const authenticate = passport.authenticate('jwt', { session: false });

// router.use(authenticate);

const asHandler = (fn: any): RequestHandler => fn as RequestHandler;

router.get('/', asHandler(policyController.getPolicies));
router.get('/:id', asHandler(policyController.getPolicy));
router.post('/', asHandler(policyController.createPolicy));
router.put('/:id', asHandler(policyController.updatePolicy));
router.delete('/:id', asHandler(policyController.deletePolicy));

router.post('/:policyId/rules', asHandler(policyController.addRuleToPolicy));

router.post('/assign/user', asHandler(policyController.assignPolicyToUser));
router.post('/assign/project', asHandler(policyController.assignPolicyToProject));
router.post('/assign/task', asHandler(policyController.assignPolicyToTask));

router.get('/assignments/:resourceType/:resourceId', asHandler(policyController.getPolicyAssignments));

router.delete('/assignments/:resourceType/:assignmentId', asHandler(policyController.removePolicyAssignment));

// Add to server/routes/policy.routes.ts
router.patch('/:id/status', asHandler(policyController.togglePolicyStatus));
router.post('/test', asHandler(policyController.testPolicy));

export default router;
import { Router } from 'express';
import { policyController  } from '../controllers/index';

const router = Router();

// GET all policies
router.get('/', policyController.getAllPolicies);

// GET policy by ID
router.get('/:id', policyController.getPolicyById as any);

// POST create policy
router.post('/', policyController.createPolicy as any);

// PUT update policy
router.put('/:id', policyController.updatePolicy as any);

// DELETE policy
router.delete('/:id', policyController.deletePolicy as any);

// POST add rule to policy
router.post('/:id/rules', policyController.addRuleToPolicy as any);

// Policy assignments
router.post('/assign-to-user', policyController.assignPolicyToUser as any);
router.post('/assign-to-project', policyController.assignPolicyToProject as any);
router.post('/assign-to-task', policyController.assignPolicyToTask as any);

export default router;
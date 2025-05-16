import { Policy } from '../models/Policy.model';
import { User } from '../models/User.model';
import { UserPolicy } from '../models/UserPolicy.model';
import { ProjectPolicy } from '../models/ProjectPolicy.model';
import { TaskPolicy } from '../models/TaskPolicy.model';
import { Task } from '../models/Task.model';
import { Op } from 'sequelize';
import { PermissionLog } from '../models/PermissionLog.model';
import { Project } from '../models/Project.model';
import { Team } from '../models/Team.model';
import { UserTeam } from '../models/UserTeam.model';

interface PermissionCheckParams {
  userId: number;
  action: string;
  resourceType: string;
  projectId?: number;
  resourceId?: number;
}

interface Rule {
  action: string;
  resource: string;
  condition?: any;
}

// Cache for policy rules to avoid frequent database queries
const policyCache: Record<number, { rules: Rule[]; cachedAt: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

class AuthorizationService {
  /**
   * Check if a user has permission to perform an action on a resource
   */
  async checkPermission({
    userId,
    action,
    resourceType,
    resourceId,
    projectId
  }: PermissionCheckParams): Promise<boolean> {
    try {
      // Get user with role
      const user = await User.findByPk(userId);
      if (!user) {
        this.logPermissionCheck(userId, action, resourceType, resourceId, false, 'User not found');
        return false;
      }

      // Board and Coordinator roles have all permissions
      if (user.isAdmin) {
        this.logPermissionCheck(userId, action, resourceType, resourceId, true, 'User has admin role');
        return true;
      }

      // Check role-based permissions
      if (projectId) {
        const hasRolePermission = await this.checkRolePermission(user, projectId, action, resourceType);

        if (hasRolePermission) {
          this.logPermissionCheck(userId, action, resourceType, resourceId, true, 'User has role-based permission');
          return true;
        }
      }



      // Check project membership (applies to project and task resources)
      if ((resourceType === 'project' || resourceType === 'task') && resourceId) {
        const hasProjectPermission = await this.checkProjectMembership(userId, action, resourceType, resourceId);
        if (hasProjectPermission) {
          this.logPermissionCheck(userId, action, resourceType, resourceId, true, 'User has project-based permission');
          return true;
        }
      }

      // Check policies assigned to user
      const hasUserPolicy = await this.checkUserPolicies(userId, action, resourceType, resourceId);
      if (hasUserPolicy) {
        this.logPermissionCheck(userId, action, resourceType, resourceId, true, 'User has user-policy permission');
        return true;
      }

      // Check policies assigned to the resource
      const hasResourcePolicy = await this.checkResourcePolicies(userId, action, resourceType, resourceId);
      if (hasResourcePolicy) {
        this.logPermissionCheck(userId, action, resourceType, resourceId, true, 'User has resource-policy permission');
        return true;
      }

      // No permission found
      this.logPermissionCheck(userId, action, resourceType, resourceId, false, 'No matching permission found');
      return false;
    } catch (error) {
      console.error('Error checking permission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logPermissionCheck(userId, action, resourceType, resourceId, false, `Error: ${errorMessage}`);
      return false;
    }
  }

  /**
   * ABAC: Check if a user is authorized for an action on a resource
   * @param authRequest { subject: {userId}, action: {type}, resource: {type, id}, environment: {...} }
   * @returns { allowed: boolean, reason: string }
   */
  async isAuthorized(authRequest: any): Promise<{ allowed: boolean; reason: string }> {
    const { subject, action, resource, environment } = authRequest;
    const userId = subject.userId;
    const actionType = action.type;
    const resourceType = resource.type;
    const resourceId = resource.id;

    // 1. Get all active policies assigned to the user (UserPolicy)
    const userPolicies = await UserPolicy.findAll({
      where: {
        userId,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ]
      },
      include: [{ model: Policy, where: { isActive: true }, include: [{ model: require('../models/Rule.model').Rule, as: 'policyRules' }] }]
    });

    // 2. Get all active policies assigned to the resource (e.g., TaskPolicy, ProjectPolicy, etc.)
    let resourcePolicies: any[] = [];
    if (resourceType === 'task') {
      resourcePolicies = await TaskPolicy.findAll({
        where: { taskId: resourceId },
        include: [{ model: Policy, where: { isActive: true }, include: [{ model: require('../models/Rule.model').Rule, as: 'policyRules' }] }]
      });
    }
    // Add more resource types as needed

    // 3. Collect all rules from user and resource policies
    const allRules: any[] = [];
    for (const up of userPolicies) {
      if (up.policy && up.policy.policyRules) {
        allRules.push(...up.policy.policyRules);
      }
    }
    for (const rp of resourcePolicies) {
      if (rp.policy && rp.policy.policyRules) {
        allRules.push(...rp.policy.policyRules);
      }
    }

    // 4. Sort rules by priority (higher first)
    allRules.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // 5. Evaluate rules (ABAC)
    for (const rule of allRules) {
      // Check action
      if (rule.actionAttributes && rule.actionAttributes['type'] && rule.actionAttributes['type'] !== actionType) {
        continue;
      }
      // Check resource
      if (rule.resourceAttributes && rule.resourceAttributes['type'] && rule.resourceAttributes['type'] !== resourceType) {
        continue;
      }
      // Check subject attributes (user attributes)
      if (rule.subjectAttributes) {
        // Example: { department: 'IT' }
        const user = await User.findByPk(userId);
        if (!user) continue;
        let subjectMatch = true;
        for (const [key, value] of Object.entries(rule.subjectAttributes)) {
          if ((user as any)[key] !== value) {
            subjectMatch = false;
            break;
          }
        }
        if (!subjectMatch) continue;
      }
      // Check environment attributes (e.g., time)
      if (rule.environmentAttributes) {
        // Example: { time: { $gte: '09:00', $lte: '17:00' } }
        // Implement as needed
      }
      // Check condition (optional, as stringified JSON logic)
      if (rule.condition) {
        // For now, skip or implement as needed
      }
      // If rule matches, return effect
      if (rule.effect === 'DENY') {
        return { allowed: false, reason: rule.description || 'Denied by policy rule' };
      }
      if (rule.effect === 'ALLOW') {
        return { allowed: true, reason: rule.description || 'Allowed by policy rule' };
      }
    }
    // Default deny
    return { allowed: false, reason: 'No matching ABAC rule found' };
  }

  /**
   * Check role-based permissions (simple role checks)
   */
  private async checkRolePermission(user: User, project: number, action: string, resourceType: string): Promise<boolean> {
    // Define role-based permissions for different resources

    return true
  }
  /**
   * Check project membership permissions through team membership
   */
  private async checkProjectMembership(
    userId: number,
    action: string,
    resourceType: string,
    resourceId: number
  ): Promise<boolean> {
    try {
      let projectId: number;

      // If checking task permissions, get the associated project ID
      if (resourceType === 'task') {
        const task = await Task.findByPk(resourceId);
        if (!task) return false;
        projectId = task.projectId;
      } else {
        projectId = resourceId;
      }      // Check if user is a member of any team in the project
      const teams = await Team.findAll({
        where: { projectId },
        include: [{
          model: User,
          through: {
            where: { userId }
          }
        }]
      });

      // If not a member of any team, check if user is the project manager
      if (teams.length === 0) {
        const project = await Project.findByPk(projectId);
        if (!project || project.managerId !== userId) return false;
      }

      // Get the user's highest role in any team
      let highestRole = '';
      for (const team of teams) {
        const userTeam = await UserTeam.findOne({
          where: { userId, teamId: team.id }
        });

        if (userTeam) {
          // Determine which role has higher privileges
          if (
            highestRole === '' ||
            (highestRole === 'viewer' && ['member', 'admin', 'owner'].includes(userTeam.userRole.toLowerCase())) ||
            (highestRole === 'member' && ['admin', 'owner'].includes(userTeam.userRole.toLowerCase())) ||
            (highestRole === 'admin' && userTeam.userRole.toLowerCase() === 'owner')
          ) {
            highestRole = userTeam.userRole.toLowerCase();
          }
        }
      }

      // If user is a project manager, consider them as "owner" role
      const project = await Project.findByPk(projectId);
      if (project && project.managerId === userId) {
        highestRole = 'owner';
      }

      // Define role permissions within a project
      const projectRolePermissions: Record<string, Record<string, string[]>> = {
        'owner': {
          'project': ['read', 'update', 'delete', 'manage'],
          'task': ['read', 'create', 'update', 'delete', 'assign', 'manage']
        },
        'admin': {
          'project': ['read', 'update'],
          'task': ['read', 'create', 'update', 'delete', 'assign']
        },
        'member': {
          'project': ['read'],
          'task': ['read', 'create', 'update']
        },
        'viewer': {
          'project': ['read'],
          'task': ['read']
        }
      };

      // Check if the project role has the required permission
      return !!projectRolePermissions[highestRole]?.[resourceType]?.includes(action);
    } catch (error) {
      console.error('Error checking project membership:', error);
      return false;
    }
  }

  /**
   * Check policies assigned directly to the user
   */
  private async checkUserPolicies(
    userId: number,
    action: string,
    resourceType: string,
    resourceId?: number
  ): Promise<boolean> {
    try {
      // Get active policies assigned to the user
      const userPolicies = await UserPolicy.findAll({
        where: {
          userId,
          [Op.or]: [
            { expiresAt: null },
            { expiresAt: { [Op.gt]: new Date() } }
          ]
        },
        include: [
          {
            model: Policy,
            where: {
              isActive: true
            }
          }
        ]
      });

      // Check each policy's rules
      for (const userPolicy of userPolicies) {
        const policy = userPolicy.policy;
        const policyId = policy.id;

        // Get rules from cache or database
        const rules = await this.getPolicyRules(policyId);

        // Check if any rule allows the action on the resource
        if (this.evaluateRules(rules, action, resourceType, resourceId)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking user policies:', error);
      return false;
    }
  }

  /**
   * Check policies assigned to the resource
   */
  private async checkResourcePolicies(
    userId: number,
    action: string,
    resourceType: string,
    resourceId?: number
  ): Promise<boolean> {
    if (!resourceId) return false;

    try {
      let policyModel;
      let whereClause: any = {};

      switch (resourceType.toLowerCase()) {
        case 'project':
          policyModel = ProjectPolicy;
          whereClause = { projectId: resourceId };
          break;
        case 'task':
          policyModel = TaskPolicy;
          whereClause = { taskId: resourceId };
          break;
        default:
          return false;
      }

      // Filter for active, non-expired policies
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ]
      };

      const resourcePolicies = await (policyModel as any).findAll({
        where: whereClause,
        include: [
          {
            model: Policy,
            where: {
              active: true
            }
          }
        ]
      });

      // Check each policy's rules
      for (const resourcePolicy of resourcePolicies) {
        const policy = resourcePolicy.policy;
        const policyId = policy.id;

        // Get rules from cache or database
        const rules = await this.getPolicyRules(policyId);

        // Check if any rule allows the action on the resource
        if (this.evaluateRules(rules, action, resourceType, resourceId, { userId })) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking resource policies:', error);
      return false;
    }
  }

  /**
   * Get policy rules from cache or database
   */
  private async getPolicyRules(policyId: number): Promise<Rule[]> {
    // Check if we have a valid cached version
    const now = Date.now();
    if (
      policyCache[policyId] &&
      now - policyCache[policyId].cachedAt < CACHE_TTL
    ) {
      return policyCache[policyId].rules;
    }

    // Get fresh rules from database
    const policy = await Policy.findByPk(policyId);
    if (!policy) return [];

    // Map database Rule models to the Rule interface format used in this service
    const mappedRules: Rule[] = policy.policyRules.map(dbRule => {
      // Extract action from actionAttributes
      const actionAttr = dbRule.actionAttributes as { type?: string } || {};
      const action = actionAttr.type || '*';

      // Extract resource from resourceAttributes
      const resourceAttr = dbRule.resourceAttributes as { type?: string } || {};
      const resource = resourceAttr.type || '*';

      // Use condition as is or convert if needed
      const condition = dbRule.condition ? JSON.parse(dbRule.condition) : undefined;

      return {
        action,
        resource,
        condition
      };
    });

    // Update cache
    policyCache[policyId] = {
      rules: mappedRules,
      cachedAt: now
    };

    return mappedRules;
  }

  /**
   * Evaluate policy rules against the requested action and resource
   */
  private evaluateRules(
    rules: Rule[],
    action: string,
    resourceType: string,
    resourceId?: number,
    context: Record<string, any> = {}
  ): boolean {
    return rules.some(rule => {
      // Check if action and resource match
      const actionMatches = rule.action === '*' || rule.action === action;
      const resourceMatches = rule.resource === '*' || rule.resource === resourceType;

      if (!actionMatches || !resourceMatches) {
        return false;
      }

      // If rule has no condition, it's a match
      if (!rule.condition) {
        return true;
      }

      // Evaluate conditions
      return this.evaluateCondition(rule.condition, { resourceId, ...context });
    });
  }

  /**
   * Evaluate a condition with the given context
   */
  private evaluateCondition(condition: any, context: Record<string, any>): boolean {
    if (!condition) return true;

    // Simple condition format: { attribute: value }
    if (typeof condition === 'object' && !Array.isArray(condition)) {
      return Object.entries(condition).every(([key, value]) => {
        return context[key] === value;
      });
    }

    // TODO: Implement more complex condition evaluation logic if needed

    return false;
  }

  /**
   * Log permission checks for auditing purposes
   */
  private async logPermissionCheck(
    userId: number,
    action: string,
    resourceType: string,
    resourceId: number | undefined,
    allowed: boolean,
    reason: string
  ): Promise<void> {
    if (!userId || !action || !resourceType || !resourceId || !allowed || !reason) {
      console.log("couldn't log permission")
      return
    }
    try {
      await PermissionLog.create({
        userId,
        action,
        resourceType,
        resourceId,
        allowed,
        reason,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging permission check:', error);
    }
  }

  /**
   * Clear the policy cache
   */
  clearCache(): void {
    Object.keys(policyCache).forEach(key => {
      delete policyCache[Number(key)];
    });
  }

  /**
   * Remove a specific policy from the cache
   */
  invalidatePolicy(policyId: number): void {
    delete policyCache[policyId];
  }
}

export default new AuthorizationService();
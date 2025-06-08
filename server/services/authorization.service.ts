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
import { Rule as RuleModel } from '../models/Rule.model';
import { UserProject } from '../models/UserProjects.model'; 

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

const policyCache: Record<number, { rules: Rule[]; cachedAt: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
class AuthorizationService {
  /**
   * Check if a user has permission to perform an action on a resource
   */
  async checkPermission({ userId, action, resourceType, resourceId, projectId }: PermissionCheckParams): Promise<boolean> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        await this.logPermissionCheck(userId, action, resourceType, resourceId, false, 'User not found');
        return false;
      }

      if (user.isAdmin) {
        await this.logPermissionCheck(userId, action, resourceType, resourceId, true, 'User has admin role');
        return true;
      }

      if (projectId) {
        const hasRolePermission = await this.checkRolePermission(user, projectId, action, resourceType);
        if (hasRolePermission) {
          await this.logPermissionCheck(userId, action, resourceType, resourceId, true, 'User has role-based permission');
          return true;
        }
      }

      if ((resourceType === 'project' || resourceType === 'task') && resourceId) {
        const hasProjectPermission = await this.checkProjectMembership(userId, action, resourceType, resourceId);
        if (hasProjectPermission) {
          await this.logPermissionCheck(userId, action, resourceType, resourceId, true, 'User has project-based permission');
          return true;
        }
      }

      const hasUserPolicy = await this.checkUserPolicies(userId, action, resourceType, resourceId);
      if (hasUserPolicy) {
        await this.logPermissionCheck(userId, action, resourceType, resourceId, true, 'User has user-policy permission');
        return true;
      }

      const hasResourcePolicy = await this.checkResourcePolicies(userId, action, resourceType, resourceId);
      if (hasResourcePolicy) {
        await this.logPermissionCheck(userId, action, resourceType, resourceId, true, 'User has resource-policy permission');
        return true;
      }

      await this.logPermissionCheck(userId, action, resourceType, resourceId, false, 'No matching permission found');
      return false;
    } catch (error) {
      console.error('Error checking permission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logPermissionCheck(userId, action, resourceType, resourceId, false, `Error: ${errorMessage}`);
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

    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: UserTeam,
            include: [Team]
          }
        ]
      });

      if (!user) {
        return { allowed: false, reason: 'User not found' };
      }

      if (user.isAdmin) {
        return { allowed: true, reason: 'Admin user has full access' };
      }

      const userPolicies = await UserPolicy.findAll({
        where: {
          userId,
          [Op.or]: [
            { expiresAt: null },
            { expiresAt: { [Op.gt]: new Date() } }
          ]
        },
        include: [{
          model: Policy,
          where: { isActive: true },
          include: [RuleModel] 
        }]
      });

      let resourcePolicies: any[] = [];
      if (resourceType === 'task' && resourceId) {
        resourcePolicies = await TaskPolicy.findAll({
          where: { taskId: resourceId },
          include: [{
            model: Policy,
            where: { isActive: true },
            include: [RuleModel]
          }]
        });
      } else if (resourceType === 'project' && resourceId) {
        resourcePolicies = await ProjectPolicy.findAll({
          where: { projectId: resourceId },
          include: [{
            model: Policy,
            where: { isActive: true },
            include: [RuleModel]
          }]
        });
      }

      const allRules: any[] = [];
      for (const up of userPolicies) {
        if (up.policy && up.policy.rules) { 
          allRules.push(...up.policy.rules);
        }
      }
      for (const rp of resourcePolicies) {
        if (rp.policy && rp.policy.rules) { 
          allRules.push(...rp.policy.rules);
        }
      }

      allRules.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      for (const rule of allRules) {
        const ruleEvaluation = await this.evaluateABACRule(rule, {
          user,
          actionType,
          resourceType,
          resourceId,
          resource: resource.attributes || {},
          environment
        });

        if (ruleEvaluation.matches) {
          if (rule.effect === 'DENY') {
            return { allowed: false, reason: rule.description || 'Denied by policy rule' };
          }
          if (rule.effect === 'ALLOW') {
            return { allowed: true, reason: rule.description || 'Allowed by policy rule' };
          }
        }
      }

      return { allowed: false, reason: 'No matching ABAC rule found' };
    } catch (error) {
      console.error('Error in ABAC authorization:', error);
      return { allowed: false, reason: 'Authorization error occurred' };
    }
  }

  /**
   * Evaluate a single ABAC rule against the request context
   */
  private async evaluateABACRule(rule: any, context: any): Promise<{ matches: boolean; reason?: string }> {
    const { user, actionType, resourceType, resourceId, resource, environment } = context;

    if (rule.actionAttributes) {
      const actionAttrs = typeof rule.actionAttributes === 'string'
        ? JSON.parse(rule.actionAttributes)
        : rule.actionAttributes;

      if (actionAttrs.type && actionAttrs.type !== actionType && actionAttrs.type !== '*') {
        return { matches: false, reason: 'Action type mismatch' };
      }
    }

    if (rule.resourceAttributes) {
      const resourceAttrs = typeof rule.resourceAttributes === 'string'
        ? JSON.parse(rule.resourceAttributes)
        : rule.resourceAttributes;

      if (resourceAttrs.type && resourceAttrs.type !== resourceType && resourceAttrs.type !== '*') {
        return { matches: false, reason: 'Resource type mismatch' };
      }
    }

    if (rule.subjectAttributes) {
      const subjectAttrs = typeof rule.subjectAttributes === 'string'
        ? JSON.parse(rule.subjectAttributes)
        : rule.subjectAttributes;

      for (const [key, expectedValue] of Object.entries(subjectAttrs)) {
        let userValue;

        if (key === 'departmentId') {
          userValue = user.departmentId;
        } else if (key === 'teamIds') {
          userValue = user.userTeams?.map((ut: any) => ut.teamId) || [];
        } else if (key === 'role') {
          userValue = this.getUserHighestRole(user);
        } else {
          userValue = (user as any)[key];
        }

        if (!this.matchAttribute(userValue, expectedValue)) {
          return { matches: false, reason: `Subject attribute ${key} mismatch` };
        }
      }
    }

    if (rule.environmentAttributes) {
      const envAttrs = typeof rule.environmentAttributes === 'string'
        ? JSON.parse(rule.environmentAttributes)
        : rule.environmentAttributes;

      if (!this.evaluateEnvironmentAttributes(envAttrs, environment)) {
        return { matches: false, reason: 'Environment attribute mismatch' };
      }
    }

    if (rule.condition) {
      const conditionResult = await this.evaluateAdvancedCondition(rule.condition, {
        user,
        resourceId,
        resourceType,
        resource,
        environment
      });

      if (!conditionResult) {
        return { matches: false, reason: 'Condition evaluation failed' };
      }
    }

    return { matches: true };
  }

  /**
   * Match a single attribute value against expected value(s)
   */
  private matchAttribute(actualValue: any, expectedValue: any): boolean {
    if (expectedValue === '*') return true;

    if (Array.isArray(expectedValue)) {
      if (Array.isArray(actualValue)) {
        return expectedValue.some(ev => actualValue.includes(ev));
      }
      return expectedValue.includes(actualValue);
    }

    if (Array.isArray(actualValue)) {
      return actualValue.includes(expectedValue);
    }

    return actualValue === expectedValue;
  }

  /**
   * Get user's highest role across all teams
   */
  private getUserHighestRole(user: any): string {
    if (!user.userTeams || user.userTeams.length === 0) return 'viewer';

    const roleHierarchy = ['viewer', 'member', 'admin', 'owner'];
    let highestRole = 'viewer';

    for (const userTeam of user.userTeams) {
      const role = userTeam.userRole?.toLowerCase() || 'viewer';
      const currentIndex = roleHierarchy.indexOf(highestRole);
      const newIndex = roleHierarchy.indexOf(role);

      if (newIndex > currentIndex) {
        highestRole = role;
      }
    }

    return highestRole;
  }

  /**
   * Evaluate environment attributes
   */
  private evaluateEnvironmentAttributes(envAttrs: any, environment: any): boolean {
    for (const [key, expectedValue] of Object.entries(envAttrs)) {
      const actualValue = environment?.[key];

      if (key === 'timeRange') {
        const time = environment?.time || new Date();
        const range = expectedValue as any;
        if (range.start && time < new Date(range.start)) return false;
        if (range.end && time > new Date(range.end)) return false;
      } else if (key === 'businessHours') {
        const time = environment?.time || new Date();
        const hour = time.getHours();
        const range = expectedValue as any;
        if (hour < range.start || hour > range.end) return false;
      } else {
        if (!this.matchAttribute(actualValue, expectedValue)) return false;
      }
    }

    return true;
  }

  /**
   * Evaluate advanced conditions with context
   */
  private async evaluateAdvancedCondition(condition: string, context: any): Promise<boolean> {
    try {
      const cond = typeof condition === 'string' ? JSON.parse(condition) : condition;
      const { user, resourceId, resourceType, resource } = context;

      if (cond.isOwner) {
        const ownerId = resource.ownerId || resource.managerId || resource.createdBy;
        if (ownerId !== user.id) return false;
      }

      if (cond.sameDepartment) {
        if (resource.departmentId !== user.departmentId) return false;
      }

      if (cond.sameTeam) {
        const userTeamIds = user.userTeams?.map((ut: any) => ut.teamId) || [];
        if (!resource.teamId || !userTeamIds.includes(resource.teamId)) return false;
      }

      if (cond.projectMember && resourceType === 'task') {
        const task = await Task.findByPk(resourceId, { include: [Project] });
        if (task?.project) {
          const userProject = await UserProject.findOne({
            where: { userId: user.id, projectId: task.project.id }
          });

          if (userProject) return true; 

          const userTeamIds = user.userTeams?.map((ut: any) => ut.teamId) || [];
          const projectTeams = await Team.findAll({
            where: { projectId: task.project.id }
          });

          const hasTeamMembership = projectTeams.some(team => userTeamIds.includes(team.id));
          if (!hasTeamMembership) return false;
        }
      }

      if (cond.isAssigned && resourceType === 'task') {
        const task = await Task.findByPk(resourceId, {
          include: [{ model: User, as: 'assignedPersons' }]
        });
        if (!task) return false;
        const isAssigned = task?.assignedUsers?.some((ap: any) => ap.id === user.id);
        if (!isAssigned) return false;
      }

      return true;
    } catch (error) {
      console.error('Error evaluating advanced condition:', error);
      return false;
    }
  }

  /**
   * Check role-based permissions (simple role checks)
   */
  private async checkRolePermission(user: User, projectId: number, action: string, resourceType: string): Promise<boolean> {
    const project = await Project.findByPk(projectId);
    if (project?.managerId === user.id) {
      return true; 
    }

    return false;
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

      if (resourceType === 'task') {
        const task = await Task.findByPk(resourceId);
        if (!task) return false;
        projectId = task.projectId;
      } else {
        projectId = resourceId;
      }

      const project = await Project.findByPk(projectId);
      if (project?.managerId === userId) {
        return true; 
      }

      let highestRole = '';

      const userProject = await UserProject.findOne({
        where: { userId, projectId }
      });

      if (userProject) {
        highestRole = userProject.role?.toLowerCase() || 'member';
      }

      const projectTeams = await Team.findAll({
        where: { projectId },
        include: [{
          model: UserTeam,
          where: { userId },
          required: false
        }]
      });

      for (const team of projectTeams) {
        const userTeam = team.userTeams?.[0]; 
        if (userTeam) {
          const teamRole = userTeam.userRole?.toLowerCase() || 'member';

          if (this.isHigherRole(teamRole, highestRole)) {
            highestRole = teamRole;
          }
        }
      }

      if (!highestRole) {
        return false;
      }

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

      return !!projectRolePermissions[highestRole]?.[resourceType]?.includes(action);
    } catch (error) {
      console.error('Error checking project membership:', error);
      return false;
    }
  }

  private isHigherRole(newRole: string, currentRole: string): boolean {
    const roleHierarchy = ['viewer', 'member', 'admin', 'owner'];
    const newIndex = roleHierarchy.indexOf(newRole);
    const currentIndex = roleHierarchy.indexOf(currentRole);

    return newIndex > currentIndex;
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

      for (const userPolicy of userPolicies) {
        const policy = userPolicy.policy;
        const policyId = policy.id;

        const rules = await this.getPolicyRules(policyId);

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
              isActive: true
            }
          }
        ]
      });

      for (const resourcePolicy of resourcePolicies) {
        const policy = resourcePolicy.policy;
        const policyId = policy.id;

        const rules = await this.getPolicyRules(policyId);

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
    const now = Date.now();
    if (
      policyCache[policyId] &&
      now - policyCache[policyId].cachedAt < CACHE_TTL
    ) {
      return policyCache[policyId].rules;
    }

    const policy = await Policy.findByPk(policyId, {
      include: [RuleModel] 
    });

    if (!policy || !policy.rules) return [];

    const mappedRules: Rule[] = policy.rules.map(dbRule => {
      const actionAttr = dbRule.actionAttributes as { type?: string } || {};
      const action = actionAttr.type || '*';

      const resourceAttr = dbRule.resourceAttributes as { type?: string } || {};
      const resource = resourceAttr.type || '*';

      const condition = dbRule.condition ? JSON.parse(dbRule.condition) : undefined;

      return {
        action,
        resource,
        condition
      };
    });

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
      const actionMatches = rule.action === '*' || rule.action === action;
      const resourceMatches = rule.resource === '*' || rule.resource === resourceType;

      if (!actionMatches || !resourceMatches) {
        return false;
      }

      if (!rule.condition) {
        return true;
      }

      return this.evaluateCondition(rule.condition, { resourceId, ...context });
    });
  }

  /**
   * Evaluate a condition with the given context
   */
  private evaluateCondition(condition: any, context: Record<string, any>): boolean {
    if (!condition) return true;

    if (typeof condition === 'object' && !Array.isArray(condition)) {
      return Object.entries(condition).every(([key, value]) => {
        return context[key] === value;
      });
    }

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
    if (!userId || !action || !resourceType) {
      console.log("Incomplete permission check data, skipping log");
      return;
    }

    try {
      await PermissionLog.create({
        userId,
        action,
        resourceType,
        resourceId: resourceId || null,
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
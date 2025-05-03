
const { PrismaClient } = require('@prisma/client');
const { evaluate } = require('jsonata'); // For evaluating conditions

const prisma = new PrismaClient();

class AuthorizationService {

  /**
   * Main authorization method that evaluates if an action is permitted
   */
  async isAuthorized(request) {
    try {
      // Enrich the request with additional attributes from database
      const enrichedRequest = await this.enrichRequest(request);

      // Get applicable policies
      const policies = await this.getApplicablePolicies(enrichedRequest);

      // No policies found
      if (policies.length === 0) {
        return { allowed: false, reason: 'No applicable policies found' };
      }

      // Evaluate policies
      const result = await this.evaluatePolicies(enrichedRequest, policies);

      // Log the authorization attempt
      await this.logAuthorization({
        userId: enrichedRequest.subject.userId,
        action: `${enrichedRequest.action.type}:${enrichedRequest.resource.type}`,
        resource: `${enrichedRequest.resource.type}:${enrichedRequest.resource.id}`,
        allowed: result.allowed,
        reason: result.reason
      });

      return result;
    } catch (error) {
      console.error('Authorization error:', error);
      return { allowed: false, reason: 'Authorization system error' };
    }
  }

  /**
   * Enrich the request with additional attributes from database
   */
  async enrichRequest(request) {
    const enriched = { ...request };

    // Enrich subject (user) attributes
    if (request.subject.userId) {
      const user = await prisma.user.findUnique({
        where: { id: request.subject.userId },
        include: {
          projectsManaged: true,
          projectsMember: { include: { project: true } },
          assignedTasks: { include: { task: true } }
        }
      });

      if (user) {
        enriched.subject = {
          ...enriched.subject,
          role: user.role,
          isActive: user.isActive,
          managedProjectIds: user.projectsManaged.map(p => p.id),
          memberProjectIds: user.projectsMember.map(up => up.projectId),
          assignedTaskIds: user.assignedTasks.map(ut => ut.taskId)
        };
      }
    }

    // Enrich resource attributes
    if (request.resource.type === 'project' && request.resource.id) {
      const project = await prisma.project.findUnique({
        where: { id: request.resource.id },
        include: {
          manager: true,
          members: { include: { user: true } }
        }
      });

      if (project) {
        enriched.resource = {
          ...enriched.resource,
          status: project.status,
          managerId: project.managerId,
          memberIds: project.members.map(m => m.userId)
        };
      }
    } else if (request.resource.type === 'task' && request.resource.id) {
      const task = await prisma.task.findUnique({
        where: { id: request.resource.id },
        include: {
          project: true,
          creator: true,
          assignees: { include: { user: true } }
        }
      });

      if (task) {
        enriched.resource = {
          ...enriched.resource,
          status: task.status,
          priority: task.priority,
          projectId: task.projectId,
          creatorId: task.creatorId,
          assigneeIds: task.assignees.map(a => a.userId),
          projectStatus: task.project?.status
        };
      }
    }

    // Set default environment attributes if not provided
    if (!enriched.environment) {
      enriched.environment = {};
    }

    enriched.environment.time = enriched.environment.time || new Date();

    return enriched;
  }

  /**
   * Get policies applicable to the request
   */
  async getApplicablePolicies(request) {
    // Get user-assigned policies
    const userPolicies = await prisma.userPolicy.findMany({
      where: {
        userId: request.subject.userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        policy: {
          include: {
            rules: true
          }
        }
      }
    });

    // Get resource-specific policies
    let resourcePolicies = [];

    if (request.resource.type === 'project') {
      const projectPolicies = await prisma.projectPolicy.findMany({
        where: {
          projectId: request.resource.id
        },
        include: {
          policy: {
            include: {
              rules: true
            }
          }
        }
      });
      resourcePolicies = [...resourcePolicies, ...projectPolicies];
    } else if (request.resource.type === 'task') {
      const taskPolicies = await prisma.taskPolicy.findMany({
        where: {
          taskId: request.resource.id
        },
        include: {
          policy: {
            include: {
              rules: true
            }
          }
        }
      });
      resourcePolicies = [...resourcePolicies, ...taskPolicies];

      // Also include policies from the parent project
      if (request.resource.projectId) {
        const projectPolicies = await prisma.projectPolicy.findMany({
          where: {
            projectId: request.resource.projectId
          },
          include: {
            policy: {
              include: {
                rules: true
              }
            }
          }
        });
        resourcePolicies = [...resourcePolicies, ...projectPolicies];
      }
    }

    // Combine and return unique policies
    const allPolicies = [
      ...userPolicies.map(up => up.policy),
      ...resourcePolicies.map(rp => rp.policy)
    ].filter(p => p.isActive);

    // Return unique policies
    const uniquePolicies = Array.from(
      new Map(allPolicies.map(p => [p.id, p])).values()
    );

    return uniquePolicies;
  }

  /**
   * Evaluate policies to determine if action is allowed
   */
  async evaluatePolicies(request, policies) {
    // Extract rules from policies and sort by priority
    const rules = policies.flatMap(p => p.rules)
      .sort((a, b) => b.priority - a.priority);

    // Default is to deny if no rules match
    let finalEffect = 'DENY';
    let reason = 'No matching rules';

    for (const rule of rules) {
      // Check if rule applies to this request
      const ruleMatches = await this.ruleMatches(request, rule);

      // If rule matches, take its effect and stop processing (first match wins)
      if (ruleMatches) {
        finalEffect = rule.effect;
        reason = `Rule "${rule.name}" (${rule.id}) ${finalEffect === 'ALLOW' ? 'allows' : 'denies'} the action`;
        break;
      }
    }

    return {
      allowed: finalEffect === 'ALLOW',
      reason
    };
  }

  /**
   * Check if a rule matches the request
   */
  async ruleMatches(request, rule) {
    try {
      // Parse stored JSON attributes
      const subjectAttrs = rule.subjectAttributes ? JSON.parse(rule.subjectAttributes) : null;
      const resourceAttrs = rule.resourceAttributes ? JSON.parse(rule.resourceAttributes) : null;
      const actionAttrs = rule.actionAttributes ? JSON.parse(rule.actionAttributes) : null;
      const environmentAttrs = rule.environmentAttributes ? JSON.parse(rule.environmentAttributes) : null;

      // Check subject attributes match
      if (subjectAttrs && !this.attributesMatch(request.subject, subjectAttrs)) {
        return false;
      }

      // Check resource attributes match
      if (resourceAttrs && !this.attributesMatch(request.resource, resourceAttrs)) {
        return false;
      }

      // Check action attributes match
      if (actionAttrs && !this.attributesMatch(request.action, actionAttrs)) {
        return false;
      }

      // Check environment attributes match
      if (
        environmentAttrs &&
        request.environment &&
        !this.attributesMatch(request.environment, environmentAttrs)
      ) {
        return false;
      }

      // Evaluate the condition if present
      if (rule.condition) {
        // Create a context object containing all attributes
        const context = {
          subject: request.subject,
          resource: request.resource,
          action: request.action,
          environment: request.environment || {}
        };

        // Evaluate the condition expression
        const result = await evaluate(rule.condition, context);
        return Boolean(result);
      }

      // If we got here, all checks passed
      return true;
    } catch (error) {
      console.error('Error evaluating rule:', error);
      return false;
    }
  }

  /**
   * Check if attributes match the required pattern
   */
  attributesMatch(actual, required) {
    for (const [key, value] of Object.entries(required)) {
      if (Array.isArray(value)) {
        // If expected value is an array, actual value must be in that array
        if (!Array.isArray(actual[key]) && !value.includes(actual[key])) {
          return false;
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively check nested objects
        if (!actual[key] || !this.attributesMatch(actual[key], value)) {
          return false;
        }
      } else {
        // Direct comparison
        if (actual[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Log authorization attempts
   */
  async logAuthorization(log) {
    await prisma.permissionLog.create({
      data: {
        userId: log.userId,
        action: log.action,
        resource: log.resource,
        allowed: log.allowed,
        reason: log.reason
      }
    });
  }
}

module.exports = {
  AuthorizationService: new AuthorizationService()
};
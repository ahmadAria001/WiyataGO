import type { SkillNodeData } from '@/components/skill-tree/skill-node';

/**
 * Check if adding a prerequisite would create a cycle in the dependency graph.
 * Mirrors backend Skill::wouldCreateCycle() logic.
 *
 * If we add "prerequisite -> skill", we check if "skill" is already
 * an ancestor of "prerequisite" (i.e., can we reach "skill" by following
 * the prerequisites of the proposed prerequisite).
 *
 * @param skills - All skills in the current graph
 * @param skillId - The skill that would receive the new prerequisite
 * @param newPrerequisiteId - The proposed prerequisite skill
 * @returns true if adding this prerequisite would create a cycle
 */
export function wouldCreateCycle(
    skills: SkillNodeData[],
    skillId: string,
    newPrerequisiteId: string,
): boolean {
    // Self-reference is always a cycle
    if (skillId === newPrerequisiteId) {
        return true;
    }

    const visited = new Set<string>();
    const stack: string[] = [newPrerequisiteId];

    while (stack.length > 0) {
        const currentId = stack.pop()!;

        if (currentId === skillId) {
            return true; // Cycle detected
        }

        if (visited.has(currentId)) {
            continue;
        }

        visited.add(currentId);

        // Find prerequisites of current skill (traverse upward)
        const currentSkill = skills.find((s) => s.ulid === currentId);
        if (currentSkill) {
            const prereqIds = currentSkill.prerequisites.map((p) => p.ulid);
            stack.push(...prereqIds);
        }
    }

    return false;
}

/**
 * Get all ancestors (direct and indirect prerequisites) of a skill.
 * Useful for determining which nodes cannot be targets during connection.
 *
 * @param skills - All skills in the current graph
 * @param skillId - The skill to find ancestors for
 * @returns Set of skill IDs that are ancestors of the given skill
 */
export function getAncestors(
    skills: SkillNodeData[],
    skillId: string,
): Set<string> {
    const ancestors = new Set<string>();
    const stack: string[] = [];

    // Start with direct prerequisites
    const skill = skills.find((s) => s.ulid === skillId);
    if (skill) {
        stack.push(...skill.prerequisites.map((p) => p.ulid));
    }

    while (stack.length > 0) {
        const currentId = stack.pop()!;

        if (ancestors.has(currentId)) {
            continue;
        }

        ancestors.add(currentId);

        const currentSkill = skills.find((s) => s.ulid === currentId);
        if (currentSkill) {
            stack.push(...currentSkill.prerequisites.map((p) => p.ulid));
        }
    }

    return ancestors;
}

/**
 * Get all descendants (skills that depend on this skill) of a skill.
 * These are the skills that would create cycles if added as prerequisites.
 *
 * @param skills - All skills in the current graph
 * @param skillId - The skill to find descendants for
 * @returns Set of skill IDs that depend on the given skill
 */
export function getDescendants(
    skills: SkillNodeData[],
    skillId: string,
): Set<string> {
    const descendants = new Set<string>();
    const stack: string[] = [];

    // Find skills that have this skill as a prerequisite
    for (const skill of skills) {
        if (skill.prerequisites.some((p) => p.ulid === skillId)) {
            stack.push(skill.ulid);
        }
    }

    while (stack.length > 0) {
        const currentId = stack.pop()!;

        if (descendants.has(currentId)) {
            continue;
        }

        descendants.add(currentId);

        // Find skills that have current skill as a prerequisite
        for (const skill of skills) {
            if (skill.prerequisites.some((p) => p.ulid === currentId)) {
                stack.push(skill.ulid);
            }
        }
    }

    return descendants;
}

/**
 * Check which skills can be valid targets for a new prerequisite connection
 * from the given source skill.
 *
 * @param skills - All skills in the current graph
 * @param sourceSkillId - The skill that would become a prerequisite
 * @returns Set of skill IDs that can safely add sourceSkillId as a prerequisite
 */
export function getValidConnectionTargets(
    skills: SkillNodeData[],
    sourceSkillId: string,
): Set<string> {
    const validTargets = new Set<string>();
    const invalidTargets = getAncestors(skills, sourceSkillId);
    invalidTargets.add(sourceSkillId); // Can't connect to self

    for (const skill of skills) {
        // Skip if already has this prerequisite
        const alreadyHasPrerequisite = skill.prerequisites.some(
            (p) => p.ulid === sourceSkillId,
        );

        if (!invalidTargets.has(skill.ulid) && !alreadyHasPrerequisite) {
            validTargets.add(skill.ulid);
        }
    }

    return validTargets;
}

import { useCallback, useState } from 'react';
import { reloadData, skillsApi } from '@/api/skills';
import type { SkillNodeData } from '@/components/skill-tree';
import { wouldCreateCycle } from '@/lib/skill-tree-utils';

/**
 * Hook for managing prerequisite relationships
 *
 * @param courseId - Course ULID
 * @param skills - Current skills array
 * @param setSkills - State setter for skills array
 * @returns Prerequisite management functions and error state
 */
export function usePrerequisites(
    courseId: string,
    skills: SkillNodeData[],
    setSkills: (updater: (prev: SkillNodeData[]) => SkillNodeData[]) => void,
) {
    const [error, setError] = useState<string | null>(null);

    const addPrerequisite = useCallback(
        (skillId: string, prerequisiteId: string) => {
            setError(null);

            // Client-side validation: self-reference
            if (skillId === prerequisiteId) {
                setError('A skill cannot be its own prerequisite.');
                return;
            }

            // Client-side validation: cycle detection
            if (wouldCreateCycle(skills, skillId, prerequisiteId)) {
                setError(
                    'Adding this prerequisite would create a circular dependency.',
                );
                return;
            }

            // Client-side validation: duplicate check
            const skill = skills.find((s) => s.ulid === skillId);
            if (skill?.prerequisites.some((p) => p.ulid === prerequisiteId)) {
                setError('This prerequisite relationship already exists.');
                return;
            }

            // Network request
            skillsApi.addPrerequisite(courseId, skillId, prerequisiteId, {
                onSuccess: () => {
                    // Update local state
                    setSkills((prev) => {
                        const prereqSkill = prev.find(
                            (s) => s.ulid === prerequisiteId,
                        );
                        if (!prereqSkill) return prev;
                        return prev.map((s) =>
                            s.ulid === skillId
                                ? {
                                      ...s,
                                      prerequisites: [
                                          ...s.prerequisites,
                                          {
                                              ulid: prereqSkill.ulid,
                                              name: prereqSkill.name,
                                              position_x:
                                                  prereqSkill.position_x,
                                              position_y:
                                                  prereqSkill.position_y,
                                          },
                                      ],
                                  }
                                : s,
                        );
                    });
                    reloadData(['skills', 'course']);
                },
                onError: (errors) => {
                    const message =
                        typeof errors === 'object' && errors !== null
                            ? Object.values(errors)[0]
                            : 'Failed to add prerequisite';
                    setError(String(message));
                },
            });
        },
        [courseId, skills, setSkills],
    );

    const removePrerequisite = useCallback(
        (skillId: string, prerequisiteId: string) => {
            // Call API (uses router.delete with optimistic update)
            skillsApi.removePrerequisite(courseId, skillId, prerequisiteId, {
                onSuccess: () => {
                    reloadData(['skills', 'course']);
                },
            });

            // Optimistic local update
            setSkills((prev) =>
                prev.map((s) =>
                    s.ulid === skillId
                        ? {
                              ...s,
                              prerequisites: s.prerequisites.filter(
                                  (p) => p.ulid !== prerequisiteId,
                              ),
                          }
                        : s,
                ),
            );
        },
        [courseId, setSkills],
    );

    const clearError = useCallback(() => setError(null), []);

    return {
        addPrerequisite,
        removePrerequisite,
        error,
        clearError,
    };
}

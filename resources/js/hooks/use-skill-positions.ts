import { useCallback, useRef, useState } from 'react';
import { skillsApi } from '@/api/skills';
import type { SkillNodeData } from '@/components/skill-tree';

/**
 * Hook for managing skill position updates and persistence
 *
 * @param courseId - Course ULID
 * @param setSkills - State setter for skills array
 * @returns Position management functions and state
 */
export function useSkillPositions(
    courseId: string,
    setSkills: (updater: (prev: SkillNodeData[]) => SkillNodeData[]) => void,
) {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const pendingRef = useRef(new Map<string, { x: number; y: number }>());

    const updatePosition = useCallback(
        (skillId: string, x: number, y: number) => {
            // Update local state
            setSkills((prev) =>
                prev.map((s) =>
                    s.ulid === skillId
                        ? { ...s, position_x: x, position_y: y }
                        : s,
                ),
            );

            // Track pending save
            pendingRef.current.set(skillId, {
                x: Math.round(x),
                y: Math.round(y),
            });
            setHasUnsavedChanges(true);
        },
        [setSkills],
    );

    const savePositions = useCallback(() => {
        const pending = pendingRef.current;
        if (pending.size === 0) return;

        // Save all pending positions
        pending.forEach((pos, skillId) => {
            skillsApi.updatePosition(courseId, skillId, pos.x, pos.y, {
                onSuccess: () => setHasUnsavedChanges(false),
            });
        });

        pending.clear();
    }, [courseId]);

    return {
        updatePosition,
        savePositions,
        hasUnsavedChanges,
    };
}

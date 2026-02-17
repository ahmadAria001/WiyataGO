import { type VisitOptions } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import type { SkillNodeData } from '@/components/skill-tree';

export const reloadData = (dataKey: Array<string>) => {
    router.reload({ only: dataKey });
};

/**
 * Skills API abstraction layer
 * Uses Inertia router - backend determines JSON/Inertia response via Utils::determinReturnMethod
 */
export const skillsApi = {
    /**
     * Update skill position
     */
    updatePosition(
        courseId: string,
        skillId: string,
        x: number,
        y: number,
        options?: Partial<VisitOptions>,
    ): void {
        router.patch(
            `/courses/${courseId}/skills/${skillId}/position`,
            { position_x: x, position_y: y },
            {
                preserveState: true,
                preserveScroll: true,
                ...options,
            },
        );
    },

    /**
     * Add prerequisite relationship
     */
    addPrerequisite(
        courseId: string,
        skillId: string,
        prerequisiteId: string,
        options?: Partial<VisitOptions>,
    ): void {
        router.post(
            `/courses/${courseId}/skills/${skillId}/prerequisites`,
            { prerequisite_id: prerequisiteId },
            {
                preserveState: true,
                preserveScroll: true,
                ...options,
            },
        );
    },

    /**
     * Remove prerequisite relationship
     */
    removePrerequisite(
        courseId: string,
        skillId: string,
        prerequisiteId: string,
        options?: Partial<VisitOptions>,
    ): void {
        router.delete(
            `/courses/${courseId}/skills/${skillId}/prerequisites/${prerequisiteId}`,
            {
                preserveState: true,
                preserveScroll: true,
                ...options,
            },
        );
    },

    /**
     * Update skill data
     */
    updateSkill(
        courseId: string,
        skillId: string,
        data: Partial<SkillNodeData>,
        options?: Partial<VisitOptions>,
    ): void {
        router.put(`/courses/${courseId}/skills/${skillId}`, data, {
            preserveState: true,
            preserveScroll: true,
            ...options,
        });
    },
    /**
     * Sync full skill state (Undo/Redo)
     */
    sync(
        courseId: string,
        skills: SkillNodeData[],
        options?: Partial<VisitOptions>,
    ): void {
        router.post(
            `/courses/${courseId}/skills/sync`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { skills: skills as any },
            {
                preserveState: true,
                preserveScroll: true,
                ...options,
            },
        );
    },
};

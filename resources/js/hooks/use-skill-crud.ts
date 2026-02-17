import { useCallback, useState } from 'react';
import { router } from '@inertiajs/react';
import { skillsApi } from '@/api/skills';
import {
    store,
    storeBuilder,
} from '@/actions/App/Http/Controllers/SkillController';
import type { SkillNodeData } from '@/components/skill-tree';
import { toast } from 'sonner';

/**
 * Hook for skill CRUD operations
 *
 * @param courseId - Course ULID
 * @param skills - Current skills array
 * @param setSkills - State setter for skills array
 * @returns CRUD functions and saving state
 */
export function useSkillCRUD(
    courseId: string,
    skills: SkillNodeData[],
    setSkills: (
        updater: (prev: SkillNodeData[]) => SkillNodeData[],
        checkpoint?: boolean,
    ) => void,
) {
    const [isSaving, setIsSaving] = useState(false);

    const createSkill = useCallback(() => {
        // Generate unique name
        const existingNewSkills = skills.filter((s) =>
            s.name.includes('New Skill'),
        );
        const skillNumbers = existingNewSkills
            .map((s) => {
                const match = s.name.match(/New Skill\s*(\d+)?/);
                return match ? (match[1] ? parseInt(match[1]) : 1) : 0;
            })
            .filter((n) => n > 0);

        const nextNumber =
            skillNumbers.length > 0 ? Math.max(...skillNumbers) + 1 : 1;
        const name = nextNumber === 1 ? 'New Skill' : `New Skill ${nextNumber}`;

        router.post(store({ course: courseId }).url, {
            name,
            position_x: Math.floor(200 + Math.random() * 200),
            position_y: Math.floor(200 + Math.random() * 200),
            description: `Description for ${name}`,
            remedial_material_url: '',
            difficulty: 'beginner',
            xp_reward: 100,
        });
    }, [courseId, skills]);

    const builderCreateSkill = useCallback(() => {
        // Generate unique name
        const existingNewSkills = skills.filter((s) =>
            s.name.includes('New Skill'),
        );
        const skillNumbers = existingNewSkills
            .map((s) => {
                const match = s.name.match(/New Skill\s*(\d+)?/);
                return match ? (match[1] ? parseInt(match[1]) : 1) : 0;
            })
            .filter((n) => n > 0);

        const nextNumber =
            skillNumbers.length > 0 ? Math.max(...skillNumbers) + 1 : 1;
        const name = nextNumber === 1 ? 'New Skill' : `New Skill ${nextNumber}`;

        router.post(
            storeBuilder({ course: courseId }).url,
            {
                name,
                position_x: Math.floor(200 + Math.random() * 200),
                position_y: Math.floor(200 + Math.random() * 200),
                description: `Description for ${name}`,
                remedial_material_url: '',
                difficulty: 'beginner',
                xp_reward: 100,
            },
            { onSuccess: () => toast.success('Skill created successfully') },
        );
    }, [courseId, skills]);

    const updateSkill = useCallback(
        (skillId: string, data: Partial<SkillNodeData>) => {
            // Optimistic update
            setSkills(
                (prev) =>
                    prev.map((s) =>
                        s.ulid === skillId ? { ...s, ...data } : s,
                    ),
                false, // Don't checkpoint - history handled by onEditStart/DragStart
            );
            setIsSaving(true);

            skillsApi.updateSkill(courseId, skillId, data, {
                onSuccess: () => setIsSaving(false),
                onError: () => setIsSaving(false),
            });
        },
        [courseId, setSkills],
    );

    const deleteSkill = useCallback(
        (skillId: string) => {
            router.delete(`/courses/${courseId}/skills/${skillId}`);
        },
        [courseId],
    );
    const deleteBuilderSkill = useCallback(
        (skillId: string) => {
            router.delete(`/courses/${courseId}/skills/builder/${skillId}`);
        },
        [courseId],
    );

    const duplicateSkill = useCallback(
        (skill: SkillNodeData) => {
            router.post(store({ course: courseId }).url, {
                name: `${skill.name} (Copy)`,
                description: skill.description,
                difficulty: skill.difficulty,
                xp_reward: skill.xp_reward,
                position_x: skill.position_x + 100,
                position_y: skill.position_y + 50,
                remedial_material_url: skill.remedial_material_url,
            });
        },
        [courseId],
    );

    return {
        createSkill,
        builderCreateSkill,
        updateSkill,
        deleteSkill,
        deleteBuilderSkill,
        duplicateSkill,
        isSaving,
    };
}

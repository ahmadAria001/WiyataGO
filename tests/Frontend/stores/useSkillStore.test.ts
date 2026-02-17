import { act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import type { SkillNodeData } from '@/components/skill-tree';
import { useSkillStore } from '@/stores/use-skill-store';

// Helper to create mock skills
const createMockSkill = (id: string, name: string): SkillNodeData => ({
    ulid: id,
    name,
    description: '',
    difficulty: 'beginner',
    xp_reward: 100,
    remedial_material_url: '',
    position_x: 0,
    position_y: 0,
    prerequisites: [],
});

describe('useSkillStore', () => {
    // Reset store before each test
    beforeEach(() => {
        const { resetHistory, setSkills } = useSkillStore.getState();
        resetHistory();
        setSkills([], false); // Clear current skills without history
    });

    it('should initialize with empty state', () => {
        const { skills, history } = useSkillStore.getState();
        expect(skills).toEqual([]);
        expect(history.past).toEqual([]);
        expect(history.future).toEqual([]);
    });

    it('should update skills and track history by default', () => {
        const skill1 = createMockSkill('1', 'Skill 1');

        act(() => {
            useSkillStore.getState().setSkills([skill1]);
        });

        const state = useSkillStore.getState();
        expect(state.skills).toEqual([skill1]);
        expect(state.history.past).toHaveLength(1);
        expect(state.history.past[0]).toEqual([]); // Previous state was empty
    });

    it('should not track history when checkpoint is false', () => {
        const skill1 = createMockSkill('1', 'Skill 1');

        act(() => {
            useSkillStore.getState().setSkills([skill1], false);
        });

        const state = useSkillStore.getState();
        expect(state.skills).toEqual([skill1]);
        expect(state.history.past).toHaveLength(0);
    });

    it('should undo to previous state', () => {
        const skill1 = createMockSkill('1', 'Skill 1');
        const skill2 = createMockSkill('2', 'Skill 2');

        // Step 1: Add Skill 1 (Past: [])
        act(() => useSkillStore.getState().setSkills([skill1]));

        // Step 2: Add Skill 2 (Past: [[], [skill1]])
        act(() => useSkillStore.getState().setSkills([skill1, skill2]));

        // Undo -> Should be [skill1]
        act(() => useSkillStore.getState().undo());

        const state = useSkillStore.getState();
        expect(state.skills).toEqual([skill1]);
        expect(state.history.future).toHaveLength(1);
        expect(state.history.future[0]).toEqual([skill1, skill2]);
    });

    it('should redo to next state', () => {
        const skill1 = createMockSkill('1', 'Skill 1');

        act(() => useSkillStore.getState().setSkills([skill1]));
        act(() => useSkillStore.getState().undo());

        // Verify undo worked
        expect(useSkillStore.getState().skills).toEqual([]);

        // Redo -> Should be [skill1]
        act(() => useSkillStore.getState().redo());

        const state = useSkillStore.getState();
        expect(state.skills).toEqual([skill1]);
        expect(state.history.future).toHaveLength(0);
    });

    it('should clear future stack when new action is taken (Linear History)', () => {
        const skill1 = createMockSkill('1', 'Skill 1');
        const skill2 = createMockSkill('2', 'Skill 2');
        const skill3 = createMockSkill('3', 'Skill 3');

        // 1. Add Skill 1
        act(() => useSkillStore.getState().setSkills([skill1]));
        // 2. Add Skill 2
        act(() => useSkillStore.getState().setSkills([skill1, skill2]));
        // 3. Undo (Back to [skill1])
        act(() => useSkillStore.getState().undo());

        expect(useSkillStore.getState().history.future).toHaveLength(1); // Future has [skill1, skill2]

        // 4. Add Skill 3 (Forking history)
        act(() => useSkillStore.getState().setSkills([skill1, skill3]));

        const state = useSkillStore.getState();
        expect(state.skills).toEqual([skill1, skill3]);
        expect(state.history.future).toHaveLength(0); // Future should be cleared!
    });

    it('should respect max history limit', () => {
        // Add 60 entries
        for (let i = 0; i < 60; i++) {
            act(() => {
                useSkillStore
                    .getState()
                    .setSkills([createMockSkill(`${i}`, `Skill ${i}`)]);
            });
        }

        const state = useSkillStore.getState();
        expect(state.history.past).toHaveLength(50); // MAX_HISTORY_LENGTH
    });

    it('should manually checkpoint state', () => {
        const skill1 = createMockSkill('1', 'Skill 1');

        // Initial state (Past: [])
        act(() => useSkillStore.getState().setSkills([skill1], false));
        expect(useSkillStore.getState().history.past).toHaveLength(0);

        // Checkpoint (Past: [[skill1]])
        act(() => useSkillStore.getState().checkpoint());

        const state = useSkillStore.getState();
        expect(state.history.past).toHaveLength(1);
        expect(state.history.past[0]).toEqual([skill1]);
    });
});

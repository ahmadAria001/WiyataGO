import { create } from 'zustand';
import { skillsApi } from '@/api/skills';
import type { SkillNodeData } from '@/components/skill-tree';

interface HistoryState {
    past: SkillNodeData[][];
    future: SkillNodeData[][];
}

interface SkillState {
    // Data
    skills: SkillNodeData[];
    courseId: string | null;
    selectedSkillId: string | null;
    // History
    history: HistoryState;
    isHistoryEnabled: boolean;

    // Actions
    setCourseId: (courseId: string) => void;
    setSkills: (
        skills: SkillNodeData[] | ((prev: SkillNodeData[]) => SkillNodeData[]),
        checkpoint?: boolean,
    ) => void;
    undo: () => void;
    redo: () => void;
    resetHistory: () => void;
    setHistoryEnabled: (enabled: boolean) => void;

    selectSkill: (id: string | null) => void;
    updateSkill: (id: string, data: Partial<SkillNodeData>) => void;
    checkpoint: () => void;

    // Selectors
    canUndo: () => boolean;
    canRedo: () => boolean;
}

const MAX_HISTORY_LENGTH = 50;

export const useSkillStore = create<SkillState>((set, get) => ({
    skills: [],
    courseId: null,
    selectedSkillId: null,
    history: {
        past: [],
        future: [],
    },
    isHistoryEnabled: true,

    setCourseId: (courseId) => set({ courseId }),

    setSkills: (updater, checkpoint = true) => {
        set((state) => {
            const newSkills =
                typeof updater === 'function' ? updater(state.skills) : updater;

            // Equal check to avoid unnecessary updates (simple reference/length check first)
            if (state.skills === newSkills) return state;

            // If checkpointing is disabled or history is disabled, just update state
            if (!checkpoint || !state.isHistoryEnabled) {
                return { skills: newSkills };
            }

            const newPast = [...state.history.past, state.skills];

            // Limit history size
            if (newPast.length > MAX_HISTORY_LENGTH) {
                newPast.shift();
            }

            return {
                skills: newSkills,
                history: {
                    past: newPast,
                    future: [], // Clear future on new action (Linear history)
                },
            };
        });
    },

    undo: () => {
        set((state) => {
            const { past, future } = state.history;
            if (past.length === 0) return state;

            const previous = past[past.length - 1];
            const newPast = past.slice(0, -1);

            // Sync with backend if courseID is set
            if (state.courseId) {
                skillsApi.sync(state.courseId, previous);
            }

            return {
                skills: previous,
                history: {
                    past: newPast,
                    future: [state.skills, ...future],
                },
            };
        });
    },

    redo: () => {
        set((state) => {
            const { past, future } = state.history;
            if (future.length === 0) return state;

            const next = future[0];
            const newFuture = future.slice(1);

            // Sync with backend if courseID is set
            if (state.courseId) {
                skillsApi.sync(state.courseId, next);
            }

            return {
                skills: next,
                history: {
                    past: [...past, state.skills],
                    future: newFuture,
                },
            };
        });
    },

    resetHistory: () => {
        set({
            history: { past: [], future: [] },
        });
    },

    setHistoryEnabled: (enabled) => {
        set({ isHistoryEnabled: enabled });
    },

    selectSkill: (id) => {
        set({ selectedSkillId: id });
    },

    updateSkill: (id, data) => {
        set((state) => ({
            skills: state.skills.map((s) =>
                s.ulid === id ? { ...s, ...data } : s,
            ),
        }));
    },

    checkpoint: () => {
        set((state) => {
            const newPast = [...state.history.past, state.skills];
            if (newPast.length > MAX_HISTORY_LENGTH) {
                newPast.shift();
            }
            return {
                history: {
                    past: newPast,
                    future: [],
                },
            };
        });
    },

    canUndo: () => get().history.past.length > 0,
    canRedo: () => get().history.future.length > 0,
}));

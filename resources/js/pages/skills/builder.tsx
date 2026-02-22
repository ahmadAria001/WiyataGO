import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { toast } from 'sonner';
import {
    index as coursesIndex,
    show as showCourse,
} from '@/actions/App/Http/Controllers/CourseController';
import {
    SkillTreeCanvas,
    NodeSidebar,
    type SkillNodeData,
} from '@/components/skill-tree';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAlertDialog } from '@/hooks/use-alert-dialog';
import { usePrerequisites } from '@/hooks/use-prerequisites';
import { useSkillCRUD } from '@/hooks/use-skill-crud';
import { useSkillPositions } from '@/hooks/use-skill-positions';
import AppLayout from '@/layouts/app-layout';
import { useSkillStore } from '@/stores/use-skill-store';
import type { BreadcrumbItem } from '@/types';

interface Course {
    ulid: string;
    name: string;
}

interface Props {
    course: Course;
    skills: SkillNodeData[];
}

export default function SkillBuilder({ course, skills: initialSkills }: Props) {
    // Initialize store with server data
    const setSkills = useSkillStore((state) => state.setSkills);
    const skills = useSkillStore((state) => state.skills);
    const selectedSkillId = useSkillStore((state) => state.selectedSkillId);
    const setSelectedSkillId = useSkillStore((state) => state.selectSkill);
    const resetHistory = useSkillStore((state) => state.resetHistory);
    const checkpoint = useSkillStore((state) => state.checkpoint);
    const setCourseId = useSkillStore((state) => state.setCourseId);

    // Initialize functionality
    useEffect(() => {
        setCourseId(course.ulid);
        resetHistory();
    }, [course.ulid, resetHistory, setCourseId]);

    // Sync props to store when server data changes
    useEffect(() => {
        setSkills(initialSkills, false); // Update data without creating a history entry
    }, [initialSkills, setSkills]);

    const currentCursorSkill = useMemo(
        () => skills.find((s) => s.ulid == selectedSkillId) || null,
        [skills, selectedSkillId],
    );

    // Custom hooks - extracted business logic
    // Helper to prevent history flood during drag
    const setSkillsNoCheckpoint = useCallback(
        (updater: (prev: SkillNodeData[]) => SkillNodeData[]) => {
            setSkills(updater, false);
        },
        [setSkills],
    );

    const positions = useSkillPositions(course.ulid, setSkillsNoCheckpoint);
    const prerequisites = usePrerequisites(course.ulid, skills, setSkills);
    const crud = useSkillCRUD(course.ulid, skills, setSkills);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: coursesIndex().url },
        { title: course.name, href: showCourse({ course: course.ulid }).url },
        { title: 'Skill Builder', href: '#' },
    ];

    const handleSelectSkill = useCallback(
        (skill: SkillNodeData | null) => {
            if (!skill) {
                setSelectedSkillId(null);
                return;
            }
            flushSync(() => setSelectedSkillId(skill.ulid));
        },
        [setSelectedSkillId],
    );

    const alertDialog = useAlertDialog();

    const reloadData = useCallback(() => {
        router.reload({
            only: ['skills'],
            onSuccess: (res) =>
                setSkills((res.props as unknown as Props).skills, false),
        });
    }, [setSkills]);

    const addSkill = async () => {
        const confirmed = await alertDialog.confirm({
            title: 'Create new skill?',
            description: 'This will add a new skill node to the canvas',
            confirmText: 'Create',
            variant: 'default',
        });

        if (confirmed) {
            checkpoint(); // Save state before creation
            crud.builderCreateSkill();
            reloadData();
        }
    };

    const handleUpdateSkill = useCallback(
        (updates: Partial<SkillNodeData>) => {
            // Direct store update already handled by useSkillStore actions if we had them,
            // but keeping this for compatibility with existing sidebar patterns
            useSkillStore.getState().updateSkill(selectedSkillId!, updates);
        },
        [selectedSkillId],
    );

    const handleSaveSkill = useCallback(() => {
        if (!currentCursorSkill) return;

        crud.updateSkill(currentCursorSkill.ulid, currentCursorSkill);
        reloadData();
    }, [currentCursorSkill, crud, reloadData]);

    useEffect(() => {
        const removeListener = router.on('invalid', (event) => {
            event.preventDefault();
            if (
                event.detail.response.status === 404
                // &&
                // event.detail.response.config.url?.includes('/position')
            ) {
                reloadData();
                toast.error('Skill not found!', {
                    description: 'Data has been refreshed.',
                    richColors: true,
                });
            }
        });

        return () => {
            removeListener();
        };
    }, [reloadData]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${course.name} - Skill Tree Builder`} />

            <div className="flex h-[calc(100vh-64px)] flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-slate-100 px-4 py-2 dark:border-b-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Status:
                        </span>
                        <span
                            className={`inline-flex items-center gap-1 text-sm ${positions.hasUnsavedChanges ? 'text-amber-600' : 'text-emerald-600'}`}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${positions.hasUnsavedChanges ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            />
                            {crud.isSaving
                                ? 'Saving...'
                                : positions.hasUnsavedChanges
                                  ? 'Unsaved'
                                  : 'Saved'}
                        </span>
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="default">Publish Course</Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <Kbd>Ctrl + Shift⇧ + S</Kbd>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Main content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Canvas */}
                    <div className="flex-1">
                        <SkillTreeCanvas
                            skills={skills}
                            selectedSkillId={selectedSkillId}
                            onSelectSkill={handleSelectSkill}
                            onUpdatePosition={positions.updatePosition}
                            onDragStart={checkpoint}
                            onSavePositions={positions.savePositions}
                            onAddPrerequisite={prerequisites.addPrerequisite}
                            onRemovePrerequisite={
                                prerequisites.removePrerequisite
                            }
                            onAddSkill={addSkill}
                            connectionError={prerequisites.error}
                            onClearConnectionError={prerequisites.clearError}
                        />
                    </div>

                    {/* Sidebar */}
                    {currentCursorSkill && (
                        <NodeSidebar
                            key={currentCursorSkill.ulid}
                            skill={currentCursorSkill}
                            onClose={() => {
                                setSelectedSkillId(null);
                            }}
                            onUpdate={handleUpdateSkill}
                            onEditStart={checkpoint}
                            onDuplicate={() => {
                                if (!currentCursorSkill) return;
                                checkpoint();
                                crud.duplicateSkill(currentCursorSkill);
                                reloadData();
                            }}
                            onDelete={async () => {
                                if (!selectedSkillId) return;

                                const confirmed = await alertDialog.confirm({
                                    title: 'Delete skill',
                                    description:
                                        'Are you sure you want to delete this skill? This action cannot be undone.',
                                    confirmText: 'Delete',
                                    variant: 'destructive',
                                });

                                if (confirmed) {
                                    checkpoint(); // Save state before deletion
                                    crud.deleteBuilderSkill(selectedSkillId);
                                    setSelectedSkillId(null);
                                    reloadData();
                                }
                            }}
                            onSave={handleSaveSkill}
                            onRemovePrerequisite={async (prereqId) => {
                                if (!selectedSkillId) return;

                                const confirmed = await alertDialog.confirm({
                                    title: 'Remove prerequisite',
                                    description:
                                        'Are you sure you want to remove this prerequisite? This action cannot be undone.',
                                    confirmText: 'Remove',
                                    variant: 'destructive',
                                });

                                if (confirmed) {
                                    checkpoint();
                                    prerequisites.removePrerequisite(
                                        selectedSkillId,
                                        prereqId,
                                    );
                                    reloadData();
                                }
                            }}
                            isSaving={crud.isSaving}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

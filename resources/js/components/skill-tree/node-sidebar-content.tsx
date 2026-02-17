import { X, Copy, Trash2, Zap, Blocks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { SkillNodeData } from './skill-node';

export interface NodeSidebarContentProps {
    skill: SkillNodeData;
    onClose: () => void;
    onUpdate: (data: Partial<SkillNodeData>) => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onSave: () => void;
    onRemovePrerequisite?: (prerequisiteId: string) => void;
    onEditStart?: () => void;
    isSaving?: boolean;
}

export function NodeSidebarContent({
    skill,
    onClose,
    onUpdate,
    onDuplicate,
    onDelete,
    onSave,
    onRemovePrerequisite,
    onEditStart,
    isSaving,
}: NodeSidebarContentProps) {
    const descriptionLength = skill.description?.length || 0;
    const maxDescriptionLength = 150;

    return (
        <div className="flex h-full flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-semibold">Node Properties</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Type indicator */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                        <Blocks className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">
                            TYPE
                        </div>
                        <div className="font-medium">Concept Lesson</div>
                    </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Lesson Title</Label>
                        <Input
                            id="name"
                            value={skill.name}
                            onChange={(e) => onUpdate({ name: e.target.value })}
                            onFocus={onEditStart}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Short Description</Label>
                        <Textarea
                            id="description"
                            value={skill.description || ''}
                            onChange={(e) =>
                                onUpdate({ description: e.target.value })
                            }
                            onFocus={onEditStart}
                            rows={3}
                            maxLength={maxDescriptionLength}
                        />
                        <div className="text-right text-xs text-muted-foreground">
                            <span
                                className={
                                    descriptionLength > maxDescriptionLength
                                        ? 'text-red-500'
                                        : ''
                                }
                            >
                                {descriptionLength}
                            </span>
                            /{maxDescriptionLength} characters
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <Select
                                value={skill.difficulty}
                                onValueChange={(value) =>
                                    onUpdate({
                                        difficulty:
                                            value as SkillNodeData['difficulty'],
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner">
                                        Beginner
                                    </SelectItem>
                                    <SelectItem value="intermediate">
                                        Intermediate
                                    </SelectItem>
                                    <SelectItem value="advanced">
                                        Advanced
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="xp">XP Reward</Label>
                            <div className="relative">
                                <Zap className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-yellow-500" />
                                <Input
                                    id="xp"
                                    type="number"
                                    value={skill.xp_reward}
                                    onChange={(e) =>
                                        onUpdate({
                                            xp_reward:
                                                parseInt(e.target.value) || 0,
                                        })
                                    }
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Prerequisites */}
                    {skill.prerequisites.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <Label>Prerequisites</Label>
                            <ul className="space-y-1">
                                {skill.prerequisites.map((prereq) => (
                                    <li
                                        key={prereq.ulid}
                                        className="flex items-center justify-between rounded-md border px-3 py-2"
                                    >
                                        <span className="text-sm">
                                            {prereq.name}
                                        </span>
                                        {onRemovePrerequisite && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-red-500"
                                                onClick={() =>
                                                    onRemovePrerequisite(
                                                        prereq.ulid,
                                                    )
                                                }
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer actions */}
            <div className="space-y-2 border-t p-4">
                <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                    disabled={isSaving}
                    onClick={onSave}
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={onDuplicate}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                    </Button>
                    <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={onDelete}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
}

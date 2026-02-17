import { Plus, GitBranch, Hand, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { cn } from '@/lib/utils';
import { useSkillStore } from '@/stores/use-skill-store';
import { Kbd } from '../ui/kbd';
import { Toggle } from '../ui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export type ToolMode = 'select' | 'connect' | 'pan';

interface CanvasToolbarProps {
    mode: ToolMode;
    onModeChange: (mode: ToolMode) => void;
    onAddNode: () => void;
}

export function CanvasToolbar({
    mode,
    onModeChange,
    onAddNode,
}: CanvasToolbarProps) {
    const undo = useSkillStore((state) => state.undo);
    const redo = useSkillStore((state) => state.redo);
    const canUndo = useSkillStore((state) => state.canUndo());
    const canRedo = useSkillStore((state) => state.canRedo());

    useKeyboardShortcut(
        ['ctrl+z', 'meta+z'],
        () => {
            if (!canUndo) return;
            undo();
        },
        { preventDefault: true },
    );

    useKeyboardShortcut(
        ['ctrl+y', 'meta+y'],
        () => {
            if (!canRedo) return;
            redo();
        },
        { preventDefault: true },
    );

    return (
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:bg-slate-950">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="default"
                        size="icon"
                        className="primary-toggle h-9 w-9"
                        onClick={onAddNode}
                        title="Add Node"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Add Node</p> <Kbd>Ctrl + E</Kbd>
                </TooltipContent>
            </Tooltip>

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        variant="default"
                        size="sm"
                        className={cn('primary-toggle h-9 w-9')}
                        onPressedChange={() =>
                            mode.trim().toLowerCase() === 'connect'
                                ? onModeChange('select')
                                : onModeChange('connect')
                        }
                        pressed={mode === 'connect'}
                    >
                        <GitBranch className="h-4 w-4" />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Connect Mode</p> <Kbd>Ctrl + C</Kbd>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        variant="default"
                        size="sm"
                        className={cn('primary-toggle h-9 w-9')}
                        onPressedChange={() =>
                            mode.trim().toLowerCase() === 'pan'
                                ? onModeChange('select')
                                : onModeChange('pan')
                        }
                        pressed={mode === 'pan'}
                        title="Pan Mode"
                    >
                        <Hand className="h-4 w-4" />
                    </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Pan Mode</p> <Kbd>Ctrl + H</Kbd>
                </TooltipContent>
            </Tooltip>

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        disabled={!canUndo}
                        onClick={undo}
                        title="Undo"
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Undo</p> <Kbd>Ctrl</Kbd> + <Kbd>Z</Kbd>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        disabled={!canRedo}
                        onClick={redo}
                        title="Redo"
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Redo</p> <Kbd>Ctrl</Kbd> + <Kbd>Y</Kbd>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

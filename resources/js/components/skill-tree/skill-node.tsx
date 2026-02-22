import { Tooltip } from '@radix-ui/react-tooltip';
import { Flag, Blocks, GitBranch, Puzzle } from 'lucide-react';
import { memo, useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { TooltipContent, TooltipTrigger } from '../ui/tooltip';
import type { Value as EditorValue } from 'platejs';

export interface SkillNodeData {
    ulid: string;
    name: string;
    description: string | null;
    category: 'theory' | 'practice' | 'review';
    content: EditorValue | null;
    position_x: number;
    position_y: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    xp_reward: number;
    remedial_material_url: string;
    prerequisites: Array<{
        ulid: string;
        name: string;
        position_x: number;
        position_y: number;
    }>;
}

interface SkillNodeProps {
    skill: SkillNodeData;
    isSelected: boolean;
    isConnectSource: boolean;
    onClick: () => void;
    onDrag: (x: number, y: number) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    disabled?: boolean;
    zoom?: number;
}

const difficultyColors = {
    beginner: 'border-emerald-400 bg-emerald-50',
    intermediate: 'border-blue-400 bg-blue-50',
    advanced: 'border-purple-400 bg-purple-50',
};

const difficultyIcons = {
    beginner: Flag,
    intermediate: Blocks,
    advanced: GitBranch,
};

export const SkillNode = memo(function SkillNode({
    skill,
    isSelected,
    isConnectSource,
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    disabled,
    zoom = 1,
}: SkillNodeProps) {
    const nodeRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const hasDraggedRef = useRef(false);

    const Icon = difficultyIcons[skill.difficulty] || Puzzle;

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            // Reset state here to prevent stale drag state blocking clicks on unselected/disabled nodes
            hasDraggedRef.current = false;

            if (disabled || !isSelected) return;
            e.preventDefault();
            e.stopPropagation();

            // Capture pointer to receive all pointer events until release
            (e.target as HTMLElement).setPointerCapture(e.pointerId);

            // Calculate offset from the node center to pointer position, accounting for zoom
            dragOffsetRef.current = {
                x: e.clientX / zoom - skill.position_x,
                y: e.clientY / zoom - skill.position_y,
            };
            setIsDragging(true);
            if (onDragStart) {
                onDragStart();
            }
        },
        [
            disabled,
            skill.position_x,
            skill.position_y,
            zoom,
            isSelected,
            onDragStart,
        ],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            hasDraggedRef.current = true;
            const newX = e.clientX / zoom - dragOffsetRef.current.x;
            const newY = e.clientY / zoom - dragOffsetRef.current.y;
            onDrag(newX, newY);
        },
        [isDragging, zoom, onDrag],
    );

    const handlePointerUp = useCallback(
        (e: React.PointerEvent) => {
            if (!isDragging) return;
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            setIsDragging(false);
            if (hasDraggedRef.current && onDragEnd) {
                onDragEnd();
            }
        },
        [isDragging, onDragEnd],
    );

    const handleClick = useCallback(() => {
        // Only trigger click if we haven't dragged
        if (!hasDraggedRef.current) {
            onClick();
        }
    }, [onClick]);

    return (
        <div
            ref={nodeRef}
            className="absolute select-none"
            style={{
                position: 'absolute',
                left: skill.position_x,
                top: skill.position_y,
                transform: 'translate(-50%, -50%)',
                willChange: isDragging ? 'transform' : 'auto',
                backfaceVisibility: 'hidden',
                zIndex: isDragging ? 100 : isSelected ? 50 : 1,
            }}
        >
            {/* Node circle */}
            <div
                className={cn(
                    'flex h-20 w-20 cursor-grab touch-none items-center justify-center rounded-full border-4 shadow-sm transition-all',
                    difficultyColors[skill.difficulty],
                    isSelected && 'ring-4 ring-emerald-400 ring-offset-2',
                    isConnectSource && 'ring-4 ring-blue-400 ring-offset-2',
                    isDragging && 'scale-105 cursor-grabbing shadow-lg',
                    disabled && 'cursor-default',
                )}
                onClick={handleClick}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                <Icon className="h-8 w-8 text-gray-600" />
            </div>

            {/* Label */}
            <div className="mt-2 text-center">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span
                            className={cn(
                                'inline-block max-w-20 truncate rounded px-2 py-0.5 text-sm font-medium text-foreground',
                                isSelected && 'bg-emerald-500 text-white',
                                // !isSelected && 'text-gray-700',
                            )}
                        >
                            {skill.name}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="font-medium">
                        {skill.name}
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
});

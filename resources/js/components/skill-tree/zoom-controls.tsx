import { Plus, Minus, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Kbd } from '../ui/kbd';

interface ZoomControlsProps {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
}

export function ZoomControls({
    zoom,
    onZoomIn,
    onZoomOut,
    onReset,
}: ZoomControlsProps) {
    useKeyboardShortcut(
        ['ctrl+=', 'meta+='],
        () => {
            onZoomIn();
        },
        { preventDefault: true },
    );
    useKeyboardShortcut(
        ['ctrl+-', 'meta+-'],
        () => {
            onZoomOut();
        },
        { preventDefault: true },
    );
    useKeyboardShortcut(['ctrl+0', 'meta+0'], () => {
        onReset();
    });
    return (
        <div className="relative flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-background p-1 shadow-sm transition-all duration-200 dark:bg-slate-950 [&_button]:hover:bg-primary">
            <span className="absolute bottom-0 left-11 z-10 flex h-fit w-10 max-w-10 rounded-sm bg-black/25 px-1 text-center text-sm hover:bg-background/70">
                🔍︎ {zoom.toFixed(2)}
            </span>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onZoomIn}
                        title="Zoom In"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Zoom In</p> <Kbd>Ctrl</Kbd> + <Kbd>+ </Kbd>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onZoomOut}
                        title="Zoom Out"
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Zoom Out</p> <Kbd>Ctrl</Kbd> + <Kbd>- </Kbd>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onReset}
                        title="Reset View"
                    >
                        <Maximize className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Reset View</p> <Kbd>Ctrl</Kbd> + <Kbd>0 </Kbd>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

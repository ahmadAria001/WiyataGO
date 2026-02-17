import { GripVertical } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
    NodeSidebarContent,
    type NodeSidebarContentProps,
} from './node-sidebar-content';

/* eslint-disable-next-line @typescript-eslint/no-empty-object-type */
interface NodeSidebarProps extends NodeSidebarContentProps {}

const MIN_WIDTH = 300;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 320;

export function NodeSidebar(props: NodeSidebarProps) {
    const isMobile = useIsMobile();
    const [width, setWidth] = useState(DEFAULT_WIDTH);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const { skill, onClose } = props; // Extract for checks

    // Handle resizing
    const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (mouseMoveEvent: MouseEvent) => {
            if (isResizing) {
                // Calculate new width: Window width - mouse X position
                // Since sidebar is on the right, width is the distance from right edge
                const newWidth =
                    document.body.clientWidth - mouseMoveEvent.clientX;

                if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
                    setWidth(newWidth);
                }
            }
        },
        [isResizing],
    );

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    if (!skill) return null;

    if (isMobile) {
        return (
            <Sheet
                open={!!skill}
                onOpenChange={(open) => !open && onClose()}
                modal={false}
            >
                <SheetContent
                    showCloseButton={false}
                    side="bottom"
                    className="h-[50vh] border-t p-0 shadow-none sm:max-w-none"
                    aria-describedby="node-properties-description"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <SheetTitle className="sr-only">Node Properties</SheetTitle>
                    <SheetDescription
                        id="node-properties-description"
                        className="sr-only"
                    >
                        Edit the properties of the selected skill node.
                    </SheetDescription>
                    <NodeSidebarContent {...props} />
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div
            ref={sidebarRef}
            className="relative flex h-full flex-col border-l bg-background"
            style={{ width: width }}
        >
            {/* Resize Handle */}
            <div
                className={cn(
                    'absolute top-0 left-0 z-50 flex h-full w-4 -translate-x-1/2 cursor-col-resize touch-none items-center justify-center opacity-0 transition-opacity hover:opacity-100',
                    isResizing && 'opacity-100',
                )}
                onMouseDown={startResizing}
            >
                <div className="h-8 w-1 rounded-full bg-border">
                    <GripVertical className="h-4 w-4 -translate-x-1.5 text-muted-foreground" />
                </div>
            </div>

            <NodeSidebarContent {...props} />
        </div>
    );
}

import { AlertCircle, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { CanvasToolbar, type ToolMode } from './canvas-toolbar';
import { ConnectionLayer } from './connection-layer';
import { SkillNode, type SkillNodeData } from './skill-node';
import { ZoomControls } from './zoom-controls';

interface SkillTreeCanvasProps {
    skills: SkillNodeData[];
    selectedSkillId: string | null;
    onSelectSkill: (skill: SkillNodeData | null) => void;
    onUpdatePosition: (skillId: string, x: number, y: number) => void;
    onSavePositions: () => void;
    onAddPrerequisite: (skillId: string, prerequisiteId: string) => void;
    onRemovePrerequisite: (skillId: string, prerequisiteId: string) => void;
    onAddSkill: () => void;
    onDragStart?: () => void;
    connectionError?: string | null;
    onClearConnectionError?: () => void;
}

export function SkillTreeCanvas({
    skills,
    selectedSkillId,
    onSelectSkill,
    onUpdatePosition,
    onSavePositions,
    onAddPrerequisite,
    onRemovePrerequisite,
    onAddSkill,
    onDragStart,
    connectionError,
    onClearConnectionError,
}: SkillTreeCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [toolMode, setToolMode] = useState<ToolMode>('select');
    const [isPanning, setIsPanning] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [connectSource, setConnectSource] = useState<string | null>(null);

    const handleZoomIn = useCallback(() => {
        setZoom((z) => Math.min(z + 0.1, 2));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom((z) => Math.max(z - 0.1, 0.5));
    }, []);

    const handleResetView = useCallback(() => {
        setZoom(1);
        setPanX(0);
        setPanY(0);
    }, []);

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (toolMode === 'pan' || e.button === 1) {
                e.preventDefault();
                setIsPanning(true);
                setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
            } else if (toolMode === 'select') {
                // Clicking on empty canvas deselects
                if (e.target === containerRef.current) {
                    onSelectSkill(null);
                }
            }
        },
        [toolMode, panX, panY, onSelectSkill],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (isPanning) {
                e.preventDefault();
                setPanX(e.clientX - dragStart.x);
                setPanY(e.clientY - dragStart.y);
            }
        },
        [isPanning, dragStart],
    );

    const handlePointerUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    const handleNodeClick = useCallback(
        (skill: SkillNodeData) => {
            if (toolMode === 'connect') {
                if (connectSource === null) {
                    setConnectSource(skill.ulid);
                } else if (connectSource !== skill.ulid) {
                    onAddPrerequisite(skill.ulid, connectSource);
                    setConnectSource(null);
                }
            } else {
                onSelectSkill(skill);
            }
        },
        [toolMode, connectSource, onAddPrerequisite, onSelectSkill],
    );

    const handleNodeDrag = useCallback(
        (skillId: string, x: number, y: number) => {
            onUpdatePosition(skillId, Math.round(x), Math.round(y));
        },
        [onUpdatePosition],
    );

    const handleToolChange = useCallback((mode: ToolMode) => {
        setToolMode(mode);
        setConnectSource(null);
    }, []);

    // Keyboard shortcuts
    useKeyboardShortcut(['ctrl+c', 'meta+c'], () => {
        setToolMode((current) =>
            current === 'connect' ? 'select' : 'connect',
        );
        setConnectSource(null);
    });

    useKeyboardShortcut(['ctrl+h', 'meta+h'], () => {
        setToolMode((current) => (current === 'pan' ? 'select' : 'pan'));
    });

    useKeyboardShortcut(['ctrl+n', 'meta+n'], () => {
        onAddSkill();
    });

    return (
        <div className="relative h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
            {/* Grid background */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, var(--color-skill-tree-dots-color) 1px, transparent 1px)',
                    backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                    backgroundPosition: `${panX}px ${panY}px`,
                }}
            />

            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-10">
                <CanvasToolbar
                    mode={toolMode}
                    onModeChange={handleToolChange}
                    onAddNode={onAddSkill}
                />
            </div>

            {/* Connection error notification */}
            {connectionError && (
                <div className="absolute top-4 right-4 z-20 max-w-sm animate-in fade-in slide-in-from-right-2">
                    <Alert variant="destructive" className="pr-10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Connection Error</AlertTitle>
                        <AlertDescription>{connectionError}</AlertDescription>
                        {onClearConnectionError && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6"
                                onClick={onClearConnectionError}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </Alert>
                </div>
            )}

            {/* Zoom controls */}
            <div className="absolute bottom-4 left-4 z-10">
                <ZoomControls
                    zoom={zoom}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onReset={handleResetView}
                />
            </div>

            {/* Canvas container */}
            <div
                ref={containerRef}
                className="h-full w-full touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{ cursor: toolMode === 'pan' ? 'grab' : 'default' }}
            >
                {/* Transformed layer */}
                <div
                    className="relative h-full w-full"
                    style={{
                        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                        transformOrigin: '0 0',
                    }}
                >
                    {/* Connection lines */}
                    <ConnectionLayer
                        skills={skills}
                        connectSource={connectSource}
                    />

                    {/* Skill nodes */}
                    {skills.map((skill) => (
                        <SkillNode
                            key={skill.ulid}
                            skill={skill}
                            isSelected={skill.ulid === selectedSkillId}
                            //     (() => {
                            //     console.log(
                            //         skill.ulid,
                            //         selectedSkillId,
                            //         skill.ulid === selectedSkillId,
                            //     );
                            //     return skill.ulid === selectedSkillId;
                            // })()}
                            isConnectSource={skill.ulid === connectSource}
                            onClick={() => handleNodeClick(skill)}
                            onDrag={(x, y) => handleNodeDrag(skill.ulid, x, y)}
                            onDragStart={onDragStart} // Checkpoint before drag starts
                            onDragEnd={onSavePositions} // Save positions to server
                            disabled={
                                toolMode === 'pan' || toolMode === 'connect'
                            }
                            zoom={zoom}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

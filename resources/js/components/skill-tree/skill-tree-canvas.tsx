import { AlertCircle, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { usePinchZoom } from '@/hooks/use-pinch-zoom';
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

    // Pinch-to-Zoom
    const {
        handlePointerDown: handlePinchDown,
        handlePointerMove: handlePinchMove,
        handlePointerUp: handlePinchUp,
        isPinching,
    } = usePinchZoom({
        onZoom: (ratio, center) => {
            setZoom((prevZoom) => {
                const newZoom = Math.min(Math.max(prevZoom * ratio, 0.5), 2);

                // Adjust pan to zoom towards center
                // Formula: newPan = center - (center - oldPan) * (newZoom / oldZoom)
                // We need to account that panX/Y are transforms, not scroll offsets.
                // The center in client coordinates needs to be mapped to the canvas space.

                // Let's simplify:
                // We need to keep the point under the 'center' at the same screen position.
                // ScreenPoint = (CanvasPoint * Zoom) + Pan
                // CanvasPoint = (ScreenPoint - Pan) / Zoom

                // We want: ScreenPoint_New = ScreenPoint_Old
                // (CanvasPoint * NewZoom) + NewPan = (CanvasPoint * OldZoom) + OldPan
                // NewPan = OldPan + CanvasPoint * (OldZoom - NewZoom)
                // NewPan = OldPan + ((ScreenPoint - OldPan) / OldZoom) * (OldZoom - NewZoom)

                // Let's verify this math.
                // Center relative to container
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const centerX = center.x - rect.left;
                    const centerY = center.y - rect.top;

                    setPanX(
                        (prevPanX) =>
                            prevPanX +
                            ((centerX - prevPanX) / prevZoom) *
                                (prevZoom - newZoom),
                    );
                    setPanY(
                        (prevPanY) =>
                            prevPanY +
                            ((centerY - prevPanY) / prevZoom) *
                                (prevZoom - newZoom),
                    );
                }

                return newZoom;
            });
        },
        onPan: (dx, dy) => {
            setPanX((p) => p + dx);
            setPanY((p) => p + dy);
        },
    });

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            handlePinchDown(e);

            if (isPinching()) return;

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
        [toolMode, panX, panY, onSelectSkill, handlePinchDown, isPinching],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            handlePinchMove(e);

            if (isPinching()) return;

            if (isPanning) {
                e.preventDefault();
                setPanX(e.clientX - dragStart.x);
                setPanY(e.clientY - dragStart.y);
            }
        },
        [isPanning, dragStart, handlePinchMove, isPinching],
    );

    const handlePointerUp = useCallback(
        (e: React.PointerEvent) => {
            handlePinchUp(e);
            if (!isPinching()) {
                setIsPanning(false);
            }
        },
        [handlePinchUp, isPinching],
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

    useKeyboardShortcut(
        ['ctrl+e', 'meta+e'],
        () => {
            onAddSkill();
        },
        { preventDefault: true },
    );

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

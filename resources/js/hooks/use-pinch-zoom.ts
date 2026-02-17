import { useRef, useCallback } from 'react';

interface Point {
    x: number;
    y: number;
}

interface PinchZoomOptions {
    onZoom: (delta: number, center: Point) => void;
    onPan: (deltaX: number, deltaY: number) => void;
}

export function usePinchZoom({ onZoom, onPan }: PinchZoomOptions) {
    const activePointers = useRef<Map<number, Point>>(new Map());
    const prevDist = useRef<number | null>(null);
    const prevCenter = useRef<Point | null>(null);

    const getDistance = (p1: Point, p2: Point) => {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };

    const getCenter = (p1: Point, p2: Point): Point => {
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
        };
    };

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }, []);

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!activePointers.current.has(e.pointerId)) return;

            activePointers.current.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY,
            });

            if (activePointers.current.size === 2) {
                const points = Array.from(activePointers.current.values());
                const p1 = points[0];
                const p2 = points[1];

                const dist = getDistance(p1, p2);
                const center = getCenter(p1, p2);

                if (prevDist.current !== null && prevCenter.current !== null) {
                    // Calculate zoom delta
                    // If dist > prevDist, we are zooming in (scale > 1)
                    // If dist < prevDist, we are zooming out (scale < 1)
                    // Use a divisor to control sensitivity if needed, but ratio is standard
                    const zoomRatio = dist / prevDist.current;

                    // We dispatch the ratio difference, so 1.05 or 0.95
                    // But our onZoom expected a step like +0.1 or -0.1 in the current codebase?
                    // actually SkillTreeCanvas uses absolute zoom state.
                    // Let's look at how we want to interface.
                    // The standard way is passing the ratio (scaleFactor).

                    // However, to match existing zoom steps (0.1), we might want to convert ratio to a delta
                    // or just pass the ratio and let parent handle it.
                    // For pinch, smooth zooming (multiplying) is better than adding steps.
                    // Let's pass the raw ratio for now.

                    // Note: The prompt asked for "delta", but ratio is more appropriate for pinch.
                    // We'll adapt. If 1.1 -> delta is 0.1? No, let's pass ratio.
                    // Wait, existing ZoomControls use setZoom(z => z + 0.1).
                    // Pinching is continuous.
                    // Let's pass a specialized callback or reuse.

                    onZoom(zoomRatio, center);

                    // Calculate Pan (center move)
                    const deltaX = center.x - prevCenter.current.x;
                    const deltaY = center.y - prevCenter.current.y;
                    onPan(deltaX, deltaY);
                }

                prevDist.current = dist;
                prevCenter.current = center;
            }
        },
        [onZoom, onPan],
    );

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        activePointers.current.delete(e.pointerId);
        if (activePointers.current.size < 2) {
            prevDist.current = null;
            prevCenter.current = null;
        }
    }, []);

    const isPinching = useCallback(() => {
        return activePointers.current.size === 2;
    }, []);

    return {
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        isPinching,
    };
}

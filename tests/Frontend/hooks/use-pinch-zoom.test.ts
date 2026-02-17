import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePinchZoom } from '@/hooks/use-pinch-zoom';

describe('usePinchZoom', () => {
    it('initializes with isPinching false', () => {
        const { result } = renderHook(() =>
            usePinchZoom({ onZoom: vi.fn(), onPan: vi.fn() }),
        );
        expect(result.current.isPinching()).toBe(false);
    });

    it('detects pinch start with two pointers', () => {
        const { result } = renderHook(() =>
            usePinchZoom({ onZoom: vi.fn(), onPan: vi.fn() }),
        );

        act(() => {
            result.current.handlePointerDown({
                pointerId: 1,
                clientX: 0,
                clientY: 0,
            } as unknown as React.PointerEvent);
            result.current.handlePointerDown({
                pointerId: 2,
                clientX: 100,
                clientY: 100,
            } as unknown as React.PointerEvent);
        });

        // Need to move to trigger the "start" logic in handlePointerMove
        act(() => {
            result.current.handlePointerMove({
                pointerId: 2,
                clientX: 100,
                clientY: 100,
            } as unknown as React.PointerEvent);
        });

        expect(result.current.isPinching()).toBe(true);
    });

    it('calculates zoom and pan correctly', () => {
        const onZoom = vi.fn();
        const onPan = vi.fn();
        const { result } = renderHook(() => usePinchZoom({ onZoom, onPan }));

        // Start pinch
        act(() => {
            result.current.handlePointerDown({
                pointerId: 1,
                clientX: 100,
                clientY: 100,
            } as unknown as React.PointerEvent);
            result.current.handlePointerDown({
                pointerId: 2,
                clientX: 200,
                clientY: 100,
            } as unknown as React.PointerEvent);
        });

        // Initial move to set prevDist/Center
        act(() => {
            result.current.handlePointerMove({
                pointerId: 2,
                clientX: 200,
                clientY: 100,
            } as unknown as React.PointerEvent);
        });

        expect(result.current.isPinching()).toBe(true);
        expect(onZoom).not.toHaveBeenCalled();

        // Move pointers apart (Zoom In)
        // The hook processes events sequentially.

        // Event 1: P1 moves to 50,100. P2 is still at 200,100.
        // Dist: 150. Center: 125,100. PrevDist: 100. Ratio: 1.5.
        act(() => {
            result.current.handlePointerMove({
                pointerId: 1,
                clientX: 50,
                clientY: 100,
            } as unknown as React.PointerEvent);
        });

        expect(onZoom).toHaveBeenLastCalledWith(1.5, { x: 125, y: 100 });

        // Event 2: P2 moves to 250,100. P1 is at 50,100.
        // Dist: 200. Center: 150,100. PrevDist: 150. Ratio: 200/150 = 1.333...
        act(() => {
            result.current.handlePointerMove({
                pointerId: 2,
                clientX: 250,
                clientY: 100,
            } as unknown as React.PointerEvent);
        });

        expect(onZoom).toHaveBeenLastCalledWith(200 / 150, { x: 150, y: 100 });

        // Total zoom effect would be 1.5 * (200/150) = 2. Correct.

        // Move center (Pan)
        // Distance stays same (200)
        // Center moves to 160, 110 (+10, +10)
        act(() => {
            result.current.handlePointerMove({
                pointerId: 1,
                clientX: 60,
                clientY: 110,
            } as unknown as React.PointerEvent);
            result.current.handlePointerMove({
                pointerId: 2,
                clientX: 260,
                clientY: 110,
            } as unknown as React.PointerEvent);
        });

        expect(onPan).toHaveBeenLastCalledWith(5, 5);
    });

    it('ends pinch on pointer up', () => {
        const { result } = renderHook(() =>
            usePinchZoom({ onZoom: vi.fn(), onPan: vi.fn() }),
        );

        act(() => {
            result.current.handlePointerDown({
                pointerId: 1,
            } as unknown as React.PointerEvent);
            result.current.handlePointerDown({
                pointerId: 2,
            } as unknown as React.PointerEvent);
        });

        act(() => {
            result.current.handlePointerUp({
                pointerId: 1,
            } as unknown as React.PointerEvent);
        });

        expect(result.current.isPinching()).toBe(false);
    });
});

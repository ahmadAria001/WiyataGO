import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NodeSidebar } from '@/components/skill-tree/node-sidebar';
import { type SkillNodeData } from '@/components/skill-tree/skill-node';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock useIsMobile hook
vi.mock('@/hooks/use-mobile', () => ({
    useIsMobile: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock PointerEvents for Sheet
window.PointerEvent = MouseEvent as unknown as typeof PointerEvent;
Object.assign(window.navigator, {
    clipboard: {
        writeText: vi.fn(),
    },
});

window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

const mockSkill: SkillNodeData = {
    ulid: '01HR...',
    name: 'Test Skill',
    description: 'Test Description',
    difficulty: 'beginner',
    xp_reward: 100,
    remedial_material_url: '',
    position_x: 0,
    position_y: 0,
    prerequisites: [],
};

const defaultProps = {
    skill: mockSkill,
    onClose: vi.fn(),
    onUpdate: vi.fn(),
    onDuplicate: vi.fn(),
    onDelete: vi.fn(),
    onSave: vi.fn(),
};

describe('NodeSidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default to desktop
        vi.mocked(useIsMobile).mockReturnValue(false);
    });

    it('renders null when no skill is selected', () => {
        const { container } = render(
            <NodeSidebar {...defaultProps} skill={null} />,
        );
        expect(container.firstChild).toBeNull();
    });

    describe('Desktop View', () => {
        beforeEach(() => {
            vi.mocked(useIsMobile).mockReturnValue(false);
        });

        it('renders as a sidebar div', () => {
            render(<NodeSidebar {...defaultProps} />);
            // In desktop, "Node Properties" appears once
            expect(screen.getByText('Node Properties')).toBeInTheDocument();

            // Check for resize handle presence (it has absolute positioning)
            const sidebar = screen
                .getByText('Node Properties')
                .closest('.relative');
            expect(sidebar).toHaveStyle({ width: '320px' });
        });

        it('handles resizing correctly', () => {
            render(<NodeSidebar {...defaultProps} />);

            const sidebar = screen
                .getByText('Node Properties')
                .closest('.relative') as HTMLElement;
            // The handle is the first child (absolute div)
            const handle = sidebar.firstElementChild as HTMLElement;

            // Start resizing
            fireEvent.mouseDown(handle, { clientX: 0 });

            // Let's set a clientWidth
            Object.defineProperty(document.body, 'clientWidth', {
                value: 1000,
                configurable: true,
            });

            // Move mouse to x=600. newWidth = 1000 - 600 = 400.
            act(() => {
                const moveEvent = new MouseEvent('mousemove', {
                    clientX: 600,
                    bubbles: true,
                });
                window.dispatchEvent(moveEvent);
            });

            expect(sidebar).toHaveStyle({ width: '400px' });

            // Stop resizing
            act(() => {
                const upEvent = new MouseEvent('mouseup', { bubbles: true });
                window.dispatchEvent(upEvent);
            });

            // Move mouse again, should not resize
            act(() => {
                const moveEvent = new MouseEvent('mousemove', {
                    clientX: 500,
                    bubbles: true,
                });
                window.dispatchEvent(moveEvent);
            });
            expect(sidebar).toHaveStyle({ width: '400px' });
        });
    });

    describe('Mobile View', () => {
        beforeEach(() => {
            vi.mocked(useIsMobile).mockReturnValue(true);
        });

        it('renders using Sheet component', () => {
            render(<NodeSidebar {...defaultProps} />);
            // Sheet renders as a dialog
            const dialog = screen.getByRole('dialog');
            expect(dialog).toBeInTheDocument();

            // Check that content is inside the dialog
            // We find all elements with text "Node Properties" and ensure one is inside the dialog
            const titles = screen.getAllByText('Node Properties');
            const paramsTitle = titles.find(
                (el) => dialog.contains(el) && el.tagName === 'H2',
            );
            expect(paramsTitle).toBeInTheDocument();
        });
    });
});

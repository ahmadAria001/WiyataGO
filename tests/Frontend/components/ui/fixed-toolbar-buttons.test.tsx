// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { useEditorReadOnly } from 'platejs/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

// Shared state for the mock Collapsible — hoisted so mocks can reference it
const { stubButton, collapsibleState } = vi.hoisted(() => ({
    stubButton: (name: string) => () =>
        React.createElement('button', { 'data-testid': name }, name),
    collapsibleState: { isOpen: false, listeners: [] as Array<() => void> },
}));

// Mock platejs hooks
vi.mock('platejs/react', () => ({
    useEditorReadOnly: vi.fn(() => false),
}));

// Mock Collapsible with shared mutable state
vi.mock('@/components/ui/collapsible', () => ({
    Collapsible: ({ children }: { children: React.ReactNode }) => {
        // Reset state on each render of the root
        collapsibleState.isOpen = false;
        return React.createElement(
            'div',
            { 'data-testid': 'collapsible' },
            children,
        );
    },
    CollapsibleTrigger: ({
        children,
    }: {
        children: React.ReactNode;
        asChild?: boolean;
    }) => {
        const handleClick = () => {
            collapsibleState.isOpen = !collapsibleState.isOpen;
            // Notify listeners to re-render
            collapsibleState.listeners.forEach((fn) => fn());
        };
        return React.createElement(
            'button',
            { 'data-testid': 'collapsible-trigger', onClick: handleClick },
            children,
        );
    },
    CollapsibleContent: ({
        children,
        className,
    }: {
        children: React.ReactNode;
        className?: string;
    }) => {
        const [, forceRender] = React.useState(0);

        React.useLayoutEffect(() => {
            const listener = () => forceRender((c) => c + 1);
            collapsibleState.listeners.push(listener);
            return () => {
                collapsibleState.listeners = collapsibleState.listeners.filter(
                    (fn) => fn !== listener,
                );
            };
        }, []);

        if (!collapsibleState.isOpen) return null;
        return React.createElement(
            'div',
            { 'data-testid': 'collapsible-content', className },
            children,
        );
    },
}));

vi.mock('@/components/ui/history-toolbar-button', () => ({
    UndoToolbarButton: stubButton('undo'),
    RedoToolbarButton: stubButton('redo'),
}));

vi.mock('@/components/ui/import-toolbar-button', () => ({
    ImportToolbarButton: stubButton('import'),
}));

vi.mock('@/components/ui/mode-toolbar-button', () => ({
    ModeToolbarButton: stubButton('mode'),
}));

vi.mock('@/components/ui/insert-toolbar-button', () => ({
    InsertToolbarButton: stubButton('insert'),
}));

vi.mock('@/components/ui/turn-into-toolbar-button', () => ({
    TurnIntoToolbarButton: stubButton('turn-into'),
}));

vi.mock('@/components/ui/font-size-toolbar-button', () => ({
    FontSizeToolbarButton: stubButton('font-size'),
}));

vi.mock('@/components/ui/mark-toolbar-button', () => ({
    MarkToolbarButton: ({
        nodeType,
        children,
    }: {
        nodeType: string;
        children: React.ReactNode;
        tooltip?: string;
    }) =>
        React.createElement(
            'button',
            { 'data-testid': `mark-${nodeType}` },
            children,
        ),
}));

vi.mock('@/components/ui/font-color-toolbar-button', () => ({
    FontColorToolbarButton: ({
        nodeType,
        children,
    }: {
        nodeType: string;
        children: React.ReactNode;
        tooltip?: string;
    }) =>
        React.createElement(
            'button',
            { 'data-testid': `font-color-${nodeType}` },
            children,
        ),
}));

vi.mock('@/components/ui/align-toolbar-button', () => ({
    AlignToolbarButton: stubButton('align'),
}));

vi.mock('@/components/ui/list-toolbar-button', () => ({
    NumberedListToolbarButton: stubButton('numbered-list'),
    BulletedListToolbarButton: stubButton('bulleted-list'),
    TodoListToolbarButton: stubButton('todo-list'),
}));

vi.mock('@/components/ui/toggle-toolbar-button', () => ({
    ToggleToolbarButton: stubButton('toggle'),
}));

vi.mock('@/components/ui/link-toolbar-button', () => ({
    LinkToolbarButton: stubButton('link'),
}));

vi.mock('@/components/ui/table-toolbar-button', () => ({
    TableToolbarButton: stubButton('table'),
}));

vi.mock('@/components/ui/emoji-toolbar-button', () => ({
    EmojiToolbarButton: stubButton('emoji'),
}));

vi.mock('@/components/ui/media-toolbar-button', () => ({
    MediaToolbarButton: ({ nodeType }: { nodeType: string }) =>
        React.createElement(
            'button',
            { 'data-testid': `media-${nodeType}` },
            nodeType,
        ),
}));

vi.mock('@/components/ui/line-height-toolbar-button', () => ({
    LineHeightToolbarButton: stubButton('line-height'),
}));

vi.mock('@/components/ui/indent-toolbar-button', () => ({
    IndentToolbarButton: stubButton('indent'),
    OutdentToolbarButton: stubButton('outdent'),
}));

vi.mock('@/components/ui/more-toolbar-button', () => ({
    MoreToolbarButton: stubButton('more'),
}));

vi.mock('@/components/ui/comment-toolbar-button', () => ({
    CommentToolbarButton: stubButton('comment'),
}));

vi.mock('lucide-react', () => ({
    BaselineIcon: stubButton('icon-baseline'),
    BoldIcon: stubButton('icon-bold'),
    ChevronDownIcon: stubButton('icon-chevron-down'),
    Code2Icon: stubButton('icon-code'),
    HighlighterIcon: stubButton('icon-highlighter'),
    ItalicIcon: stubButton('icon-italic'),
    PaintBucketIcon: stubButton('icon-paint'),
    StrikethroughIcon: stubButton('icon-strikethrough'),
    UnderlineIcon: stubButton('icon-underline'),
}));

vi.mock('platejs', () => ({
    KEYS: {
        bold: 'bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'strikethrough',
        code: 'code',
        color: 'color',
        backgroundColor: 'backgroundColor',
        highlight: 'highlight',
        img: 'img',
        video: 'video',
        audio: 'audio',
        file: 'file',
    },
}));

vi.mock('@/components/ui/toolbar', () => ({
    ToolbarGroup: ({
        children,
        className,
    }: {
        children: React.ReactNode;
        className?: string;
    }) =>
        React.createElement(
            'div',
            { 'data-testid': 'toolbar-group', className },
            children,
        ),
    ToolbarButton: ({
        children,
        ...rest
    }: {
        children: React.ReactNode;
        tooltip?: string;
        [key: string]: unknown;
    }) => React.createElement('button', rest, children),
}));

// Import AFTER mocks
import { FixedToolbarButtons } from '@/components/ui/fixed-toolbar-buttons';

describe('FixedToolbarButtons', () => {
    it('renders without crashing', () => {
        render(<FixedToolbarButtons />);
    });

    it('always renders undo, redo, import and mode buttons', () => {
        render(<FixedToolbarButtons />);

        expect(screen.getByTestId('undo')).toBeInTheDocument();
        expect(screen.getByTestId('redo')).toBeInTheDocument();
        expect(screen.getByTestId('import')).toBeInTheDocument();
        expect(screen.getByTestId('mode')).toBeInTheDocument();
    });

    it('renders a collapsible trigger button', () => {
        render(<FixedToolbarButtons />);
        expect(screen.getByTestId('collapsible-trigger')).toBeInTheDocument();
    });

    it('does not show secondary buttons when collapsible is closed', () => {
        render(<FixedToolbarButtons />);

        expect(screen.queryByTestId('insert')).not.toBeInTheDocument();
        expect(screen.queryByTestId('mark-bold')).not.toBeInTheDocument();
        expect(screen.queryByTestId('align')).not.toBeInTheDocument();
        expect(screen.queryByTestId('link')).not.toBeInTheDocument();
    });

    it('shows secondary buttons after clicking the toggle', () => {
        render(<FixedToolbarButtons />);

        fireEvent.click(screen.getByTestId('collapsible-trigger'));

        expect(screen.getByTestId('insert')).toBeInTheDocument();
        expect(screen.getByTestId('mark-bold')).toBeInTheDocument();
        expect(screen.getByTestId('align')).toBeInTheDocument();
        expect(screen.getByTestId('link')).toBeInTheDocument();
        expect(screen.getByTestId('more')).toBeInTheDocument();
        expect(screen.getByTestId('mark-highlight')).toBeInTheDocument();
    });

    it('hides secondary buttons after toggling closed again', () => {
        render(<FixedToolbarButtons />);

        const trigger = screen.getByTestId('collapsible-trigger');

        // Open
        fireEvent.click(trigger);
        expect(screen.getByTestId('insert')).toBeInTheDocument();

        // Close
        fireEvent.click(trigger);
        expect(screen.queryByTestId('insert')).not.toBeInTheDocument();
    });

    it('hides editor buttons in readOnly mode but keeps mode button', () => {
        vi.mocked(useEditorReadOnly).mockReturnValue(true);

        render(<FixedToolbarButtons />);

        expect(screen.queryByTestId('undo')).not.toBeInTheDocument();
        expect(screen.queryByTestId('redo')).not.toBeInTheDocument();
        expect(screen.queryByTestId('import')).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('collapsible-trigger'),
        ).not.toBeInTheDocument();

        expect(screen.getByTestId('mode')).toBeInTheDocument();

        vi.mocked(useEditorReadOnly).mockReturnValue(false);
    });
});

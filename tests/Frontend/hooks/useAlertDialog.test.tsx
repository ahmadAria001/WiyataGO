// @vitest-environment jsdom
import {
    render,
    screen,
    act,
    renderHook,
    fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AlertDialogProvider, useAlertDialog } from '@/hooks/use-alert-dialog';
import React from 'react';

// Mock the UI components to simplify DOM structure for testing
// We only need to check if the correct props are passed and events triggered
vi.mock('@/components/ui/alert-dialog', () => ({
    AlertDialog: ({
        open,
        children,
    }: {
        open: boolean;
        children: React.ReactNode;
    }) => (open ? <div role="dialog">{children}</div> : null),
    AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    // eslint-disable-next-line
    AlertDialogMedia: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="alert-media">{children}</div>
    ),
    AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
        <h1>{children}</h1>
    ),
    AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
        <p>{children}</p>
    ),
    AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    AlertDialogAction: ({
        onClick,
        children,
    }: {
        onClick: () => void;
        children: React.ReactNode;
    }) => <button onClick={onClick}>{children}</button>,
    AlertDialogCancel: ({
        onClick,
        children,
    }: {
        onClick: () => void;
        children: React.ReactNode;
    }) => <button onClick={onClick}>{children}</button>,
}));

// Mock icons
vi.mock('lucide-react', () => ({
    Trash2Icon: () => <span data-testid="trash-icon" />,
    AlertCircleIcon: () => <span data-testid="alert-icon" />,
}));

const TestComponent = ({
    onConfirm,
}: {
    onConfirm: (result: boolean) => void;
}) => {
    const { confirm, alert } = useAlertDialog();

    return (
        <div>
            <button
                onClick={async () => {
                    const result = await confirm({
                        title: 'Confirm Me',
                        description: 'Are you sure?',
                    });
                    onConfirm(result);
                }}
            >
                Trigger Confirm
            </button>
            <button
                onClick={async () => {
                    await alert({
                        title: 'Alert Me',
                        description: 'Just a notice',
                    });
                    onConfirm(true); // Signal completion
                }}
            >
                Trigger Alert
            </button>
        </div>
    );
};

describe('useAlertDialog', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('throws error when used outside AlertDialogProvider', () => {
        // Suppress console.error for this specific test as React logs the error
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        expect(() => {
            renderHook(() => useAlertDialog());
        }).toThrow('useAlertDialog must be used within AlertDialogProvider');

        consoleSpy.mockRestore();
    });

    it('renders provider without crashing', () => {
        render(
            <AlertDialogProvider>
                <div>Child Content</div>
            </AlertDialogProvider>,
        );
        expect(screen.getByText('Child Content')).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('resolves confirm promise with true when confirmed', async () => {
        const onConfirm = vi.fn();

        render(
            <AlertDialogProvider>
                <TestComponent onConfirm={onConfirm} />
            </AlertDialogProvider>,
        );

        // 1. Trigger Confirm
        fireEvent.click(screen.getByText('Trigger Confirm'));

        // 2. Assert Dialog opens
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Confirm Me')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();

        // 3. Confirm
        fireEvent.click(screen.getByText('Confirm')); // Default text

        // 4. Assert Promise resolves true and dialog closes
        await vi.waitFor(() => {
            expect(onConfirm).toHaveBeenCalledWith(true);
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('resolves confirm promise with false when canceled', async () => {
        const onConfirm = vi.fn();

        render(
            <AlertDialogProvider>
                <TestComponent onConfirm={onConfirm} />
            </AlertDialogProvider>,
        );

        // 1. Trigger Confirm
        fireEvent.click(screen.getByText('Trigger Confirm'));

        // 2. Cancel
        fireEvent.click(screen.getByText('Cancel')); // Default text

        // 3. Assert Promise resolves false and dialog closes
        await vi.waitFor(() => {
            expect(onConfirm).toHaveBeenCalledWith(false);
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('resolves alert promise when acknowledged', async () => {
        const onAlert = vi.fn();

        render(
            <AlertDialogProvider>
                <TestComponent onConfirm={onAlert} />
            </AlertDialogProvider>,
        );

        // 1. Trigger Alert
        fireEvent.click(screen.getByText('Trigger Alert'));

        // 2. Assert Dialog opens
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Alert Me')).toBeInTheDocument();
        expect(screen.queryByText('Cancel')).not.toBeInTheDocument();

        // 3. Acknowledge (OK)
        fireEvent.click(screen.getByText('OK')); // Default text

        // 4. Assert Promise resolves
        await vi.waitFor(() => {
            expect(onAlert).toHaveBeenCalledWith(true);
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });
});

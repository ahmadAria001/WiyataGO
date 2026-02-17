import React, {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2Icon, AlertCircleIcon } from 'lucide-react';

/**
 * Options for confirm dialog
 */
export interface ConfirmDialogOptions {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'default';
    icon?: ReactNode;
}

/**
 * Options for alert dialog
 */
export interface AlertDialogOptions {
    title: string;
    description: string;
    okText?: string;
    variant?: 'default' | 'destructive';
    icon?: ReactNode;
}

/**
 * Internal dialog state
 */
interface DialogState {
    isOpen: boolean;
    type: 'confirm' | 'alert';
    title: string;
    description: string;
    confirmText: string;
    cancelText?: string;
    variant: 'destructive' | 'default';
    icon?: ReactNode;
    resolve: (value: boolean) => void;
}

/**
 * Alert dialog context value
 */
interface AlertDialogContextValue {
    confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
    alert: (options: AlertDialogOptions) => Promise<void>;
}

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

/**
 * Alert dialog provider component
 *
 * Wraps the application to provide imperative alert dialog API.
 * Place at the root of your app:
 *
 * @example
 * ```tsx
 * <AlertDialogProvider>
 *   <App />
 * </AlertDialogProvider>
 * ```
 */
export function AlertDialogProvider({ children }: { children: ReactNode }) {
    const [dialogState, setDialogState] = useState<DialogState | null>(null);

    const confirm = useCallback((options: ConfirmDialogOptions) => {
        return new Promise<boolean>((resolve) => {
            setDialogState({
                isOpen: true,
                type: 'confirm',
                title: options.title,
                description: options.description,
                confirmText: options.confirmText ?? 'Confirm',
                cancelText: options.cancelText ?? 'Cancel',
                variant: options.variant ?? 'default',
                icon: options.icon,
                resolve,
            });
        });
    }, []);

    const alert = useCallback((options: AlertDialogOptions) => {
        return new Promise<void>((resolve) => {
            setDialogState({
                isOpen: true,
                type: 'alert',
                title: options.title,
                description: options.description,
                confirmText: options.okText ?? 'OK',
                variant: options.variant ?? 'default',
                icon: options.icon,
                resolve: () => {
                    resolve();
                    return true;
                },
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (dialogState) {
            dialogState.resolve(true);
            setDialogState(null);
        }
    }, [dialogState]);

    const handleCancel = useCallback(() => {
        if (dialogState) {
            dialogState.resolve(false);
            setDialogState(null);
        }
    }, [dialogState]);

    const value: AlertDialogContextValue = {
        confirm,
        alert,
    };

    // Default icon based on variant
    const defaultIcon =
        dialogState?.variant === 'destructive' ? (
            <Trash2Icon />
        ) : (
            <AlertCircleIcon />
        );

    return (
        <AlertDialogContext.Provider value={value}>
            {children}

            {/* Render dialog */}
            <AlertDialog open={dialogState?.isOpen ?? false}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogMedia
                            className={
                                dialogState?.variant === 'destructive'
                                    ? 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive'
                                    : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                            }
                        >
                            {dialogState?.icon ?? defaultIcon}
                        </AlertDialogMedia>
                        <AlertDialogTitle>
                            {dialogState?.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogState?.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        {dialogState?.type === 'confirm' && (
                            <AlertDialogCancel
                                variant="outline"
                                onClick={handleCancel}
                            >
                                {dialogState?.cancelText}
                            </AlertDialogCancel>
                        )}
                        <AlertDialogAction
                            variant={dialogState?.variant ?? 'default'}
                            onClick={handleConfirm}
                        >
                            {dialogState?.confirmText}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AlertDialogContext.Provider>
    );
}

/**
 * Hook to access imperative alert dialog API
 *
 * @throws Error if used outside AlertDialogProvider
 *
 * @example
 * ```tsx
 * const alertDialog = useAlertDialog();
 *
 * // Confirm dialog
 * const confirmed = await alertDialog.confirm({
 *   title: 'Delete skill?',
 *   description: 'This action cannot be undone',
 *   variant: 'destructive'
 * });
 *
 * if (confirmed) {
 *   deleteSkill();
 * }
 *
 * // Alert dialog
 * await alertDialog.alert({
 *   title: 'Success',
 *   description: 'Skill created successfully'
 * });
 * ```
 */
export function useAlertDialog(): AlertDialogContextValue {
    const context = useContext(AlertDialogContext);

    if (!context) {
        throw new Error(
            'useAlertDialog must be used within AlertDialogProvider',
        );
    }

    return context;
}

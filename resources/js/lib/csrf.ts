import { usePage } from '@inertiajs/react';

/**
 * Get CSRF token from Inertia shared props
 *
 * @returns CSRF token string
 */
export function useCSRFToken(): string {
    const { props } = usePage();
    return (props as { csrf?: string }).csrf || '';
}

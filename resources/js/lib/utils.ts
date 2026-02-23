import type { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import type { Value as EditorValue } from 'platejs';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export const toEditorValue = (content: EditorValue | null): EditorValue => {
    const fallback: EditorValue = [{ type: 'p', children: [{ text: '' }] }];

    if (!content) return fallback;
    if (!Array.isArray(content) || content.length === 0) return fallback;

    // Sanitize null text nodes
    return content.map((node) => ({
        ...node,
        children: (node.children as any[]).map((child) => ({
            ...child,
            text: child.text ?? '', // null → ''
        })),
    }));
};

'use client';

import { createPlatePlugin } from 'platejs/react';

import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { SidebarToolbarButtons } from '@/components/ui/sidebar-toolbar-buttons';

export const SidebarFixedToolbarKit = [
    createPlatePlugin({
        key: 'fixed-toolbar',
        render: {
            beforeEditable: () => (
                <FixedToolbar>
                    <SidebarToolbarButtons />
                </FixedToolbar>
            ),
        },
    }),
];

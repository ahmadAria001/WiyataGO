import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { AlertDialogProvider } from './hooks/use-alert-dialog';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <AlertDialogProvider>
                    <TooltipProvider delayDuration={0}>
                        <App {...props} />
                        <Toaster position="top-right" />
                    </TooltipProvider>
                </AlertDialogProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#1774f6ff',
    },
});

// This will set light / dark mode on load...
initializeTheme();

import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
            {/* Background Elements for Visual Interest */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-[-5%] top-[-10%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-5%] h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl" />
            </div>

            {/* Main Card Container */}
            <div className="w-full max-w-[420px] overflow-hidden rounded-xl border border-border bg-card shadow-lg transition-all">
                <div className="flex flex-col gap-6 p-8">
                    {/* Header / Logo Area */}
                    <div className="flex flex-col items-center gap-4 text-center">
                        <Link
                            href={home()}
                            className="relative mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-primary/20"
                        >
                            <AppLogoIcon className="size-10 fill-current text-primary" />
                        </Link>
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {title}
                            </h1>
                            <p className="text-sm font-normal text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>

                    {children}
                </div>

                {/* Gradient accent at bottom of card */}
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            </div>

            {/* Footer Info */}
            <div className="mt-8 text-center">
                <p className="text-xs text-muted-foreground">
                    © 2024 WiyataGo Learning Platform.
                </p>
            </div>
        </div>
    );
}

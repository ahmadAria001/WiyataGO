import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AuthLayout
            title="Selamat Datang Kembali"
            description="Lanjutkan petualangan mu!"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                onError={console.log}
                onSuccess={console.log}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        {status && (
                            <div className="rounded-lg bg-green-50 p-3 text-center text-sm font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                {status}
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="email-kamu@sekolah.ac.id"
                                className="h-11 rounded-lg"
                            />
                            <InputError message={errors.email} />
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-11 rounded-lg pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute top-0 right-0 flex h-full items-center justify-center rounded-r-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} />
                            {canResetPassword && (
                                <div className="flex justify-end">
                                    <TextLink
                                        href={request()}
                                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                                        tabIndex={5}
                                    >
                                        Lupa Password?
                                    </TextLink>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="h-11 w-full transform rounded-lg font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Masuk
                            </Button>
                        </div>

                        {/* Divider */}
                        {canRegister && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-border" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">
                                            Atau
                                        </span>
                                    </div>
                                </div>

                                {/* Footer Sign Up Link */}
                                <div className="text-center text-sm text-muted-foreground">
                                    Belum punya akun?{' '}
                                    <TextLink
                                        href={register()}
                                        className="font-bold text-foreground underline decoration-border underline-offset-4 transition-all hover:text-primary hover:decoration-primary"
                                        tabIndex={5}
                                    >
                                        Daftar sekarang
                                    </TextLink>
                                </div>
                            </>
                        )}
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}

import { useState } from 'react';
import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    return (
        <AuthLayout
            title="Buat Akun Baru"
            description="Mulai petualangan mu!"
        >
            <Head title="Daftar" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Name Field */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                name="name"
                                placeholder="Nama lengkap kamu"
                                className="h-11 rounded-lg"
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Email Field */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={2}
                                autoComplete="email"
                                name="email"
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
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="h-11 rounded-lg pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-0 flex h-full items-center justify-center rounded-r-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
                        </div>

                        {/* Password Confirmation Field */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password_confirmation">
                                Konfirmasi Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="••••••••"
                                    className="h-11 rounded-lg pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                    className="absolute right-0 top-0 flex h-full items-center justify-center rounded-r-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {showPasswordConfirmation ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="h-11 w-full transform rounded-lg font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                tabIndex={6}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Daftar
                            </Button>
                        </div>

                        {/* Divider */}
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

                        {/* Footer Login Link */}
                        <div className="text-center text-sm text-muted-foreground">
                            Sudah punya akun?{' '}
                            <TextLink
                                href={login()}
                                className="font-bold text-foreground underline decoration-border underline-offset-4 transition-all hover:text-primary hover:decoration-primary"
                                tabIndex={7}
                            >
                                Masuk
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}

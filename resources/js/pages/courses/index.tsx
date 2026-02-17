import { Head, Link } from '@inertiajs/react';
import {
    index,
    create,
    show,
} from '@/actions/App/Http/Controllers/CourseController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Course {
    ulid: string;
    name: string;
    description: string | null;
    created_at: number;
}

interface Props {
    courses: Course[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Courses',
        href: index().url,
    },
];

export default function CoursesIndex({ courses }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Courses" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Courses</h1>
                        <p className="text-muted-foreground">
                            Manage your courses and learning content
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create().url}>Create Course</Link>
                    </Button>
                </div>

                {courses.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-8">
                        <CardHeader className="text-center">
                            <CardTitle>No courses yet</CardTitle>
                            <CardDescription>
                                Create your first course to get started
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href={create().url}>Create Course</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card
                                key={course.ulid}
                                className="transition-shadow hover:shadow-md"
                            >
                                <CardHeader>
                                    <CardTitle className="line-clamp-1">
                                        {course.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {course.description || 'No description'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Link
                                            href={show({ course: course }).url}
                                        >
                                            View Course
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import {
    index,
    edit,
    destroy,
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
import { index as skillsIndex } from '@/actions/App/Http/Controllers/SkillController';
import { useAlertDialog } from '@/hooks/use-alert-dialog';

interface Skill {
    ulid: string;
    name: string;
    description: string | null;
}

interface Course {
    ulid: string;
    name: string;
    description: string | null;
    created_at: number;
    skills: Skill[];
}

interface Props {
    course: Course;
}

export default function CoursesShow({ course }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Courses',
            href: index().url,
        },
        {
            title: course.name,
            href: '#',
        },
    ];

    const { confirm } = useAlertDialog();

    const handleDelete = async () => {
        if (
            await confirm({
                title: 'Delete Course',
                description:
                    'Are you sure you want to delete this course? This action cannot be undone.',
                variant: 'destructive',
                confirmText: 'Delete',
            })
        ) {
            router.delete(destroy({ course: course.ulid }).url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={course.name} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{course.name}</h1>
                        <p className="text-muted-foreground">
                            {course.description || 'No description provided'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={edit({ course: course }).url}>
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                        <Button asChild>
                            <Link href={skillsIndex({ course: course }).url}>
                                Skills
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills</CardTitle>
                            <CardDescription>
                                {course.skills.length} skill
                                {course.skills.length !== 1 ? 's' : ''} in this
                                course
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {course.skills.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No skills added yet. Add skills to build
                                    your course content.
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {course.skills.map((skill) => (
                                        <li
                                            key={skill.ulid}
                                            className="rounded-md border p-3"
                                        >
                                            <p className="font-medium">
                                                {skill.name}
                                            </p>
                                            {skill.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {skill.description}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Course Stats</CardTitle>
                            <CardDescription>
                                Overview of course content
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm text-muted-foreground">
                                        Skills
                                    </dt>
                                    <dd className="text-2xl font-bold">
                                        {course.skills.length}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-muted-foreground">
                                        Created
                                    </dt>
                                    <dd className="text-sm">
                                        {new Date(
                                            course.created_at * 1000,
                                        ).toLocaleDateString()}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

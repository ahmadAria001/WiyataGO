import { Head, Link } from '@inertiajs/react';
import { GitBranch, Zap } from 'lucide-react';
import {
    index as coursesIndex,
    show as showCourse,
} from '@/actions/App/Http/Controllers/CourseController';
import {
    create,
    show,
    builder,
} from '@/actions/App/Http/Controllers/SkillController';
import { Badge } from '@/components/ui/badge';
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

interface Skill {
    ulid: string;
    name: string;
    description: string | null;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    xp_reward: number;
    prerequisites: Array<{ ulid: string; name: string }>;
}

interface Course {
    ulid: string;
    name: string;
}

interface Props {
    course: Course;
    skills: Skill[];
}

const difficultyColors = {
    beginner: 'bg-emerald-100 text-emerald-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-purple-100 text-purple-700',
};

export default function SkillsIndex({ course, skills }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: coursesIndex().url },
        { title: course.name, href: showCourse({ course: course }).url },
        { title: 'Skills', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${course.name} - Skills`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Skills</h1>
                        <p className="text-muted-foreground">
                            Manage skills for {course.name}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={builder({ course: course }).url}>
                                <GitBranch className="mr-2 h-4 w-4" />
                                Open Builder
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={create({ course: course }).url}>
                                Add Skill
                            </Link>
                        </Button>
                    </div>
                </div>

                {skills.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-8">
                        <CardHeader className="text-center">
                            <CardTitle>No skills yet</CardTitle>
                            <CardDescription>
                                Create your first skill or use the visual
                                builder
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href={builder({ course: course }).url}>
                                    <GitBranch className="mr-2 h-4 w-4" />
                                    Open Builder
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={create({ course: course }).url}>
                                    Add Skill
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {skills.map((skill) => (
                            <Card
                                key={skill.ulid}
                                className="transition-shadow hover:shadow-md"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="line-clamp-1">
                                            {skill.name}
                                        </CardTitle>
                                        <Badge
                                            className={
                                                difficultyColors[
                                                    skill.difficulty
                                                ]
                                            }
                                        >
                                            {skill.difficulty}
                                        </Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {skill.description || 'No description'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Zap className="h-4 w-4 text-yellow-500" />
                                            {skill.xp_reward} XP
                                        </div>
                                        {skill.prerequisites.length > 0 && (
                                            <span className="text-xs text-muted-foreground">
                                                {skill.prerequisites.length}{' '}
                                                prerequisite(s)
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="mt-4 w-full"
                                    >
                                        <Link
                                            href={
                                                show({
                                                    course: course,
                                                    skill: skill.ulid,
                                                }).url
                                            }
                                        >
                                            View Details
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

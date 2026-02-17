import { Head, Link } from '@inertiajs/react';
import { Zap, ArrowRight, GitBranch, X } from 'lucide-react';
import { useState } from 'react';
import {
    index as coursesIndex,
    show as showCourse,
} from '@/actions/App/Http/Controllers/CourseController';
import {
    index as skillsIndex,
    edit,
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

interface Prerequisite {
    ulid: string;
    name: string;
}

interface Dependent {
    ulid: string;
    name: string;
}

interface Skill {
    ulid: string;
    name: string;
    description: string | null;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    xp_reward: number;
    position_x: number;
    position_y: number;
    prerequisites: Prerequisite[];
    dependents: Dependent[];
}

interface Course {
    ulid: string;
    name: string;
}

interface Props {
    course: Course;
    skill: Skill;
}

const difficultyColors = {
    beginner: 'bg-emerald-100 text-emerald-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-purple-100 text-purple-700',
};

export default function ShowSkill({ course, skill }: Props) {
    const [prerequisites, setPrerequisites] = useState(skill.prerequisites);

    const handleRemovePrerequisite = (prerequisiteId: string) => {
        fetch(
            `/courses/${course.ulid}/skills/${skill.ulid}/prerequisites/${prerequisiteId}`,
            {
                method: 'DELETE',
                headers: {
                    'X-XSRF-TOKEN':
                        document.cookie
                            .split('; ')
                            .find((row) => row.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1]
                            ?.replace(/%3D/g, '=') || '',
                },
            },
        ).then((res) => {
            if (res.ok) {
                setPrerequisites((prev) =>
                    prev.filter((p) => p.ulid !== prerequisiteId),
                );
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: coursesIndex().url },
        { title: course.name, href: showCourse({ course: course.ulid }).url },
        { title: 'Skills', href: skillsIndex({ course: course.ulid }).url },
        { title: skill.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${skill.name} - ${course.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{skill.name}</h1>
                            <Badge
                                className={difficultyColors[skill.difficulty]}
                            >
                                {skill.difficulty}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            {skill.description || 'No description'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={builder({ course: course.ulid }).url}>
                                <GitBranch className="mr-2 h-4 w-4" />
                                Open Builder
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={
                                    edit({
                                        course: course.ulid,
                                        skill: skill.ulid,
                                    }).url
                                }
                            >
                                Edit Skill
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Skill Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    XP Reward
                                </span>
                                <div className="flex items-center gap-1">
                                    <Zap className="h-4 w-4 text-yellow-500" />
                                    <span className="font-medium">
                                        {skill.xp_reward}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Position
                                </span>
                                <span className="font-mono text-sm">
                                    ({skill.position_x}, {skill.position_y})
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prerequisites */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Prerequisites</CardTitle>
                            <CardDescription>
                                Skills required before learning this one
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {prerequisites.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No prerequisites
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {prerequisites.map((prereq) => (
                                        <li
                                            key={prereq.ulid}
                                            className="flex items-center gap-2"
                                        >
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <span className="flex-1">
                                                {prereq.name}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-red-500"
                                                onClick={() =>
                                                    handleRemovePrerequisite(
                                                        prereq.ulid,
                                                    )
                                                }
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dependents */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Unlocks</CardTitle>
                            <CardDescription>
                                Skills that require this one
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {skill.dependents.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No skills depend on this one
                                </p>
                            ) : (
                                <ul className="grid gap-2 md:grid-cols-3">
                                    {skill.dependents.map((dep) => (
                                        <li
                                            key={dep.ulid}
                                            className="flex items-center gap-2 rounded-md border p-2"
                                        >
                                            <span>{dep.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

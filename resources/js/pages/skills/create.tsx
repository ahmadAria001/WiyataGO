import { Head, Link, useForm } from '@inertiajs/react';
import {
    index as coursesIndex,
    show as showCourse,
} from '@/actions/App/Http/Controllers/CourseController';
import {
    index as skillsIndex,
    store,
} from '@/actions/App/Http/Controllers/SkillController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Course {
    ulid: string;
    name: string;
}

interface Props {
    course: Course;
}

export default function CreateSkill({ course }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        difficulty: 'beginner',
        xp_reward: 100,
        position_x: 200,
        position_y: 200,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: coursesIndex().url },
        { title: course.name, href: showCourse({ course: course.ulid }).url },
        { title: 'Skills', href: skillsIndex({ course: course.ulid }).url },
        { title: 'Create', href: '#' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store({ course: course.ulid }).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Create Skill - ${course.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Create Skill</h1>
                    <p className="text-muted-foreground">
                        Add a new skill to {course.name}
                    </p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Skill Details</CardTitle>
                        <CardDescription>
                            Enter the information for your new skill
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Enter skill name"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Enter skill description"
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Difficulty</Label>
                                    <Select
                                        value={data.difficulty}
                                        onValueChange={(value) =>
                                            setData('difficulty', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">
                                                Beginner
                                            </SelectItem>
                                            <SelectItem value="intermediate">
                                                Intermediate
                                            </SelectItem>
                                            <SelectItem value="advanced">
                                                Advanced
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.difficulty && (
                                        <p className="text-sm text-red-500">
                                            {errors.difficulty}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="xp_reward">XP Reward</Label>
                                    <Input
                                        id="xp_reward"
                                        type="number"
                                        value={data.xp_reward}
                                        onChange={(e) =>
                                            setData(
                                                'xp_reward',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    {errors.xp_reward && (
                                        <p className="text-sm text-red-500">
                                            {errors.xp_reward}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link
                                        href={
                                            skillsIndex({ course: course.ulid })
                                                .url
                                        }
                                    >
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Creating...'
                                        : 'Create Skill'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

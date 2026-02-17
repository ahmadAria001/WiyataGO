import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    index as coursesIndex,
    show as showCourse,
} from '@/actions/App/Http/Controllers/CourseController';
import {
    index as skillsIndex,
    update,
    destroy,
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
import { useAlertDialog } from '@/hooks/use-alert-dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Skill {
    ulid: string;
    name: string;
    description: string | null;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    xp_reward: number;
}

interface Course {
    ulid: string;
    name: string;
}

interface Props {
    course: Course;
    skill: Skill;
}

export default function EditSkill({ course, skill }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: skill.name,
        description: skill.description || '',
        difficulty: skill.difficulty,
        xp_reward: skill.xp_reward,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: coursesIndex().url },
        { title: course.name, href: showCourse({ course: course.ulid }).url },
        { title: 'Skills', href: skillsIndex({ course: course.ulid }).url },
        { title: skill.name, href: '#' },
        { title: 'Edit', href: '#' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update({ course: course.ulid, skill: skill.ulid }).url);
    };

    const { confirm } = useAlertDialog();

    const handleDelete = async () => {
        if (
            await confirm({
                title: 'Delete Skill',
                description: 'Are you sure you want to delete this skill?',
                variant: 'destructive',
                confirmText: 'Delete',
            })
        ) {
            router.delete(
                destroy({ course: course.ulid, skill: skill.ulid }).url,
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${skill.name} - ${course.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Edit Skill</h1>
                    <p className="text-muted-foreground">
                        Update skill details
                    </p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Skill Details</CardTitle>
                        <CardDescription>
                            Modify the skill information
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
                                            setData(
                                                'difficulty',
                                                value as Skill['difficulty'],
                                            )
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

                            <div className="flex justify-between pt-4">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDelete}
                                >
                                    Delete Skill
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <Link
                                            href={
                                                skillsIndex({
                                                    course: course.ulid,
                                                }).url
                                            }
                                        >
                                            Cancel
                                        </Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

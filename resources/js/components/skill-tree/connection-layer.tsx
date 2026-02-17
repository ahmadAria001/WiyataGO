import type { SkillNodeData } from './skill-node';

interface ConnectionLayerProps {
    skills: SkillNodeData[];
    connectSource: string | null;
}

export function ConnectionLayer({
    skills,
    connectSource,
}: ConnectionLayerProps) {
    // Create a map for quick lookup
    const skillMap = new Map(skills.map((s) => [s.ulid, s]));

    // Collect all connections
    const connections: Array<{
        from: { x: number; y: number };
        to: { x: number; y: number };
        isActive: boolean;
    }> = [];

    skills.forEach((skill) => {
        skill.prerequisites.forEach((prereq) => {
            const prereqSkill = skillMap.get(prereq.ulid);
            if (prereqSkill) {
                connections.push({
                    from: {
                        x: prereqSkill.position_x,
                        y: prereqSkill.position_y,
                    },
                    to: { x: skill.position_x, y: skill.position_y },
                    isActive:
                        skill.ulid === connectSource ||
                        prereq.ulid === connectSource,
                });
            }
        });
    });

    // Calculate intersection point on the target node's circumference
    const getEdgePoint = (
        from: { x: number; y: number },
        to: { x: number; y: number },
        radius: number = 55, // Node radius (40) + arrowhead length (~10) + padding (5)
    ) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);

        return {
            x: to.x - Math.cos(angle) * radius,
            y: to.y - Math.sin(angle) * radius - 20,
        };
    };

    // Calculate straight path with edge detection
    const getPath = (
        from: { x: number; y: number },
        to: { x: number; y: number },
    ) => {
        // Calculate the arrow end point on the edge of the target node
        // Radius 50: Node radius (40) + padding/arrowhead clearance (10)
        const end = getEdgePoint(from, to, 50);

        return `M ${from.x} ${from.y} L ${end.x} ${end.y}`;
    };

    return (
        <svg
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            style={{ zIndex: -1 }}
        >
            <defs>
                <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                </marker>
                <marker
                    id="arrowhead-active"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
            </defs>

            {connections.map((conn, index) => (
                <path
                    key={index}
                    d={getPath(conn.from, conn.to)}
                    fill="none"
                    stroke={conn.isActive ? '#3b82f6' : '#94a3b8'}
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    markerEnd={
                        conn.isActive
                            ? 'url(#arrowhead-active)'
                            : 'url(#arrowhead)'
                    }
                    className="transition-colors"
                />
            ))}
        </svg>
    );
}

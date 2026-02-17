# Skill Tree Builder Handoff

**Date:** 2026-02-07  
**UI Reference:** `/home/tereza/Codes/Laravel/wiyatago/references-ui/skill_tree_builder_(visual_canvas)/screen.png`

---

## CONTEXT

Build visual skill tree editor with:
- Draggable nodes on canvas
- SVG connection lines (prerequisites)
- Node properties sidebar
- DAG cycle prevention

**Full Plan:** `/home/tereza/.gemini/antigravity/brain/cd862e14-bd2b-4fad-b0a3-242c780318a5/implementation_plan.md`

---

## EXECUTION ORDER

### Phase 1: Backend Foundation (~4 hrs)

**1.1 Position Migration**
```bash
php artisan make:migration add_position_to_skills --table=skills
```
```php
$table->integer('position_x')->default(0);
$table->integer('position_y')->default(0);
```

**1.2 SkillController**
```bash
php artisan make:controller SkillController --resource
php artisan make:request StoreSkillRequest
php artisan make:request UpdateSkillRequest
php artisan make:policy SkillPolicy --model=Skill
```

**1.3 PrerequisiteController**
```bash
php artisan make:controller SkillPrerequisiteController
```
- `store(Skill, Skill)` - Add edge
- `destroy(Skill, Skill)` - Remove edge

**1.4 DAG Cycle Validation**
```php
// In Skill model or ValidateDAGPipe
public function wouldCreateCycle(int $prerequisiteId): bool
{
    $visited = [];
    $stack = [$this->id];
    
    while (!empty($stack)) {
        $current = array_pop($stack);
        if ($current === $prerequisiteId) return true;
        if (in_array($current, $visited)) continue;
        $visited[] = $current;
        
        $next = SkillPrerequisite::where('skill_id', $current)
            ->pluck('prerequisite_skill_id')->toArray();
        $stack = array_merge($stack, $next);
    }
    return false;
}
```

---

### Phase 2: Frontend Components (~13 hrs)

**2.1 Canvas Container** (`components/skill-tree/SkillTreeCanvas.tsx`)
- Grid dot background
- Pan & zoom
- State: `{ zoom, panX, panY }`

**2.2 Skill Node** (`components/skill-tree/SkillNode.tsx`)
- Circular node with icon
- States: normal, selected, draft
- Draggable
- Label below

**2.3 Connection Layer** (`components/skill-tree/ConnectionLayer.tsx`)
- SVG curves between nodes
- Dashed stroke

**2.4 Toolbar** (`components/skill-tree/CanvasToolbar.tsx`)
- Add Node, Connect, Pan mode
- Undo, Redo

**2.5 Zoom Controls** (`components/skill-tree/ZoomControls.tsx`)
- +, -, Reset view

**2.6 Node Sidebar** (`components/skill-tree/NodeSidebar.tsx`)
- Lesson Title input
- Short Description (with char count)
- Difficulty select
- XP Reward input
- Attached Content
- Save/Duplicate/Delete buttons

**2.7 Connect Mode**
- Click source → temp line → click target
- Validate via API (no cycles)

**2.8 Builder Page** (`pages/courses/[id]/skills/builder.tsx`)
- Compose all components
- Unsaved indicator
- Publish button

---

## TESTS

### Backend
```bash
php artisan make:test SkillControllerTest --pest
php artisan make:test SkillPrerequisiteTest --pest
php artisan make:test DAGCyclePreventionTest --pest
```

Key tests:
- CRUD operations
- Cycle detection (should reject)
- Position update

---

## TIME ESTIMATE

| Phase | Est |
|-------|-----|
| Backend | 4 hrs |
| Frontend | 13 hrs |
| **Total** | **~17 hrs** |

---

## START

```bash
cd /home/tereza/Codes/Laravel/wiyatago
php artisan make:migration add_position_to_skills --table=skills
```

Good luck! 🚀

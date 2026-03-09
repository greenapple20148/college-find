'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ChecklistTask, SavedCollege, College } from '@/lib/types'

/* ═══════════════════════════════════════════════════════════════════
   SVG Icons
   ═══════════════════════════════════════════════════════════════════ */

function CheckIcon() {
    return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}

function PlusIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </svg>
    )
}

function ChevronIcon({ open }: { open: boolean }) {
    return (
        <svg
            className="w-4 h-4 transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   ProgressBar
   ═══════════════════════════════════════════════════════════════════ */

function ProgressBar({ completed, total }: { completed: number; total: number }) {
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100)

    return (
        <div className="flex items-center gap-2.5">
            <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
                <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${pct}%`,
                        background: pct === 100
                            ? 'var(--gold-gradient)'
                            : 'var(--gold-primary)',
                    }}
                />
            </div>
            <span
                className="text-xs font-semibold tabular-nums min-w-[32px] text-right"
                style={{ color: pct === 100 ? 'var(--gold-primary)' : 'var(--text-faint)' }}
            >
                {pct}%
            </span>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   TaskItem
   ═══════════════════════════════════════════════════════════════════ */

function TaskItem({
    task,
    onToggle,
}: {
    task: ChecklistTask
    onToggle: (id: string, status: 'pending' | 'completed') => void
}) {
    const done = task.task_status === 'completed'

    return (
        <button
            onClick={() => onToggle(task.id, done ? 'pending' : 'completed')}
            className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all group"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
            {/* Checkbox */}
            <div
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                    borderColor: done ? 'var(--gold-primary)' : 'var(--border-primary)',
                    backgroundColor: done ? 'var(--gold-primary)' : 'transparent',
                    color: done ? '#fff' : 'transparent',
                }}
            >
                {done && <CheckIcon />}
            </div>

            {/* Label */}
            <span
                className="text-sm flex-1 transition-all duration-200"
                style={{
                    color: done ? 'var(--text-ghost)' : 'var(--text-secondary)',
                    textDecoration: done ? 'line-through' : 'none',
                }}
            >
                {task.task_name}
            </span>

            {/* Custom badge */}
            {task.is_custom && (
                <span
                    className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                    style={{
                        backgroundColor: 'rgba(201,146,60,0.08)',
                        color: 'var(--gold-primary)',
                    }}
                >
                    Custom
                </span>
            )}

            {/* Due date */}
            {task.due_date && (
                <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                    {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
            )}
        </button>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   ChecklistCard
   ═══════════════════════════════════════════════════════════════════ */

function ChecklistCard({
    college,
    collegeId,
    tasks,
    onToggle,
    onAddTask,
}: {
    college?: College
    collegeId: string
    tasks: ChecklistTask[]
    onToggle: (id: string, status: 'pending' | 'completed') => void
    onAddTask: (collegeId: string, taskName: string) => void
}) {
    const [open, setOpen] = useState(false)
    const [adding, setAdding] = useState(false)
    const [newTask, setNewTask] = useState('')

    const completed = tasks.filter(t => t.task_status === 'completed').length
    const total = tasks.length
    const collegeName = college?.name ?? collegeId

    function handleSubmitTask() {
        const name = newTask.trim()
        if (!name) return
        onAddTask(collegeId, name)
        setNewTask('')
        setAdding(false)
    }

    return (
        <div
            className="rounded-xl border transition-all"
            style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-subtle)',
            }}
        >
            {/* Header — always visible */}
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center gap-3 p-4 text-left"
            >
                <div className="flex-1 min-w-0">
                    <p
                        className="text-sm font-semibold truncate"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {collegeName}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                        {completed}/{total} tasks completed
                    </p>
                </div>
                <div className="w-24">
                    <ProgressBar completed={completed} total={total} />
                </div>
                <ChevronIcon open={open} />
            </button>

            {/* Expandable task list */}
            {open && (
                <div className="px-2 pb-3">
                    <div
                        className="border-t mb-2"
                        style={{ borderColor: 'var(--border-subtle)' }}
                    />

                    {tasks.map(task => (
                        <TaskItem key={task.id} task={task} onToggle={onToggle} />
                    ))}

                    {/* Add custom task */}
                    {adding ? (
                        <div className="flex items-center gap-2 px-3 mt-1">
                            <input
                                type="text"
                                value={newTask}
                                onChange={e => setNewTask(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmitTask()}
                                placeholder="e.g. Schedule campus visit"
                                autoFocus
                                className="flex-1 text-sm px-2.5 py-1.5 rounded-lg border outline-none transition-colors"
                                style={{
                                    backgroundColor: 'var(--bg-tertiary)',
                                    borderColor: 'var(--border-primary)',
                                    color: 'var(--text-primary)',
                                }}
                                onFocus={e => (e.target.style.borderColor = 'var(--gold-primary)')}
                                onBlur={e => (e.target.style.borderColor = 'var(--border-primary)')}
                            />
                            <button
                                onClick={handleSubmitTask}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                                style={{
                                    background: 'var(--gold-gradient)',
                                    color: '#fff',
                                }}
                            >
                                Add
                            </button>
                            <button
                                onClick={() => { setAdding(false); setNewTask('') }}
                                className="text-xs px-2 py-1.5"
                                style={{ color: 'var(--text-faint)' }}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setAdding(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 mt-1 text-xs font-medium rounded-lg transition-opacity hover:opacity-80"
                            style={{ color: 'var(--gold-primary)' }}
                        >
                            <PlusIcon /> Add custom task
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   ApplicationChecklist — Main component
   ═══════════════════════════════════════════════════════════════════ */

export function ApplicationChecklist({ savedColleges }: { savedColleges: SavedCollege[] }) {
    const [tasksByCollege, setTasksByCollege] = useState<Record<string, ChecklistTask[]>>({})
    const [loading, setLoading] = useState(true)
    const [initializing, setInitializing] = useState(false)

    // Fetch all checklist tasks
    const fetchTasks = useCallback(async () => {
        try {
            const res = await fetch('/api/checklist')
            const { data } = await res.json() as { data: ChecklistTask[] }

            // Group by college_id
            const grouped: Record<string, ChecklistTask[]> = {}
            for (const task of data) {
                if (!grouped[task.college_id]) grouped[task.college_id] = []
                grouped[task.college_id].push(task)
            }
            setTasksByCollege(grouped)
        } catch (err) {
            console.error('Failed to fetch checklists:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    // Initialize default tasks for colleges that don't have checklists yet
    async function initializeChecklists() {
        setInitializing(true)
        try {
            const collegesWithoutTasks = savedColleges.filter(
                s => !tasksByCollege[s.college_id]
            )
            await Promise.all(
                collegesWithoutTasks.map(s =>
                    fetch('/api/checklist/create-default', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ college_id: s.college_id }),
                    })
                )
            )
            await fetchTasks()
        } catch (err) {
            console.error('Failed to initialize checklists:', err)
        } finally {
            setInitializing(false)
        }
    }

    // Toggle task status
    async function handleToggle(taskId: string, newStatus: 'pending' | 'completed') {
        // Optimistic update
        setTasksByCollege(prev => {
            const updated = { ...prev }
            for (const cid in updated) {
                updated[cid] = updated[cid].map(t =>
                    t.id === taskId ? { ...t, task_status: newStatus } : t
                )
            }
            return updated
        })

        await fetch('/api/checklist/update-status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id: taskId, task_status: newStatus }),
        })
    }

    // Add custom task
    async function handleAddTask(collegeId: string, taskName: string) {
        const res = await fetch('/api/checklist/add-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ college_id: collegeId, task_name: taskName }),
        })
        if (res.ok) {
            const task = await res.json() as ChecklistTask
            setTasksByCollege(prev => ({
                ...prev,
                [collegeId]: [...(prev[collegeId] ?? []), task],
            }))
        }
    }

    if (loading) {
        return (
            <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
                <div className="animate-pulse space-y-3">
                    <div className="h-4 w-32 rounded" style={{ backgroundColor: 'var(--skeleton-color)' }} />
                    <div className="h-8 rounded" style={{ backgroundColor: 'var(--skeleton-color)' }} />
                    <div className="h-8 rounded" style={{ backgroundColor: 'var(--skeleton-color)' }} />
                </div>
            </div>
        )
    }

    // Overall progress
    const allTasks = Object.values(tasksByCollege).flat()
    const totalCompleted = allTasks.filter(t => t.task_status === 'completed').length
    const totalTasks = allTasks.length
    const hasUninitializedColleges = savedColleges.some(s => !tasksByCollege[s.college_id])

    return (
        <div
            className="rounded-xl border p-5"
            style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-subtle)',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Application Checklist
                </h3>
                {totalTasks > 0 && (
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                        {totalCompleted}/{totalTasks} done
                    </span>
                )}
            </div>

            {/* Overall progress */}
            {totalTasks > 0 && (
                <div className="mb-4">
                    <ProgressBar completed={totalCompleted} total={totalTasks} />
                </div>
            )}

            {/* Initialize button */}
            {hasUninitializedColleges && (
                <button
                    onClick={initializeChecklists}
                    disabled={initializing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 mb-3 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                    style={{
                        background: 'var(--gold-gradient)',
                        color: '#fff',
                    }}
                >
                    <PlusIcon />
                    {initializing ? 'Creating tasks...' : 'Create checklists for saved colleges'}
                </button>
            )}

            {/* College checklists */}
            {savedColleges.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-faint)' }}>
                    Save colleges to start tracking tasks.
                </p>
            ) : (
                <div className="space-y-2">
                    {savedColleges
                        .filter(s => tasksByCollege[s.college_id])
                        .map(s => (
                            <ChecklistCard
                                key={s.college_id}
                                college={s.college}
                                collegeId={s.college_id}
                                tasks={tasksByCollege[s.college_id]}
                                onToggle={handleToggle}
                                onAddTask={handleAddTask}
                            />
                        ))}
                </div>
            )}
        </div>
    )
}

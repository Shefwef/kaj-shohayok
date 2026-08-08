"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, GripVertical, Clock, User, AlertCircle } from "lucide-react";
import Link from "next/link";

type TaskStatus = "todo" | "in_progress" | "review" | "done";

interface KanbanTask {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high" | "critical";
  assigneeId?: string;
  dueDate?: string;
}

interface KanbanColumn {
  id: TaskStatus;
  label: string;
  color: string;
  headerColor: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: "todo", label: "To Do", color: "border-l-yellow-400", headerColor: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200" },
  { id: "in_progress", label: "In Progress", color: "border-l-blue-400", headerColor: "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200" },
  { id: "review", label: "Review", color: "border-l-purple-400", headerColor: "bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200" },
  { id: "done", label: "Done", color: "border-l-green-400", headerColor: "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200" },
];

const PRIORITY_CONFIG = {
  critical: { label: "Critical", color: "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300", dot: "bg-red-500" },
  high: { label: "High", color: "text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300", dot: "bg-orange-500" },
  medium: { label: "Medium", color: "text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300", dot: "bg-yellow-500" },
  low: { label: "Low", color: "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300", dot: "bg-green-500" },
};

function TaskCard({ task, isDragging = false }: { task: KanbanTask; isDragging?: boolean }) {
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 ${
        task.priority === "critical"
          ? "border-l-red-500"
          : task.priority === "high"
          ? "border-l-orange-500"
          : task.priority === "medium"
          ? "border-l-yellow-500"
          : "border-l-green-500"
      } ${isDragging ? "shadow-xl rotate-2 opacity-90" : "hover:shadow-md"} transition-shadow`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight flex-1">
          {task.title}
        </p>
        <GripVertical className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0 cursor-grab mt-0.5" />
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-2 gap-1 flex-wrap">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${priority.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
          {priority.label}
        </span>

        <div className="flex items-center gap-1.5">
          {task.assigneeId && (
            <span title={`Assigned to ${task.assigneeId}`}>
              <User className="h-3.5 w-3.5 text-gray-400" />
            </span>
          )}
          {task.dueDate && (
            <span
              className={`flex items-center gap-0.5 text-xs ${
                isOverdue ? "text-red-500" : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {isOverdue && <AlertCircle className="h-3 w-3" />}
              <Clock className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SortableTaskCard({ task }: { task: KanbanTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

interface KanbanBoardProps {
  tasks: KanbanTask[];
  projectId: string;
  onTaskMove?: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

export default function KanbanBoard({ tasks, projectId, onTaskMove }: KanbanBoardProps) {
  const [localTasks, setLocalTasks] = useState<KanbanTask[]>(tasks);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getColumnTasks = (status: TaskStatus) =>
    localTasks.filter((t) => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const task = localTasks.find((t) => t._id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const draggedTask = localTasks.find((t) => t._id === active.id);
    if (!draggedTask) return;

    // Determine target column from the over id (could be column id or task id)
    const targetColumn = COLUMNS.find((c) => c.id === over.id);
    const targetTask = localTasks.find((t) => t._id === over.id);
    const newStatus: TaskStatus = targetColumn?.id ?? targetTask?.status ?? draggedTask.status;

    if (newStatus === draggedTask.status) return;

    // Optimistic update
    setLocalTasks((prev) =>
      prev.map((t) => (t._id === draggedTask._id ? { ...t, status: newStatus } : t))
    );

    try {
      await onTaskMove?.(draggedTask._id, newStatus);
    } catch {
      // Revert on failure
      setLocalTasks((prev) =>
        prev.map((t) => (t._id === draggedTask._id ? { ...t, status: draggedTask.status } : t))
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((column) => {
          const columnTasks = getColumnTasks(column.id);
          return (
            <div key={column.id} className="flex flex-col min-h-[400px]">
              {/* Column header */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${column.headerColor}`}>
                <span className="text-sm font-semibold">{column.label}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20">
                  {columnTasks.length}
                </span>
              </div>

              {/* Drop zone */}
              <SortableContext
                items={columnTasks.map((t) => t._id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className={`flex-1 p-2 space-y-2 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg border-2 border-dashed border-transparent ${
                    column.id === "done"
                      ? "border-green-200 dark:border-green-900"
                      : "border-gray-200 dark:border-gray-800"
                  } min-h-[350px]`}
                  data-column={column.id}
                >
                  <AnimatePresence>
                    {columnTasks.map((task) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        <SortableTaskCard task={task} />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {columnTasks.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-xs text-gray-400 dark:text-gray-600">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </SortableContext>

              {/* Add task link */}
              <Link
                href={`/dashboard/tasks/new?projectId=${projectId}&status=${column.id}`}
                className="mt-2 flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add task
              </Link>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="w-64 rotate-3">
            <TaskCard task={activeTask} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

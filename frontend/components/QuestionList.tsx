"use client";

import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DraftQuestion } from "@/types";
import { QUESTION_TYPE_LABELS } from "@/types";
import { DragHandleIcon, TrashIcon } from "@/components/icons";

function SortableRow({
  question, index, selected, onSelect, onDelete,
}: {
  question: DraftQuestion;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-2 rounded-xl border px-2.5 py-2.5 transition-colors ${
        selected ? "border-accent bg-accent-soft" : "border-transparent hover:bg-paper"
      } ${isDragging ? "z-10 opacity-70 shadow-lg" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted/60 hover:text-muted active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <DragHandleIcon />
      </button>
      <button onClick={onSelect} className="focus-ring min-w-0 flex-1 rounded-md text-left">
        <div className="truncate text-sm font-medium">
          {index + 1}. {question.title || "Untitled question"}
        </div>
        <div className="text-xs text-muted">{QUESTION_TYPE_LABELS[question.type]}</div>
      </button>
      <button
        onClick={onDelete}
        className="focus-ring rounded-md p-1 text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
        aria-label="Delete question"
      >
        <TrashIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function QuestionList({
  questions, selectedIndex, onSelect, onDelete, onReorder,
}: {
  questions: DraftQuestion[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  onReorder: (questions: DraftQuestion[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    onReorder(arrayMove(questions, oldIndex, newIndex));
  }

  if (questions.length === 0) {
    return (
      <p className="px-2.5 py-6 text-center text-sm text-muted">
        No questions yet. Add your first question to get started.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-1">
          {questions.map((q, i) => (
            <SortableRow
              key={q.id}
              question={q}
              index={i}
              selected={i === selectedIndex}
              onSelect={() => onSelect(i)}
              onDelete={() => onDelete(i)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

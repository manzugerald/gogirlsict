import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface ColumnOption {
  id: string;
  label: string;
}

interface DownloadColumnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnOption[];
  onDownload: (selectedColumns: ColumnOption[]) => void;
  defaultSelected?: string[];
}

export default function DownloadColumnsModal({
  isOpen,
  onClose,
  columns,
  onDownload,
  defaultSelected = [],
}: DownloadColumnsModalProps) {
  const [available, setAvailable] = useState<ColumnOption[]>([]);
  const [selected, setSelected] = useState<ColumnOption[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAvailable(columns.filter((c) => !defaultSelected.includes(c.id)));
      setSelected(columns.filter((c) => defaultSelected.includes(c.id)));
    }
  }, [isOpen]); // Only reset when modal opens

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    // Reordering in selected
    if (
      active &&
      over &&
      selected.find((c) => c.id === active.id) &&
      selected.find((c) => c.id === over.id) &&
      active.id !== over.id
    ) {
      setSelected((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      return;
    }

    // Drag from available to selected area
    if (
      active &&
      over &&
      available.find((c) => c.id === active.id) &&
      over.id === 'selected-drop-area'
    ) {
      const col = available.find((c) => c.id === active.id)!;
      setAvailable((prev) => prev.filter((c) => c.id !== col.id));
      setSelected((prev) => [...prev, col]);
    }
  }

  function handleAdd(col: ColumnOption) {
    setAvailable((prev) => prev.filter((c) => c.id !== col.id));
    setSelected((prev) => [...prev, col]);
  }

  function handleRemove(col: ColumnOption) {
    setSelected((prev) => prev.filter((c) => c.id !== col.id));
    setAvailable((prev) => [...prev, col]);
  }

  // PDF Export Helper: handles serial number and date formatting
  function handleDownload() {
    onDownload(selected);
    onClose();
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/30 dark:bg-black/70" aria-hidden="true" />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl mx-auto p-6 z-10">
        <Dialog.Title className="text-lg font-bold mb-2 dark:text-white">
          Select & Order Columns
        </Dialog.Title>
        <div className="flex gap-6">
          {/* Available Columns */}
          <div className="w-1/2">
            <div className="font-semibold mb-2 dark:text-gray-200">All Columns</div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <ul className="border rounded p-2 min-h-[200px] bg-gray-50 dark:bg-gray-800">
                {available.map((col) => (
                  <DraggableColumnItem
                    key={col.id}
                    id={col.id}
                    label={col.label}
                    onAdd={() => handleAdd(col)}
                  />
                ))}
                {available.length === 0 && (
                  <li className="text-gray-400 dark:text-gray-500 text-sm">All columns selected</li>
                )}
              </ul>
            </DndContext>
          </div>
          {/* Selected Columns (drag to reorder, droppable area) */}
          <div className="w-1/2">
            <div className="font-semibold mb-2 dark:text-gray-200">
              To Download (drag to reorder)
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selected.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul
                  id="selected-drop-area"
                  className="border rounded p-2 min-h-[200px] bg-gray-50 dark:bg-gray-800"
                >
                  {selected.map((col) => (
                    <SortableColumnItem
                      key={col.id}
                      id={col.id}
                      label={col.label}
                      onRemove={() => handleRemove(col)}
                    />
                  ))}
                  {selected.length === 0 && (
                    <li className="text-gray-400 dark:text-gray-500 text-sm">
                      No columns selected
                    </li>
                  )}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <div className="flex justify-end mt-6 gap-2">
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded disabled:opacity-50"
            disabled={selected.length === 0}
            onClick={handleDownload}
          >
            Download PDF
          </button>
        </div>
      </div>
    </Dialog>
  );
}

// Draggable item for available columns (left)
function DraggableColumnItem({
  id,
  label,
  onAdd,
}: {
  id: string;
  label: string;
  onAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-center gap-2 bg-white dark:bg-gray-900 border-b last:border-b-0 border-gray-100 dark:border-gray-800 py-1 px-2 rounded cursor-pointer group"
      {...attributes}
      {...listeners}
      tabIndex={0}
      onClick={onAdd}
      title="Add to Download"
    >
      <span
        className="cursor-move text-gray-400 dark:text-gray-500 select-none"
        aria-label="Drag to select column"
        title="Drag to select column"
      >
        ☰
      </span>
      <span className="flex-1 dark:text-gray-100">{label}</span>
    </li>
  );
}

// Draggable/sortable item for selected columns (right)
function SortableColumnItem({
  id,
  label,
  onRemove,
}: {
  id: string;
  label: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-center gap-2 bg-white dark:bg-gray-900 border-b last:border-b-0 border-gray-100 dark:border-gray-800 py-1 px-2 rounded cursor-move group"
      {...attributes}
      {...listeners}
    >
      <span
        className="cursor-move text-gray-400 dark:text-gray-500 select-none"
        aria-label="Drag to reorder"
        title="Drag to reorder"
      >
        ☰
      </span>
      <span className="flex-1 dark:text-gray-100">{label}</span>
      <button
        onClick={onRemove}
        className="ml-auto text-gray-400 hover:text-red-500 dark:hover:text-red-400"
        title="Remove"
        type="button"
      >
        ✕
      </button>
    </li>
  );
}
// This code defines a modal component for selecting and ordering columns to download as a PDF.
// It uses DnD Kit for drag-and-drop functionality, allowing users to reorder selected columns
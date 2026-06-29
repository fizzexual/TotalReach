"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { DealFields, type DealCardData, type Option } from "@/components/forms/deal-fields";
import { DEAL_STAGES, STAGE_META, type DealStage } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteDeal, moveDeal, updateDeal } from "@/lib/actions/deals";
import type { FormState } from "@/lib/validation";

type Columns = Record<string, DealCardData[]>;

function group(deals: DealCardData[]): Columns {
  const cols: Columns = {};
  for (const s of DEAL_STAGES) cols[s] = [];
  for (const d of deals) {
    if (!cols[d.stage]) cols[d.stage] = [];
    cols[d.stage].push(d);
  }
  for (const s of Object.keys(cols)) cols[s].sort((a, b) => a.order - b.order);
  return cols;
}

function findContainerIn(cols: Columns, id: string): string | undefined {
  if (id in cols) return id;
  return Object.keys(cols).find((s) => cols[s].some((d) => d.id === id));
}

function CardBody({ deal }: { deal: DealCardData }) {
  return (
    <>
      <p className="line-clamp-2 text-sm font-medium text-slate-800">{deal.title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(deal.value)}</p>
      {(deal.companyName || deal.contactName) && (
        <p className="mt-1 truncate text-xs text-slate-400">{deal.companyName ?? deal.contactName}</p>
      )}
    </>
  );
}

function DealCard({ deal, onClick }: { deal: DealCardData; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });
  const style = { transform: CSS.Translate.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "cursor-grab touch-none rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition active:cursor-grabbing hover:border-indigo-200",
        isDragging && "opacity-40",
      )}
    >
      <CardBody deal={deal} />
    </div>
  );
}

function Column({
  stage,
  deals,
  onCardClick,
}: {
  stage: string;
  deals: DealCardData[];
  onCardClick: (d: DealCardData) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = deals.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", STAGE_META[stage as DealStage]?.dot)} />
          <span className="text-sm font-semibold text-slate-700">{stage}</span>
          <span className="text-xs text-slate-400">{deals.length}</span>
        </div>
        <span className="text-xs font-medium text-slate-500">{formatCurrency(total)}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[140px] flex-1 flex-col gap-2 rounded-xl bg-slate-100/70 p-2 transition",
          isOver && "ring-2 ring-indigo-300",
        )}
      >
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((d) => (
            <DealCard key={d.id} deal={d} onClick={() => onCardClick(d)} />
          ))}
        </SortableContext>
        {deals.length === 0 && (
          <p className="px-1 py-6 text-center text-xs text-slate-400">Drop deals here</p>
        )}
      </div>
    </div>
  );
}

export function DealBoard({
  deals,
  contacts,
  companies,
}: {
  deals: DealCardData[];
  contacts: Option[];
  companies: Option[];
}) {
  const router = useRouter();
  const [columns, setColumns] = React.useState<Columns>(() => group(deals));
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<DealCardData | null>(null);

  const columnsRef = React.useRef(columns);
  React.useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  const didDragRef = React.useRef(false);

  // Re-sync from the server whenever the underlying data changes.
  const signature = React.useMemo(
    () => deals.map((d) => `${d.id}:${d.stage}:${d.order}:${d.value}:${d.title}:${d.contactId}:${d.companyId}`).join("|"),
    [deals],
  );
  React.useEffect(() => {
    setColumns(group(deals));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const [editState, editAction] = useActionState<FormState, FormData>(updateDeal, {});
  React.useEffect(() => {
    if (editState.ok) {
      setEditing(null);
      router.refresh();
    }
  }, [editState, router]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeDeal = activeId
    ? Object.values(columns).flat().find((d) => d.id === activeId) ?? null
    : null;

  function handleDragStart(e: DragStartEvent) {
    didDragRef.current = true;
    setActiveId(String(e.active.id));
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    setColumns((prev) => {
      const activeContainer = findContainerIn(prev, activeId);
      const overContainer = findContainerIn(prev, overId);
      if (!activeContainer || !overContainer || activeContainer === overContainer) return prev;
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((d) => d.id === activeId);
      if (activeIndex === -1) return prev;
      const moved = activeItems[activeIndex];
      let overIndex = overItems.findIndex((d) => d.id === overId);
      if (overIndex === -1) overIndex = overItems.length;
      return {
        ...prev,
        [activeContainer]: activeItems.filter((d) => d.id !== activeId),
        [overContainer]: [
          ...overItems.slice(0, overIndex),
          { ...moved, stage: overContainer },
          ...overItems.slice(overIndex),
        ],
      };
    });
  }

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    setTimeout(() => {
      didDragRef.current = false;
    }, 0);
    if (!over) return;

    const current = columnsRef.current;
    const activeContainer = findContainerIn(current, String(active.id));
    const overContainer = findContainerIn(current, String(over.id));
    if (!activeContainer || !overContainer) return;

    let finalCols = current;
    if (activeContainer === overContainer) {
      const items = current[activeContainer];
      const oldIndex = items.findIndex((d) => d.id === active.id);
      let newIndex = items.findIndex((d) => d.id === over.id);
      if (newIndex === -1) newIndex = items.length - 1;
      if (oldIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(items, oldIndex, newIndex);
        finalCols = { ...current, [activeContainer]: reordered };
        setColumns(finalCols);
      }
    }

    const ids = finalCols[overContainer].map((d) => d.id);
    await moveDeal(String(active.id), overContainer, ids);
    router.refresh();
  }

  function onCardClick(d: DealCardData) {
    if (didDragRef.current) return;
    setEditing(d);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {DEAL_STAGES.map((stage) => (
            <Column key={stage} stage={stage} deals={columns[stage] ?? []} onCardClick={onCardClick} />
          ))}
        </div>
        <DragOverlay>
          {activeDeal ? (
            <div className="w-64 rotate-1 rounded-lg border border-indigo-200 bg-white p-3 shadow-lg">
              <CardBody deal={activeDeal} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {editing && (
        <Modal open onClose={() => setEditing(null)} title="Edit deal">
          <form key={editing.id} action={editAction} className="space-y-4">
            <input type="hidden" name="id" value={editing.id} />
            {editState.error && (
              <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {editState.error}
              </div>
            )}
            <DealFields deal={editing} contacts={contacts} companies={companies} fieldErrors={editState.fieldErrors} />
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50"
                onClick={async () => {
                  const id = editing.id;
                  if (window.confirm("Delete this deal? This cannot be undone.")) {
                    await deleteDeal(id);
                    setEditing(null);
                    router.refresh();
                  }
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <SubmitButton>Save changes</SubmitButton>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

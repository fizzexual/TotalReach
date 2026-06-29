import { StickyNote } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";

export default function NotesPage() {
  return (
    <div>
      <PageHeader title="Notes" subtitle="Shared notes across your workspace." />
      <EmptyState icon={StickyNote} title="No notes yet" description="Notes you write on records will collect here." />
    </div>
  );
}

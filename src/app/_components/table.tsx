import type { columns, rows } from "~/server/db/schema";

interface TableProps {
  columns: (typeof columns.$inferSelect)[];
  rows: (typeof rows.$inferSelect)[];
  isLoading: boolean;
}

export default function Table({ columns, rows, isLoading }: TableProps) {
  return (
    <div>
      <h1>Table content here</h1>
    </div>
  );
}

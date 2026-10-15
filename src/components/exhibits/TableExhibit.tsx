import type { TableExhibit as TableExhibitData } from "@/types/exhibit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TableExhibit({ exhibit }: { exhibit: TableExhibitData }) {
  return (
    <div className="overflow-x-auto p-2">
      <Table
        containerProps={{
          role: "region",
          "aria-label": "Tabelle",
          tabIndex: 0,
          className: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        }}
      >
        <TableHeader>
          <TableRow>
            {exhibit.headers.map((h, i) => (
              <TableHead key={i} className="font-bold whitespace-nowrap">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {exhibit.rows.map((row, r) => (
            <TableRow key={r} className="even:bg-gray-50 dark:even:bg-gray-900">
              {row.map((cell, c) => (
                <TableCell key={c} className="font-mono text-sm whitespace-pre">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

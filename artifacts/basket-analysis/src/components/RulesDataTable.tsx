import { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { AssociationRule } from "@workspace/api-client-react";

interface RulesDataTableProps {
  data: AssociationRule[];
}

const columnHelper = createColumnHelper<AssociationRule>();

const columns = [
  columnHelper.accessor(row => row.antecedent.join(", "), {
    id: "antecedent",
    header: "Antecedent (If)",
    cell: info => <span className="font-medium text-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor(row => row.consequent.join(", "), {
    id: "consequent",
    header: "Consequent (Then)",
    cell: info => <span className="font-medium text-primary">{info.getValue()}</span>,
  }),
  columnHelper.accessor("support", {
    header: "Support",
    cell: info => <span className="text-muted-foreground">{(info.getValue() * 100).toFixed(2)}%</span>,
  }),
  columnHelper.accessor("confidence", {
    header: "Confidence",
    cell: info => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent rounded-full" 
            style={{ width: `${info.getValue() * 100}%` }}
          />
        </div>
        <span className="text-muted-foreground w-12 text-right">
          {(info.getValue() * 100).toFixed(1)}%
        </span>
      </div>
    ),
  }),
  columnHelper.accessor("lift", {
    header: "Lift",
    cell: info => {
      const val = info.getValue();
      return (
        <span className={`font-semibold ${val > 2 ? 'text-emerald-400' : val > 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          {val.toFixed(2)}
        </span>
      );
    },
  }),
  columnHelper.accessor("conviction", {
    header: "Conviction",
    cell: info => <span className="text-muted-foreground">{info.getValue().toFixed(2)}</span>,
  }),
];

export function RulesDataTable({ data }: RulesDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "lift", desc: true }
  ]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  });

  return (
    <div className="w-full">
      <div className="rounded-xl border border-white/10 overflow-hidden bg-card/40 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-white/10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className="px-6 py-4 font-medium cursor-pointer hover:text-foreground transition-colors group"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                    No rules found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-background/30">
          <span className="text-xs text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length)} of {data.length} rules
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1 rounded-md hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-muted-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1 rounded-md hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-muted-foreground"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

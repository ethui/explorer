import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { clsx } from "clsx";

interface TableProps<T> {
  data: T[];
  columns: any[];
}

export default function Table<T>({ data, columns }: TableProps<T>) {
  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="w-full table-fixed text-sm">
      <thead className="border-b text-xs">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="p-3 text-left align-middle">
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row, index) => (
          <tr
            key={row.id}
            className={clsx(
              "border-b h-16 align-middle",
              index === data.length - 1 && "border-b-0",
            )}
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="p-3 align-middle">
                <div className="truncate">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

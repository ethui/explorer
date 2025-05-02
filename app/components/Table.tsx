import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
}

export function Table<T>({ data, columns }: TableProps<T>) {
  const table = useReactTable<T>({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="w-full table-fixed">
      <tbody className="px-2">
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="border-b border-gray-400 py-6">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Inbox,
  Loader2,
} from 'lucide-react';

export type { ColumnDef };

export interface AdminTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  globalSearchKey?: keyof TData | string;
  actions?: React.ReactNode;
  filterElement?: React.ReactNode;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  pageSize?: number;
}

export function AdminTable<TData>({
  data,
  columns,
  title,
  subtitle,
  searchPlaceholder = 'Search records...',
  globalSearchKey,
  actions,
  filterElement,
  isLoading = false,
  onRowClick,
  pageSize = 10,
}: AdminTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Filter function for global search
  const filteredData = useMemo(() => {
    if (!globalFilter.trim()) return data;
    const query = globalFilter.toLowerCase();

    return data.filter((item: any) => {
      if (globalSearchKey && item[globalSearchKey]) {
        return String(item[globalSearchKey]).toLowerCase().includes(query);
      }
      // Search across all string/number fields of the record
      return Object.values(item).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [data, globalFilter, globalSearchKey]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className="w-full bg-white border border-neutral-300 rounded-2xl shadow-sm overflow-hidden subpixel-antialiased">
      {/* First Row Header Bar: Title on left, Search Field + Refresh Button on right */}
      <div className="p-4 sm:p-5 border-b border-neutral-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Left: Title & Subtitle */}
        <div>
          {title && (
            <h3 className="text-base sm:text-lg font-serif font-bold text-neutral-950 tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-neutral-600 font-medium mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Right: Search Field & Refresh Button in the same first row */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64 lg:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 bg-[#FAF9F6] border border-neutral-300 focus:bg-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 text-xs font-medium text-neutral-900 rounded-xl outline-none transition-all placeholder:text-neutral-500"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-500 hover:text-neutral-800 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {filterElement && <div className="flex items-center gap-2">{filterElement}</div>}

          {/* Refresh & Other Actions */}
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </div>

        {/* Table Container */}
      <div className="overflow-x-auto relative min-h-[220px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-[#6B5110]">
              <Loader2 className="w-4 h-4 animate-spin text-[#8F6B1E]" />
              <span>Loading data...</span>
            </div>
          </div>
        )}

        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-[#F5EEDB] border-b border-neutral-300">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-900 select-none whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-1.5 ${
                            canSort ? 'cursor-pointer hover:text-black' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                          {canSort && (
                            <span className="text-neutral-700">
                              {isSorted === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-[#6B5110]" />
                              ) : isSorted === 'desc' ? (
                                <ArrowDown className="w-3.5 h-3.5 text-[#6B5110]" />
                              ) : (
                                <ArrowUpDown className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-neutral-200 text-sm font-medium text-neutral-900 bg-white">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-[#FBF6E9]/60' : 'hover:bg-neutral-50'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-4 whitespace-nowrap text-neutral-900 font-medium">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-neutral-600">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-neutral-800">No records found</p>
                    {globalFilter && (
                      <p className="text-xs text-neutral-500 font-medium">
                        Try adjusting your search query "{globalFilter}"
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 border-t border-neutral-200 bg-[#FAF9F6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-neutral-800">
        <div className="flex items-center gap-2">
          <span>
            Showing{' '}
            <strong className="text-neutral-950 font-bold">
              {table.getRowModel().rows.length > 0
                ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
                : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-neutral-950 font-bold">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                filteredData.length
              )}
            </strong>{' '}
            of <strong className="text-neutral-950 font-bold">{filteredData.length}</strong> entries
          </span>

          <span className="text-neutral-400">|</span>

          {/* Page Size Selector */}
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-2.5 py-1 bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none focus:border-[#D4AF37]"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-800 transition-colors cursor-pointer"
            title="First page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-800 transition-colors cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-2.5 text-xs font-bold text-neutral-950">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {Math.max(1, table.getPageCount())}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-800 transition-colors cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-800 transition-colors cursor-pointer"
            title="Last page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminTable;

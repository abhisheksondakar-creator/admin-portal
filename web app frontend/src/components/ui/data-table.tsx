import * as React from 'react'
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { Button } from './button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Skeleton } from './skeleton'

interface PageInfo {
  pageIndex: number
  pageSize: number
  totalElements: number
  totalPages: number
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  pageSize?: number
  showPagination?: boolean
  searchKey?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  serverSide?: boolean
  pageInfo?: PageInfo
  onPageChange?: (pageIndex: number) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  pageSize = 25,
  showPagination = true,
  serverSide = false,
  pageInfo,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const effectivePageIndex = serverSide ? pageInfo?.pageIndex ?? 0 : undefined
  const effectivePageSize = serverSide ? pageInfo?.pageSize ?? pageSize : pageSize
  const effectiveTotalElements = serverSide ? pageInfo?.totalElements ?? 0 : undefined
  const effectiveTotalPages = serverSide ? pageInfo?.totalPages ?? 1 : undefined

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(!serverSide && {
      getPaginationRowModel: getPaginationRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnFiltersChange: setColumnFilters,
    }),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    manualPagination: serverSide,
    pageCount: serverSide ? effectiveTotalPages : undefined,
    state: {
      sorting,
      ...(!serverSide
        ? { columnFilters }
        : {
            pagination: {
              pageIndex: effectivePageIndex ?? 0,
              pageSize: effectivePageSize,
            },
          }),
    },
    initialState: {
      pagination: {
        pageSize: effectivePageSize,
      },
    },
  })

  const rowCount = serverSide
    ? effectiveTotalElements ?? 0
    : table.getFilteredRowModel().rows.length

  const currentPageIndex = serverSide
    ? effectivePageIndex ?? 0
    : table.getState().pagination.pageIndex
  const currentPageCount = serverSide
    ? effectiveTotalPages ?? 1
    : table.getPageCount() || 1

  const canPreviousPage = currentPageIndex > 0
  const canNextPage = currentPageIndex < currentPageCount - 1

  const goToPage = (pageIdx: number) => {
    if (serverSide) {
      onPageChange?.(pageIdx)
    } else {
      table.setPageIndex(pageIdx)
    }
  }

  return (
    <div className="w-full">
      <div className="rounded-card border border-[#E7E5E4] bg-surface">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-ink-muted">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex-1 text-sm text-ink-muted font-tabular-nums">
            {rowCount} row{rowCount !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(0)}
              disabled={!canPreviousPage}
            >
              <ChevronsLeft size={14} strokeWidth={1.5} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPageIndex - 1)}
              disabled={!canPreviousPage}
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
            </Button>
            <div className="flex items-center gap-1 px-3 text-sm text-ink-muted font-tabular-nums">
              Page {currentPageIndex + 1} of {currentPageCount}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPageIndex + 1)}
              disabled={!canNextPage}
            >
              <ChevronRight size={14} strokeWidth={1.5} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(Math.max(0, currentPageCount - 1))}
              disabled={!canNextPage}
            >
              <ChevronsRight size={14} strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export type { ColumnDef }

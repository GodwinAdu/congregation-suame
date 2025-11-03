"use client";

import { useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { File, Printer, Loader2, ChevronDown } from 'lucide-react';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface FilterOption {
    _id: string;
    label: string;
}

interface FilterGroup {
    id: string;
    label: string;
    options: FilterOption[];
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    searchKey?: string;
    data: TData[];
    filterGroups?: FilterGroup[];
    onFilterChange?: (filters: Record<string, string>) => void;
    isLoading?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    filterGroups,
    isLoading,
}: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const exportToCSV = () => {
        const exportColumns = table.getAllLeafColumns();
        const csvData = data.map((row) =>
            exportColumns.reduce((acc, col) => {
                acc[col.id] = row[col.id as keyof typeof row];
                return acc;
            }, {} as Record<string, unknown>)
        );

        const worksheet = XLSX.utils.json_to_sheet(csvData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "data.csv");
    };

    const exportToExcel = () => {
        const exportColumns = table.getAllLeafColumns();
        const excelData = data.map((row) =>
            exportColumns.reduce((acc, col) => {
                acc[col.id] = row[col.id as keyof typeof row];
                return acc;
            }, {} as Record<string, unknown>)
        );
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, "data.xlsx");
    };

    const exportToPDF = () => {
        const exportColumns = table.getAllLeafColumns();
        const doc = new jsPDF();
        autoTable(doc, {
            head: [exportColumns.map((col) => col.id)],
            body: data.map((row) =>
                exportColumns.map((col) => row[col.id as keyof typeof row] || "")
            ),
        });
        doc.save("data.pdf");
    };

    return (
        <div>
            {/* Mobile-first header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    <Input
                        placeholder={`Search by ${searchKey}`}
                        value={
                            (table?.getColumn(searchKey as string)?.getFilterValue() as string) ?? ""
                        }
                        onChange={(event) =>
                            table.getColumn(searchKey as string)?.setFilterValue(event.target.value)
                        }
                        className="w-full sm:max-w-sm"
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {filterGroups?.slice(0, 2).map((filterGroup) => (
                            <Select
                                key={filterGroup.id}
                                value={(table.getColumn(filterGroup.id)?.getFilterValue() as string) ?? ""}
                                onValueChange={(value) => {
                                    const column = table.getColumn(filterGroup.id)
                                    if (column) {
                                        column.setFilterValue(value === "all" ? "" : value)
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder={`${filterGroup.label}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All {filterGroup.label}s</SelectItem>
                                    {filterGroup.options.map((option) => (
                                        <SelectItem key={option._id} value={option._id}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ))}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-shrink-0">
                                    <ChevronDown className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-1">Columns</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(!!value)
                                                }
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={exportToCSV} className="flex-1 sm:flex-none">
                        <File className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">CSV</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportToExcel} className="flex-1 sm:flex-none">
                        <File className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Excel</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportToPDF} className="flex-1 sm:flex-none">
                        <Printer className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">PDF</span>
                    </Button>
                </div>
            </div>
            <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-20 sm:h-24 text-center">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            <span className="text-sm">Loading...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : data.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="hover:bg-muted/50"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3">
                                                <div className="truncate max-w-[150px] sm:max-w-none" title={String(cell.getValue())}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-20 sm:h-24 text-center">
                                        <div className="text-sm text-muted-foreground">
                                            No results found.
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 py-3 sm:py-4">
                <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="flex-1 sm:flex-none"
                    >
                        Previous
                    </Button>
                    <div className="text-xs text-muted-foreground px-2 hidden sm:block">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="flex-1 sm:flex-none"
                    >
                        Next
                    </Button>
                </div>
            </div>

        </div>
    );
}

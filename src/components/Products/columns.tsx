"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import {
  MoreHorizontal,
  Percent,
  SquarePen,
  Trash2,
  Settings,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { IProduct } from "../../types/product";


interface Props {
  onEdit: (product: IProduct) => void;
  onDelete: (product: IProduct) => void;
  onViewBatches?: (product: IProduct) => void;
  onAdjustStock?: (product: IProduct) => void;
}

export const columns = ({
  onEdit,
  onDelete,
  onViewBatches,
  onAdjustStock,
}: Props): ColumnDef<IProduct>[] => [
  {
    accessorKey: "No",
    header: "No",
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    header: "Image",
    cell: ({ row }) => (
      <div className="w-15 h-15 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center">
        <img
          className="w-full h-full object-contain"
          src={row.original.productImages?.[0]?.imageUrl ?? "/productImages.png"}
          alt={row.original.name}
        />
      </div>
    ),
  },
  {
    header: "Product Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
  },
  {
    header: "Category",
    cell: ({ row }) => (
      <Badge className="bg-blue-500">
        {row.original.category?.name || "No Category"}
      </Badge>
    ),
  },
  {
    header: "Price",
    cell: ({ row }) => (
      <Badge className="bg-blue-500">
        ${Number(row.original.price).toFixed(2)}
      </Badge>
    ),
  },
  {
    header: "Discount",
    cell: ({ row }) => {
      const percent = Number(row.original.discountPercent) || 0;
      if (percent <= 0) return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <Badge className="bg-orange-500">
          <Percent className="h-3 w-3" />
          {percent}% off
        </Badge>
      );
    },
  },
  {
    header: "Expire Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.expireDate || "—"}
      </span>
    ),
  },
  {
    id: "stock",
    accessorKey: "qty",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <button
          onClick={() => {
            if (isSorted === "asc") column.clearSorting();
            else column.toggleSorting(true);
          }}
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          Stock
          {isSorted === "asc" && (
            <ArrowUp className="h-3 w-3 text-indigo-500" />
          )}
          {isSorted === "desc" && (
            <ArrowDown className="h-3 w-3 text-indigo-500" />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      const qty = row.original.qty ?? 0;
      return (
        <Badge
          className={
            qty === 0
              ? "bg-red-500"
              : qty <= 10
              ? "bg-yellow-500"
              : "bg-green-500"
          }
        >
          {qty}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            <SquarePen /> Edit
          </DropdownMenuItem>

          {onViewBatches && (
            <DropdownMenuItem onClick={() => onViewBatches(row.original)}>
              View Batches
            </DropdownMenuItem>
          )}

          {onAdjustStock && (
            <DropdownMenuItem onClick={() => onAdjustStock(row.original)}>
              <Settings className="text-purple-500" /> Adjust Stock
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => onDelete(row.original)}>
            <Trash2 className="text-red-500" /> Delete
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
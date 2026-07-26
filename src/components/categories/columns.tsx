

import type { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import { MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import {  format,  } from "date-fns";
import type { ICategory } from "../../types/category";


interface Props{
  onEdit : (Category: ICategory) => void;
  onDelete : (Category: ICategory) => void;
}


export const columns =({onEdit, onDelete}: Props): ColumnDef<ICategory>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    header: "Category Name",
    cell: ({ row }) => <div>{row.original.name}</div>,
  },
  {
    header: "Created At",
     cell: ({ row }) => (
      <div>{format(row.original.createdAt, "yyyy-MM-dd hh:mm a")}</div>
    ),
  },
 
  {
    id: "actions",
    cell: ({ row }) => {
      console.log("row", row)
      return (
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
            <DropdownMenuItem  onClick={() =>  onDelete(row.original)}>
              <Trash2 className="text-red-500" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
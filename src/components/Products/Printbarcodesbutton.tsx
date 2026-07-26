import { useState } from "react";
import { Printer, Loader2, ChevronDown } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

import { Label } from "../ui/label";

import type { IProduct } from "../../types/product";
import { printAllBarcodes, printSelectedBarcodes } from "@/service/product.service";
import { Checkbox } from "@radix-ui/react-checkbox";

interface Props {
  products: IProduct[];
}

const PrintBarcodesButton = ({ products }: Props) => {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ─── TanStack Form ────────────────────────────────────────
  const form = useForm({
    defaultValues: {
      selectedIds: [] as number[],
    },
    onSubmit: async ({ value }) => {
      console.log("🔍 PrintBarcodes — onSubmit fired. value.selectedIds:", value.selectedIds);
      if (value.selectedIds.length === 0) return;
      setLoading(true);
      try {
        await printSelectedBarcodes(value.selectedIds);
        setDialogOpen(false);
        form.reset();
      } catch (err) {
        toast.error("Failed to print selected barcodes. Please try again.");
        console.error("Print selected barcodes error:", err);
      } finally {
        setLoading(false);
      }
    },
  });

  // ─── Print all ────────────────────────────────────────────
  const handlePrintAll = async () => {
    setLoading(true);
    try {
      await printAllBarcodes();
    } catch (err) {
      toast.error("Failed to print all barcodes. Please try again.");
      console.error("Print all barcodes error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Open dialog & reset form ─────────────────────────────
  const handleOpenSelect = () => {
    form.reset();
    setDialogOpen(true);
  };

  return (
    <>
      {/* ─── Dropdown trigger ──────────────────────────────── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            Print Barcodes
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handlePrintAll}>
            <Printer className="mr-2 h-4 w-4" />
            Print all products
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleOpenSelect}>
            <Printer className="mr-2 h-4 w-4" />
            Select products to print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ─── Select products dialog ────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select products to print</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field name="selectedIds">
              {(field) => {
                const allChecked =
                  field.state.value.length === products.length &&
                  products.length > 0;

                const indeterminate =
                  field.state.value.length > 0 &&
                  field.state.value.length < products.length;

                const toggleAll = () => {
                  if (allChecked) {
                    field.handleChange([]);
                  } else {
                    field.handleChange(products.map((p) => p.id));
                  }
                };

                const toggleOne = (id: number) => {
                  const current = field.state.value;
                  if (current.includes(id)) {
                    field.handleChange(current.filter((v) => v !== id));
                  } else {
                    field.handleChange([...current, id]);
                  }
                };

                return (
                  <>
                    {/* Select all row */}
                    <div className="flex items-center gap-2 py-2 border-b">
                      <Checkbox
                        id="select-all"
                        checked={indeterminate ? "indeterminate" : allChecked}
                        onCheckedChange={toggleAll}
                      />
                      <Label
                        htmlFor="select-all"
                        className="text-sm font-medium cursor-pointer select-none"
                      >
                        {allChecked
                          ? "Deselect all"
                          : `Select all (${products.length})`}
                      </Label>
                      {field.state.value.length > 0 && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {field.state.value.length} selected
                        </span>
                      )}
                    </div>

                    {/* Product list */}
                    <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                      {products.map((product) => (
                        <label
                          key={product.id}
                          htmlFor={`product-${product.id}`}
                          className="flex items-center gap-3 px-1 py-1.5 rounded-md hover:bg-muted cursor-pointer select-none"
                        >
                          <Checkbox
                            id={`product-${product.id}`}
                            checked={field.state.value.includes(product.id)}
                            onCheckedChange={() => toggleOne(product.id)}
                          />
                          <span className="flex-1 text-sm truncate">
                            {product.name}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            ${Number(product.price).toFixed(2)}
                          </span>
                        </label>
                      ))}
                    </div>
                  {/* Footer with buttons — must be INSIDE the render prop */}
                  {/* so field.state.value is accessible */}
                  <DialogFooter className="gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        field.state.value.length === 0 || loading
                      }
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Printer className="mr-2 h-4 w-4" />
                      )}
                      Print{" "}
                      {field.state.value.length > 0
                        ? `(${field.state.value.length})`
                        : ""}
                    </Button>
                  </DialogFooter>
                </>
              );
            }}
          </form.Field>
        </form>
      </DialogContent>
    </Dialog>
  </>
  );
};

export default PrintBarcodesButton;
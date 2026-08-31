import { CirclePlus, Settings, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IProduct } from "../types/product";

import { Spinner } from "../components/ui/spinner";
import { getAccessToken } from "../utils/TokenStorage";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import ProductForm from "../components/Products/ProductForm";
import { DataTable } from "../components/data-table";
import { columns } from "../components/Products/columns";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { useProduct, useDeleteProduct, useStockOut } from "../hooks/useProduct";
import { toast } from "sonner";
import PrintBarcodesButton from "@/components/Products/Printbarcodesbutton";

const Product = () => {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | undefined>(undefined);

  // ── Adjustment / Damage dialog ───────────────────────────
  const [adjOpen, setAdjOpen] = useState(false);
  const [adjProduct, setAdjProduct] = useState<IProduct | null>(null);
  const [adjQty, setAdjQty] = useState(1);
  const [adjReason, setAdjReason] = useState("");
  const [adjType, setAdjType] = useState<"ADJUSTMENT" | "DAMAGE">("ADJUSTMENT");

  const { mutate: stockOutMutate } = useStockOut();

  const openAdjDialog = (product: IProduct, type: "ADJUSTMENT" | "DAMAGE") => {
    setAdjProduct(product);
    setAdjType(type);
    setAdjQty(1);
    setAdjReason("");
    setAdjOpen(true);
  };

  const handleStockOut = () => {
    if (!adjProduct || !adjQty || adjQty <= 0) return;
    if (!adjReason.trim()) {
      toast.error("Reason is required for stock adjustments");
      return;
    }
    stockOutMutate(
      { id: adjProduct.id, qty: adjQty, type: adjType, reason: adjReason.trim() },
      {
        onSuccess: () => setAdjOpen(false),
      }
    );
  };

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      navigate("/login");
    }
  }, [navigate]);

  const { data: productData, isLoading } = useProduct(search, page, limit);
  const { mutate: deleteProductMutate } = useDeleteProduct();

  const pagination = productData?.pagination;
  const totalPages = Math.ceil((pagination?.total || 0) / (pagination?.limit || 1));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCloseForm = () => {
    setOpen(false);
    setSelectedProduct(undefined);
  };

  const onEdit = (product: IProduct) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const onDelete = (product: IProduct) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProductMutate(product.id);
    }
  };

  const onViewBatches = (product: IProduct) => {
    navigate(`/admin/products/${product.id}/batches`);
  };

  const handlePrevPage = () => {
    if (pagination?.prevPage) setPage(pagination.prevPage);
  };

  const handleNextPage = () => {
    if (pagination?.nextPage) setPage(pagination.nextPage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      {/* ─── Toolbar ─────────────────────────────────────── */}
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Input
            className="w-50"
            placeholder="Search product..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {/* ─── Right actions ───────────────────────────── */}
        <div className="flex items-center gap-2">
          <PrintBarcodesButton products={productData?.data ?? []} />  
          <Button onClick={() => setOpen(true)}>
            <CirclePlus className="mr-2 h-4 w-4" /> Create
          </Button>
        </div>
      </div>

      {/* ─── Product Form Dialog ──────────────────────────── */}
      <ProductForm
        open={open}
        setOpen={handleCloseForm}
        product={selectedProduct}
      />

      <DataTable
        columns={columns({ onEdit, onDelete, onViewBatches, onRecordAdjustment: (p) => openAdjDialog(p, "ADJUSTMENT"), onRecordDamage: (p) => openAdjDialog(p, "DAMAGE") })}
        data={productData?.data ?? []}
      />

      {/* ── Adjustment / Damage Dialog ────────────────────── */}
      <Dialog open={adjOpen} onOpenChange={setAdjOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjType === "DAMAGE" ? "Record Damage" : "Record Adjustment"}
            </DialogTitle>
            <DialogDescription>
              {adjProduct?.name} — Current stock: {adjProduct?.qty ?? 0}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={adjType}
                onValueChange={(v) => setAdjType(v as "ADJUSTMENT" | "DAMAGE")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  <SelectItem value="DAMAGE">Damage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity to Remove</label>
              <Input
                type="number"
                min={1}
                max={adjProduct?.qty ?? 0}
                value={adjQty}
                onChange={(e) => setAdjQty(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason (required)</label>
              <Textarea
                placeholder={adjType === "DAMAGE" ? "e.g. Broken during handling" : "e.g. Physical count correction"}
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjOpen(false)}>Cancel</Button>
            <Button
              variant={adjType === "DAMAGE" ? "destructive" : "default"}
              onClick={handleStockOut}
              disabled={!adjQty || adjQty <= 0 || !adjReason.trim()}
            >
              {adjType === "DAMAGE" ? "Record Damage" : "Apply Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Footer ───────────────────────────────────────── */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Rows per page</p>
          <Select
            defaultValue="10"
            onValueChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-20" id="select-rows-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>  
                <SelectItem value="100">100</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {pagination?.total !== undefined && (
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-medium">{pagination.total}</span> products
            </p>
          )}
        </div>

        <Pagination className="flex justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePrevPage}
                className={!pagination?.prevPage ? "pointer-events-none opacity-40" : "cursor-pointer"}
              />
            </PaginationItem>
            {pages.map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === pagination?.currentPage}
                  onClick={() => setPage(p)}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
                className={!pagination?.nextPage ? "pointer-events-none opacity-40" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default Product;
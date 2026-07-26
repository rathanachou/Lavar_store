import { CirclePlus } from "lucide-react";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { useProduct, useDeleteProduct } from "../hooks/useProduct";
import PrintBarcodesButton from "@/components/Products/Printbarcodesbutton";

const Product = () => {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | undefined>(undefined);

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
            className="w-[200px]"
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
        columns={columns({ onEdit, onDelete })}
        data={productData?.data ?? []}
      />

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
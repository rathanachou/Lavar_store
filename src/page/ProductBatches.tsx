import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/AuthContext";
import { isAdmin } from "@/utils/auth";
import type { IProductBatch } from "@/types/product";
import { useProductBatches, useBatchDetail, useCreateBatch } from "@/hooks/useInventory";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  XCircle,
  CheckCircle,
  Calendar,
  Hash,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  RotateCcw,
  Settings,
  Trash2,
  Clock,
  Package,
  Eye,
} from "lucide-react";

const EXPIRY_OPTIONS = [
  { value: "", label: "All" },
  { value: "expired", label: "Expired" },
  { value: "expiring_soon", label: "Expiring Soon (7 days)" },
  { value: "ok", label: "OK" },
];

function getExpiryStatus(expireDate: string | null): "expired" | "expiring_soon" | "ok" {
  if (!expireDate) return "ok";
  const exp = new Date(expireDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 7) return "expiring_soon";
  return "ok";
}

function getStatusBadge(batch: IProductBatch) {
  const expiry = getExpiryStatus(batch.expireDate);
  if (expiry === "expired" || batch.qty === 0) {
    return { label: "Expired", className: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> };
  }
  if (expiry === "expiring_soon") {
    return { label: "Expiring Soon", className: "bg-orange-100 text-orange-800", icon: <Clock className="w-3 h-3" /> };
  }
  if (batch.qty <= 10) {
    return { label: "Low Stock", className: "bg-yellow-100 text-yellow-800", icon: <AlertTriangle className="w-3 h-3" /> };
  }
  return { label: "Available", className: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> };
}

export default function ProductBatches() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);
  const adminOnly = isAdmin();

  const [expiryFilter, setExpiryFilter] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<IProductBatch | null>(null);

  // "Receive Stock" dialog state
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiveQty, setReceiveQty] = useState("");
  const [receiveExpiry, setReceiveExpiry] = useState("");
  const [receiveBatchNo, setReceiveBatchNo] = useState("");
  const [receiveCostPrice, setReceiveCostPrice] = useState("");

  const { data, isLoading, error } = useProductBatches(productId, { limit: 100 });
  const { data: batchDetail } = useBatchDetail(selectedBatch?.id || 0);
  const createBatchMut = useCreateBatch();

  const batches: IProductBatch[] = data?.data ?? [];

  const filtered = useMemo(() => {
    if (!expiryFilter) return batches;
    return batches.filter((batch) => getExpiryStatus(batch.expireDate) === expiryFilter);
  }, [batches, expiryFilter]);

  const summary = useMemo(() => {
    let totalBatches = filtered.length;
    let totalQty = 0;
    let available = 0;
    let lowStock = 0;
    let expiringSoon = 0;
    let expired = 0;

    for (const batch of filtered) {
      const qty = batch.qty || 0;
      totalQty += qty;
      const status = getStatusBadge(batch);
      if (status.label === "Available") available++;
      else if (status.label === "Low Stock") lowStock++;
      else if (status.label === "Expiring Soon") expiringSoon++;
      else if (status.label === "Expired") expired++;
    }
    return { totalBatches, totalQty, available, lowStock, expiringSoon, expired };
  }, [filtered]);

  // ── Receive Stock handler ──────────────────────────────────
  const handleReceiveStock = async () => {
    const qty = Number(receiveQty);
    if (!qty || qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    try {
      await createBatchMut.mutateAsync({
        productId,
        data: {
          qty,
          expireDate: receiveExpiry || undefined,
          batchNumber: receiveBatchNo || undefined,
          costPrice: receiveCostPrice ? Number(receiveCostPrice) : undefined,
        },
      });
      toast.success(`Received ${qty} units — new batch created`);
      setReceiveOpen(false);
      setReceiveQty("");
      setReceiveExpiry("");
      setReceiveBatchNo("");
      setReceiveCostPrice("");
    } catch (err) {
      // toast already shown by onError in hook
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-red-500 text-sm">Failed to load batches</p>
        <Button onClick={() => navigate("/admin/products")}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Product Batches</h2>
          <p className="text-sm text-muted-foreground">
            Product ID: {productId} · {filtered.length} batch{filtered.length !== 1 ? "es" : ""}
          </p>
        </div>
        {adminOnly && (
          <Button onClick={() => setReceiveOpen(true)}>
            <ArrowUpCircle className="mr-2 h-4 w-4" /> Receive Stock
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate("/admin/products")}>
          Back to Products
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard label="Total Batches" value={String(summary.totalBatches)} accent="#3b82f6" />
        <SummaryCard label="Total Qty" value={String(summary.totalQty)} accent="#8b5cf6" />
        <SummaryCard label="Available" value={String(summary.available)} accent="#22c55e" />
        <SummaryCard label="Expiring Soon" value={String(summary.expiringSoon)} accent="#f59e0b" />
        <SummaryCard label="Expired" value={String(summary.expired)} accent="#ef4444" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={expiryFilter} onValueChange={setExpiryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Expiry Status" />
          </SelectTrigger>
          <SelectContent>
            {EXPIRY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {expiryFilter && (
          <Button variant="outline" size="sm" onClick={() => setExpiryFilter("")}>
            Clear Filter
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2 border rounded-md">
          <Package className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No batches found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Number</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Received Date</TableHead>
                <TableHead>Cost Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((batch) => {
                const badge = getStatusBadge(batch);
                const expiry = getExpiryStatus(batch.expireDate);

                return (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-mono">{batch.batchNumber || `#${batch.id}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{batch.qty}</span>
                    </TableCell>
                    <TableCell>
                      {batch.expireDate ? (
                        <span className={`text-sm ${expiry === "expired" ? "text-red-600 font-medium" : expiry === "expiring_soon" ? "text-orange-600 font-medium" : ""}`}>
                          {batch.expireDate}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {batch.receivedDate ? new Date(batch.receivedDate).toLocaleDateString() : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {batch.costPrice != null ? (
                        <span className="text-sm">${Number(batch.costPrice).toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${badge.className}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setSelectedBatch(batch)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Batch Detail Dialog */}
      {selectedBatch && (
        <Dialog open={!!selectedBatch} onOpenChange={(open) => !open && setSelectedBatch(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Batch Details</DialogTitle>
            </DialogHeader>
            <BatchDetailContent batch={selectedBatch} product={selectedBatch.product} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Receive Stock Dialog */}
      <Dialog open={receiveOpen} onOpenChange={(open) => !open && setReceiveOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receive Stock</DialogTitle>
            <DialogDescription>
              Add a new batch for Product ID {productId}. This creates a separate batch with its own expiry tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Quantity <span className="text-red-400">*</span></label>
              <Input
                type="number"
                min={1}
                value={receiveQty}
                onChange={(e) => setReceiveQty(e.target.value)}
                placeholder="Enter quantity received"
                disabled={createBatchMut.isPending}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Expiry Date (optional)</label>
              <Input
                type="date"
                value={receiveExpiry}
                onChange={(e) => setReceiveExpiry(e.target.value)}
                disabled={createBatchMut.isPending}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Batch Number (optional)</label>
              <Input
                value={receiveBatchNo}
                onChange={(e) => setReceiveBatchNo(e.target.value)}
                placeholder="e.g. BATCH-2026-09"
                disabled={createBatchMut.isPending}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Cost Price (optional)</label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={receiveCostPrice}
                onChange={(e) => setReceiveCostPrice(e.target.value)}
                placeholder="e.g. 5.00"
                disabled={createBatchMut.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveOpen(false)} disabled={createBatchMut.isPending}>Cancel</Button>
            <Button onClick={handleReceiveStock} disabled={createBatchMut.isPending}>
              {createBatchMut.isPending ? "Receiving..." : "Receive Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg border p-3 flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold" style={{ color: accent }}>{value}</p>
    </div>
  );
}

function BatchDetailContent({ batch, product }: { batch: IProductBatch; product: any }) {
  const expiry = getExpiryStatus(batch.expireDate);
  const badge = getStatusBadge(batch);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <DetailField label="Product" value={product?.name || `#${batch.productId}`} />
        <DetailField label="Batch Number" value={batch.batchNumber || `#${batch.id}`} />
        <DetailField label="Quantity" value={String(batch.qty)} />
        {batch.expireDate && (
          <DetailField
            label="Expiry Date"
            value={batch.expireDate}
            badge={expiry === "expired" ? { label: "Expired", className: "bg-red-100 text-red-800" } : expiry === "expiring_soon" ? { label: "Expiring Soon", className: "bg-orange-100 text-orange-800" } : null}
          />
        )}
        {batch.receivedDate && (
          <DetailField label="Received Date" value={batch.receivedDate} />
        )}
        {batch.costPrice != null && (
          <DetailField label="Cost Price" value={`$${Number(batch.costPrice).toFixed(2)}`} />
        )}
      </div>
    </div>
  );
}

function DetailField({ label, value, badge }: { label: string; value: string; badge?: { label: string; className: string } | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium">
        {value}
        {badge && (
          <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${badge.className}`}>
            {badge.label}
          </span>
        )}
      </p>
    </div>
  );
}

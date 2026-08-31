import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { IInventory } from "@/types/inventory";
import { useInventory } from "@/hooks/useInventory";
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Package,
  Search,
  Hash,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Eye,
} from "lucide-react";

const STOCK_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "Available", label: "Available" },
  { value: "Low Stock", label: "Low Stock" },
  { value: "Out of Stock", label: "Out of Stock" },
  { value: "Expired", label: "Expired" },
];

const EXPIRY_STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "expired", label: "Expired" },
  { value: "expiring_soon", label: "Expiring Soon (7 days)" },
  { value: "ok", label: "OK" },
];

function getExpiryStatus(
  expireDate: string | null
): "expired" | "expiring_soon" | "ok" {
  if (!expireDate) return "ok";
  const exp = new Date(expireDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 7) return "expiring_soon";
  return "ok";
}

function getStockStatusBadge(status: string, availableQty: number) {
  switch (status) {
    case "EXPIRED":
      return { label: "Expired", className: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> };
    case "OUT_OF_STOCK":
      return { label: "Out of Stock", className: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> };
    case "LOW_STOCK":
      return { label: "Low Stock", className: "bg-yellow-100 text-yellow-800", icon: <AlertTriangle className="w-3 h-3" /> };
    default:
      if (availableQty === 0)
        return { label: "Out of Stock", className: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> };
      if (availableQty <= 10)
        return { label: "Low Stock", className: "bg-yellow-100 text-yellow-800", icon: <AlertTriangle className="w-3 h-3" /> };
      return { label: "Available", className: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> };
  }
}

function getExpiryBadge(expireDate: string | null) {
  if (!expireDate) return null;
  const exp = new Date(expireDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0)
    return { label: "Expired", className: "bg-red-100 text-red-800" };
  if (daysLeft <= 7)
    return { label: `${daysLeft}d left`, className: "bg-orange-100 text-orange-800" };
  return { label: `${daysLeft}d left`, className: "bg-green-100 text-green-800" };
}

export default function Inventory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [expiryStatus, setExpiryStatus] = useState("");
  const [selectedInventory, setSelectedInventory] = useState<IInventory | null>(null);

  // Track which summary card is currently active (for highlight + toggle-off)
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const { data, isLoading, error } = useInventory({
    search,
    stockStatus: stockStatus || undefined,
    expiryStatus: expiryStatus || undefined,
    limit: 100,
  });

  const inventoryItems: IInventory[] = data?.data ?? [];

  // Keep the dropdown and active card in sync — when the dropdown changes,
  // reflect it in the active card state.
  const handleStockStatusChange = (value: string) => {
    setStockStatus(value);
    setActiveCard(value || null);
  };

  const filtered = useMemo(() => {
    let items = inventoryItems;
    if (stockStatus) {
      items = items.filter((item) => {
        const badge = getStockStatusBadge(item.stockStatus || "", item.availableQty);
        return badge.label === stockStatus;
      });
    }
    if (expiryStatus) {
      items = items.filter((item) => {
        const status = getExpiryStatus(item.productBatch?.expireDate || null);
        return status === expiryStatus;
      });
    }
    return items;
  }, [inventoryItems, stockStatus, expiryStatus]);

  // Card click handler — applies status filter or clears on toggle-off
  const handleCardClick = (statusLabel: string | null) => {
    if (activeCard === statusLabel) {
      // Clicking the already-active card clears the filter
      setStockStatus("");
      setActiveCard(null);
    } else {
      setStockStatus(statusLabel || "");
      setActiveCard(statusLabel);
    }
  };

  const summary = useMemo(() => {
    let total = filtered.length;
    let available = 0;
    let lowStock = 0;
    let expired = 0;
    let outOfStock = 0;
    let totalQty = 0;
    let totalAvailable = 0;

    for (const item of filtered) {
      const badge = getStockStatusBadge(item.stockStatus || "", item.availableQty);
      if (badge.label === "Available") available++;
      else if (badge.label === "Low Stock") lowStock++;
      else if (badge.label === "Expired") expired++;
      else if (badge.label === "Out of Stock") outOfStock++;
      totalQty += item.qty;
      totalAvailable += item.availableQty;
    }
    return { total, available, lowStock, expired, outOfStock, totalQty, totalAvailable };
  }, [filtered]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-red-500 text-sm">Failed to load inventory</p>
        <Button onClick={() => navigate("/admin/dashboard")}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Total Items" value={String(summary.total)} accent="#3b82f6" onClick={() => handleCardClick(null)} isActive={activeCard === null} />
        <SummaryCard label="Available" value={String(summary.available)} accent="#22c55e" onClick={() => handleCardClick("Available")} isActive={activeCard === "Available"} />
        <SummaryCard label="Low Stock" value={String(summary.lowStock)} accent="#f59e0b" onClick={() => handleCardClick("Low Stock")} isActive={activeCard === "Low Stock"} />
        <SummaryCard label="Expired" value={String(summary.expired)} accent="#ef4444" onClick={() => handleCardClick("Expired")} isActive={activeCard === "Expired"} />
        <SummaryCard label="Out of Stock" value={String(summary.outOfStock)} accent="#ef4444" onClick={() => handleCardClick("Out of Stock")} isActive={activeCard === "Out of Stock"} />
        <SummaryCard label="Total Qty" value={String(summary.totalQty)} accent="#8b5cf6" onClick={() => handleCardClick(null)} isActive={activeCard === null} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search product, batch, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stockStatus} onValueChange={handleStockStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            {STOCK_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={expiryStatus} onValueChange={setExpiryStatus}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Expiry Status" />
          </SelectTrigger>
          <SelectContent>
            {EXPIRY_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || stockStatus || expiryStatus) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setStockStatus("");
              setExpiryStatus("");
            }}
          >
            Clear
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
          <p className="text-sm text-muted-foreground">No inventory records found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const batch = item.productBatch;
                const product = item.product;
                const expiryBadge = getExpiryBadge(batch?.expireDate || null);
                const statusBadge = getStockStatusBadge(item.stockStatus || "", item.availableQty);

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product?.name || `#${item.productId}`}</p>
                          <p className="text-xs text-muted-foreground">{product?.category?.name || "—"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-mono">{batch?.batchNumber || `#${item.batchId}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{item.qty}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${item.availableQty <= 10 ? "text-orange-600" : "text-green-600"}`}>
                        {item.availableQty}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.reservedQty}</span>
                    </TableCell>
                    <TableCell>
                      {batch?.expireDate ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{batch.expireDate}</span>
                          {expiryBadge && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full w-fit ${expiryBadge.className}`}>
                              {expiryBadge.label}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusBadge.className}`}>
                        {statusBadge.icon}
                        {statusBadge.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setSelectedInventory(item)}
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
      {selectedInventory && (
        <Dialog open={!!selectedInventory} onOpenChange={(open) => !open && setSelectedInventory(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Batch Details</DialogTitle>
            </DialogHeader>
            <BatchDetailContent inventory={selectedInventory} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
  isActive,
  onClick,
}: {
  label: string;
  value: string;
  accent: string;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border p-3 flex flex-col gap-1 transition-colors ${
        isActive
          ? "border-blue-400 bg-blue-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold" style={{ color: accent }}>{value}</p>
    </div>
  );
}

function BatchDetailContent({ inventory }: { inventory: IInventory }) {
  const batch = inventory.productBatch;
  const product = inventory.product;
  const expiryBadge = getExpiryBadge(batch?.expireDate || null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <DetailField label="Product" value={product?.name || `#${inventory.productId}`} />
        <DetailField label="Category" value={product?.category?.name || "—"} />
        <DetailField label="Batch Number" value={batch?.batchNumber || `#${inventory.batchId}`} />
        <DetailField label="Quantity" value={String(inventory.qty)} />
        <DetailField label="Available" value={String(inventory.availableQty)} accent={inventory.availableQty <= 10 ? "orange" : "green"} />
        <DetailField label="Reserved" value={String(inventory.reservedQty)} />
        {batch?.expireDate && (
          <DetailField
            label="Expiry Date"
            value={batch.expireDate}
            badge={expiryBadge}
          />
        )}
        {batch?.receivedDate && (
          <DetailField label="Received Date" value={batch.receivedDate} />
        )}
        {batch?.costPrice != null && (
          <DetailField label="Cost Price" value={`$${Number(batch.costPrice).toFixed(2)}`} />
        )}
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  accent,
  badge,
}: {
  label: string;
  value: string;
  accent?: "green" | "orange" | "red";
  badge?: { label: string; className: string } | null;
}) {
  const colorMap: Record<string, string> = { green: "text-green-600", orange: "text-orange-600", red: "text-red-600" };
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${accent ? colorMap[accent] : ""}`}>
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

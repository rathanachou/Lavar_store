import { useState, useMemo, useEffect } from "react";
import type { IStockMovement } from "@/types/inventory";
import { useStockMovements } from "@/hooks/useInventory";
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
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  RotateCcw,
  Settings,
  Trash2,
  CalendarClock,
  Package,
  User,
  Search,
} from "lucide-react";

const MOVEMENT_TYPES = [
  { value: "", label: "All Types" },
  { value: "PURCHASE", label: "PURCHASE", icon: <ArrowUpCircle className="w-3 h-3" /> },
  { value: "SALE", label: "SALE", icon: <ArrowDownCircle className="w-3 h-3" /> },
  { value: "RETURN", label: "RETURN", icon: <RotateCcw className="w-3 h-3" /> },
  { value: "ADJUSTMENT", label: "ADJUSTMENT", icon: <Settings className="w-3 h-3" /> },
  { value: "DAMAGE", label: "DAMAGE", icon: <Trash2 className="w-3 h-3" /> },
  { value: "EXPIRED", label: "EXPIRED", icon: <CalendarClock className="w-3 h-3" /> },
];

function getMovementBadge(type: string, qty: number) {
  const isPositive = qty > 0;
  switch (type) {
    case "PURCHASE":
      return { label: "PURCHASE", className: "bg-green-100 text-green-800", icon: <ArrowUpCircle className="w-3 h-3" /> };
    case "SALE":
      return { label: "SALE", className: "bg-red-100 text-red-800", icon: <ArrowDownCircle className="w-3 h-3" /> };
    case "RETURN":
      return { label: "RETURN", className: "bg-blue-100 text-blue-800", icon: <RotateCcw className="w-3 h-3" /> };
    case "ADJUSTMENT":
      return { label: "ADJUSTMENT", className: "bg-purple-100 text-purple-800", icon: <Settings className="w-3 h-3" /> };
    case "DAMAGE":
      return { label: "DAMAGE", className: "bg-orange-100 text-orange-800", icon: <Trash2 className="w-3 h-3" /> };
    case "EXPIRED":
      return { label: "EXPIRED", className: "bg-gray-100 text-gray-800", icon: <CalendarClock className="w-3 h-3" /> };
    default:
      return { label: type, className: "bg-gray-100 text-gray-800", icon: null };
  }
}

export default function StockMovements() {
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  // Track which movement-type card is currently active (null = all types)
  const [activeType, setActiveType] = useState<string | null>(null);

  // Sanitize date values — only allow YYYY-MM-DD or empty string.
  // Guards against corrupted values (e.g. "12/dd/0003") from stale
  // state or external injection.
  const isValidDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
  const safeStartDate = isValidDate(startDate) ? startDate : "";
  const safeEndDate   = isValidDate(endDate)   ? endDate   : "";

  // If state holds an invalid date, reset it after mount/update so the
  // input shows empty instead of a malformed value.
  useEffect(() => {
    if (startDate !== safeStartDate) setStartDate(safeStartDate);
    if (endDate !== safeEndDate)     setEndDate(safeEndDate);
  }, [startDate, endDate, safeStartDate, safeEndDate]);

  const { data, isLoading, error } = useStockMovements({
    type: type || undefined,
    startDate: safeStartDate || undefined,
    endDate: safeEndDate || undefined,
    limit: 200,
  });

  const movements: IStockMovement[] = data?.data ?? [];

  // Keep the dropdown and active card in sync
  const handleTypeChange = (value: string) => {
    setType(value);
    setActiveType(value || null);
  };

  const filtered = useMemo(() => {
    let items = movements;
    if (type) {
      items = items.filter((m) => m.type === type);
    }
    if (safeStartDate) {
      items = items.filter((m) => m.createdAt >= safeStartDate);
    }
    if (safeEndDate) {
      items = items.filter((m) => m.createdAt <= safeEndDate + "T23:59:59");
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (m) =>
          m.product?.name?.toLowerCase().includes(q) ||
          m.batch?.batchNumber?.toLowerCase().includes(q) ||
          m.reason?.toLowerCase().includes(q) ||
          m.reference?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [movements, type, safeStartDate, safeEndDate, search]);

  // Card click handler — toggles filter on/off
  const handleCardClick = (movementType: string | null) => {
    if (activeType === movementType) {
      setType("");
      setActiveType(null);
    } else {
      setType(movementType || "");
      setActiveType(movementType);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-red-500 text-sm">Failed to load stock movements</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {MOVEMENT_TYPES.filter((t) => t.value).map((type) => {
          const count = filtered.filter((m) => m.type === type.value).length;
          const isActive = activeType === type.value;
          return (
            <div
              key={type.value}
              onClick={() => handleCardClick(type.value)}
              className={`rounded-lg border p-3 flex flex-col gap-1 transition-colors ${
                isActive
                  ? "border-blue-400 bg-blue-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              } cursor-pointer`}
            >
              <p className="text-xs text-muted-foreground">{type.label}</p>
              <p className="text-lg font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search product, batch, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Movement Type" />
          </SelectTrigger>
          <SelectContent>
            {MOVEMENT_TYPES.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={safeStartDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-40"
          placeholder="From"
        />
        <Input
          type="date"
          value={safeEndDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-40"
          placeholder="To"
        />
        {(search || type || safeStartDate || safeEndDate) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setType("");
              setStartDate("");
              setEndDate("");
              setActiveType(null);
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
          <p className="text-sm text-muted-foreground">No stock movements found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((movement) => {
                const badge = getMovementBadge(movement.type, movement.qty);
                const date = new Date(movement.createdAt);
                const dateStr = date.toLocaleDateString();
                const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                return (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{dateStr}</span>
                        <span className="text-xs text-muted-foreground">{timeStr}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{movement.product?.name || `#${movement.productId}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{movement.batch?.batchNumber || `#${movement.batchId}`}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${badge.className}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-semibold ${movement.qty > 0 ? "text-green-600" : "text-red-600"}`}>
                        {movement.qty > 0 ? `+${movement.qty}` : movement.qty}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{movement.reason || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono text-muted-foreground">{movement.reference || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{movement.user?.name || `#${movement.userId}`}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

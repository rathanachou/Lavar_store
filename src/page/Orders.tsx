/* cSpell:ignore KHQR */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useOrders,
  useOrderById,
  useProcessReturn,
} from "@/hooks/useOrder";
// Re-export mutation hooks so other modules that import from
// "./Orders" (e.g. PosPage, useCart) keep working after the page
// component was rewritten. Canonical definitions stay in useOrder.ts.
export {
  useOrders,
  useOrderById,
  useCreateOrder,
  useCancelOrder,
  useCompleteOrder,
  useGenerateOrderDoc,
  useProcessReturn,
} from "@/hooks/useOrder";
import type { GetOrdersParams } from "@/service/orders.service";
import type { IReturn } from "@/types/inventory";
import { toast } from "sonner";
import {
  Search,
  Calendar,
  RotateCcw,
  Eye,
  X,
  Loader2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// ─── Helpers ────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function formatCurrency(amount: number) {
  return `$${Number(amount).toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString([], {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface OrderDetailRow {
  id: number;
  productId: number;
  qty: number;
  amount: number;
  productName?: string;
  productPrice?: number;
  product?: { name: string };
  /** Quantity returned for this line item (0 = none, < qty = partial, = qty = full) */
  returnedQty?: number;
  /** Full return records for this line item */
  returns?: IReturn[];
}

interface OrderRow {
  id: number;
  orderNumber?: string;
  status: string;
  total: number;
  createdAt: string;
  orderDetails?: OrderDetailRow[];
  payments?: { method: string }[];
  user?: { firstName?: string; lastName?: string; email?: string };
  /** Return records for this order (from GET /orders/:id) */
  returns?: IReturn[];
}

interface ReturnOrderData {
  id: number;
  orderNumber?: string;
  total: number;
  orderDetails?: OrderDetailRow[];
}

// ─── Badge helpers ──────────────────────────────────────────

function getReturnBadge(rq: number, qty: number) {
  if (rq <= 0) return null;
  if (rq >= qty) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Returned</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Partially Returned</span>;
}

function fmtDateTime(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString([], {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function processorName(u?: { firstName?: string; lastName?: string; email?: string }) {
  if (!u) return "—";
  const full = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
  return full || u.email || "—";
}

// ─── Main Page ──────────────────────────────────────────────

export default function Orders() {
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [last24h, setLast24h] = useState(false);

  // Detail view
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);

  // Return dialog
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState<ReturnOrderData | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const [returnQty, setReturnQty] = useState("");
  const [returnReason, setReturnReason] = useState("");

  // Queries
  const params: GetOrdersParams = useMemo(() => {
    const p: GetOrdersParams = { search, status: statusFilter || undefined, limit: 50 };
    if (last24h) {
      p.dateFrom = yesterdayStr();
      p.dateTo   = todayStr();
    } else {
      if (dateFrom) p.dateFrom = dateFrom;
      if (dateTo)   p.dateTo   = dateTo;
    }
    return p;
  }, [search, statusFilter, dateFrom, dateTo, last24h]);

  const { data, isLoading, isError } = useOrders(params);
  const orders: OrderRow[] = data?.data ?? [];

  // Detail query — only fetch when an ID is selected
  const { data: detailData, isLoading: detailLoading } = useOrderById(detailOrderId!, {
    enabled: !!detailOrderId,
  });
  const detailOrder = (detailData?.data ?? null) as OrderRow | null;

  // Return mutation
  const { mutate: mutateReturn, isPending: isReturning } = useProcessReturn();

  // ── Clear all filters ────────────────────────────────────
  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setStatusFilter("");
    setLast24h(false);
  };

  // ── Open return dialog ───────────────────────────────────
  const openReturn = (order: OrderRow) => {
    setReturnOrder({
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      orderDetails: order.orderDetails,
    });
    setSelectedDetailId(null);
    setReturnQty("");
    setReturnReason("");
    setReturnOpen(true);
  };

  // ── Submit return ────────────────────────────────────────
  const submitReturn = async () => {
    if (!returnOrder || !selectedDetailId) {
      toast.error("Please select an item to return");
      return;
    }
    const qty = Number(returnQty);
    if (!qty || qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    const detail = returnOrder.orderDetails?.find(
      (d) => d.id === Number(selectedDetailId)
    );
    if (!detail) {
      toast.error("Selected item not found in this order");
      return;
    }
    // Cap at what hasn't already been returned on this line
    const alreadyReturned = detail.returnedQty ?? 0;
    const maxReturnable = detail.qty - alreadyReturned;
    if (qty > maxReturnable) {
      toast.error(`Return qty (${qty}) exceeds remaining returnable qty (${maxReturnable})`);
      return;
    }

    // Await the mutation so the refetch resolves before we close the dialog.
    // The hook's onSuccess already awaits invalidateQueries, so when this
    // promise resolves the cache is fresh.
    try {
      await new Promise<void>((resolve, reject) => {
        mutateReturn(
          {
            orderId: returnOrder.id,
            orderDetailId: Number(selectedDetailId),
            qty,
            reason: returnReason.trim() || undefined,
          },
          {
            onSuccess: () => {
              const returnedItem = returnOrder.orderDetails?.find(
                (d) => d.id === Number(selectedDetailId)
              );
              toast.success(
                `Returned ${qty} x "${returnedItem?.productName ?? returnedItem?.product?.name}" — Stock restored`
              );
              resolve();
            },
            onError: (err: Error) => reject(err),
          }
        );
      });
      setReturnOpen(false);
      setReturnOrder(null);
      setSelectedDetailId(null);
      setReturnQty("");
      setReturnReason("");
    } catch (err) {
      // onError in the hook already surfaces a toast; this catch
      // prevents the dialog from closing on a failed return.
    }
  };

  // Get selected detail object for qty max
  const selectedDetail = returnOrder?.orderDetails?.find(
    (d) => d.id === Number(selectedDetailId)
  );

  const hasActiveFilters = search || dateFrom || dateTo || statusFilter || last24h;

  // ── Render ───────────────────────────────────────────────

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500 text-sm">Failed to load orders</p>
        <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Orders</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-45">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={last24h ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setLast24h((prev) => !prev);
            if (!last24h) {
              setDateFrom("");
              setDateTo("");
            }
          }}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Last 24 hours
        </Button>

        {!last24h && (
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              max={dateTo || undefined}
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              min={dateFrom || undefined}
            />
          </div>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2 border rounded-md">
          <Package className="h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-400">No orders found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Return</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Payment</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const itemCount = order.orderDetails?.length ?? 0;
                const totalQty = order.orderDetails?.reduce((s, d) => s + d.qty, 0) ?? 0;
                const isCompleted = order.status === "completed";
                const paymentMethod = order.payments?.[0]?.method ?? "—";

                // Determine order-level return indicator
                const details = order.orderDetails ?? [];
                const anyReturned = details.some((d) => (d.returnedQty ?? 0) > 0);
                const allFullReturned = details.length > 0 && details.every((d) => (d.returnedQty ?? 0) >= d.qty);

                return (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {order.orderNumber ?? `#${order.id}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {itemCount} item{itemCount !== 1 ? "s" : ""} ({totalQty} units)
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        order.status === "completed" ? "bg-green-100 text-green-700" :
                        order.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {anyReturned
                        ? getReturnBadge(allFullReturned ? 999 : 0, allFullReturned ? 999 : 0)
                        : null}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500 capitalize">
                      {paymentMethod === "aba" || paymentMethod === "KHQR" ? "ABA PayWay" : paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="View Details"
                          onClick={() => setDetailOrderId(order.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {/* Only show Return button when order is completed AND
                            not every line item is fully returned */}
                        {isCompleted && !allFullReturned && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Process Return"
                            onClick={() => openReturn(order)}
                            disabled={isReturning}
                          >
                            <RotateCcw className="h-4 w-4 text-orange-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Order Detail Dialog ── */}
      <Dialog open={!!detailOrderId} onOpenChange={(open) => !open && setDetailOrderId(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {detailOrder
                ? `${detailOrder.orderNumber ?? `#${detailOrder.id}`} — ${formatDate(detailOrder.createdAt)}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : detailOrder ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    detailOrder.status === "completed" ? "bg-green-100 text-green-700" :
                    detailOrder.status === "cancelled" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{detailOrder.status}</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="font-semibold">{formatCurrency(detailOrder.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Payment</p>
                  <p className="capitalize">{detailOrder.payments?.[0]?.method ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cashier</p>
                  <p>{detailOrder.user
                    ? `${detailOrder.user.firstName ?? ""} ${detailOrder.user.lastName ?? ""}`.trim() || detailOrder.user.email
                    : "—"}</p>
                </div>
              </div>

              {/* Line items with return indicators */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-3 py-2 text-left text-xs text-gray-500">Product</th>
                      <th className="px-3 py-2 text-right text-xs text-gray-500">Qty</th>
                      <th className="px-3 py-2 text-right text-xs text-gray-500">Returned</th>
                      <th className="px-3 py-2 text-right text-xs text-gray-500">Price</th>
                      <th className="px-3 py-2 text-right text-xs text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(detailOrder.orderDetails ?? []).map((d) => {
                      const rq = d.returnedQty ?? 0;
                      return (
                        <tr key={d.id}>
                          <td className="px-3 py-2 text-xs">{d.product?.name ?? d.productName ?? `#${d.productId}`}</td>
                          <td className="px-3 py-2 text-right text-xs">{d.qty}</td>
                          <td className="px-3 py-2 text-right text-xs">
                            {rq > 0 ? (
                              <span className={rq >= d.qty ? "text-purple-600 font-medium" : "text-amber-600 font-medium"}>
                                {rq} / {d.qty}
                              </span>
                            ) : (
                              <span className="text-gray-300">0</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right text-xs">{formatCurrency(d.productPrice ?? d.amount / d.qty)}</td>
                          <td className="px-3 py-2 text-right text-xs font-medium">{formatCurrency(d.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Return history for this order */}
              {detailOrder.returns && detailOrder.returns.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b px-3 py-2">
                    <p className="text-xs font-semibold text-gray-600">Return History</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {detailOrder.returns.map((r) => (
                      <div key={r.id} className="px-3 py-2 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">
                            {r.qty} x {r.product?.name ?? `Item #${r.productId}`}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            r.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : r.status === "CANCELLED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {r.status}
                          </span>
                        </div>
                        {r.reason && <p className="text-gray-500">Reason: {r.reason}</p>}
                        <p className="text-gray-400">
                          Refund: {formatCurrency(r.refundAmount)} &middot; Processed by {processorName(r.processedByUser)} &middot; {fmtDateTime(r.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Return action in detail view */}
              {detailOrder.status === "completed" && !(detailOrder.orderDetails?.every((d) => (d.returnedQty ?? 0) >= d.qty)) && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                    onClick={() => {
                      setDetailOrderId(null);
                      setTimeout(() => openReturn(detailOrder), 150);
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Process Return for this Order
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Order not found.</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOrderId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Return Dialog ── */}
      <Dialog open={returnOpen} onOpenChange={(open) => !open && setReturnOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Return</DialogTitle>
            <DialogDescription>
              {returnOrder
                ? `${returnOrder.orderNumber ?? `Order #${returnOrder.id}`} — Total: ${formatCurrency(returnOrder.total)}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {returnOrder && (
            <div className="space-y-4">
              {/* Item selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Select Item to Return</label>
                <div className="space-y-1">
                  {(returnOrder.orderDetails ?? []).map((d) => {
                    const name = d.product?.name ?? d.productName ?? `Item #${d.productId}`;
                    const isSelected = selectedDetailId === d.id;
                    const rq = d.returnedQty ?? 0;
                    const remaining = d.qty - rq;
                    const fullyReturned = remaining <= 0;

                    return (
                      <label
                        key={d.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          fullyReturned
                            ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                            : isSelected
                              ? "border-blue-400 bg-blue-50 cursor-pointer"
                              : "border-gray-200 hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        <input
                          type="radio"
                          name="return-item"
                          checked={isSelected}
                          disabled={fullyReturned}
                          onChange={() => {
                            if (fullyReturned) return;
                            setSelectedDetailId(d.id);
                            setReturnQty("");
                          }}
                          className="accent-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                          <p className="text-xs text-gray-400">
                            Ordered: {d.qty} &middot; Returned: {rq} &middot; Remaining: {remaining}
                          </p>
                        </div>
                        {fullyReturned && (
                          <span className="text-xs font-semibold text-purple-600 whitespace-nowrap">Fully Returned</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Qty input — max = remaining returnable qty */}
              {selectedDetail && !((selectedDetail.returnedQty ?? 0) >= selectedDetail.qty) && (
                <div className="space-y-1">
                  {(() => {
                    const alreadyReturned = selectedDetail.returnedQty ?? 0;
                    const maxReturnable = selectedDetail.qty - alreadyReturned;
                    return (
                      <>
                        <label className="text-xs font-medium text-gray-600">
                          Return Quantity (max: {maxReturnable})
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={maxReturnable}
                          value={returnQty}
                          onChange={(e) => setReturnQty(e.target.value)}
                          placeholder={`Enter qty (1 – ${maxReturnable})`}
                          disabled={isReturning}
                        />
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Reason */}
              {selectedDetail && !((selectedDetail.returnedQty ?? 0) >= selectedDetail.qty) && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    Reason <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="e.g. Damaged, Wrong item, Customer changed mind..."
                    rows={2}
                    disabled={isReturning}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(false)} disabled={isReturning}>
              Cancel
            </Button>
            <Button
              onClick={submitReturn}
              disabled={isReturning || !selectedDetailId}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isReturning
                ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Processing...</>
                : "Process Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

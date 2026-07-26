"use client";

import { useState } from "react";
import { PackageCheck, PackageX, AlertTriangle,
         ArrowUp, ArrowDown } from "lucide-react";

import { useProductStock, useStockIn, useStockOut } from "@/hooks/useProduct";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Props {
  productId: number;
  productName?: string;
}

type LogEntry = {
  type: "in" | "out";
  qty: number;
  after: number;
  time: string;
};

const StockManagement = ({ productId, productName }: Props) => {
  const [inQty, setInQty] = useState<number>(10);
  const [outQty, setOutQty] = useState<number>(1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [inToday, setInToday] = useState(0);
  const [outToday, setOutToday] = useState(0);

  const { data: stock } = useProductStock(productId);
  const { mutate: addStock, isPending: adding } = useStockIn();
  const { mutate: deductStock, isPending: deducting } = useStockOut();

  const qty = stock?.data?.qty ?? 0;
  const status = stock?.data?.stockStatus;

  // ── Status Badge ────────────────────────────────────────
  const StatusBadge = () => {
    if (status === "OUT_OF_STOCK")
      return <Badge className="bg-red-100 text-red-800">
               <PackageX className="w-3 h-3 mr-1" /> Out of Stock
             </Badge>;
    if (status === "LOW_STOCK")
      return <Badge className="bg-yellow-100 text-yellow-800">
               <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
             </Badge>;
    return <Badge className="bg-green-100 text-green-800">
             <PackageCheck className="w-3 h-3 mr-1" /> In Stock
           </Badge>;
  };

  // ── Stock Bar ───────────────────────────────────────────
  const barColor =
    qty === 0 ? "bg-red-500" :
    qty <= 10 ? "bg-yellow-400" : "bg-green-500";

  // ── Handlers ────────────────────────────────────────────
  const handleStockIn = () => {
    if (!inQty || inQty <= 0) return;
    addStock({ id: productId, qty: inQty }, {
      onSuccess: () => {
        setInToday(p => p + inQty);
        setLogs(p => [...p, {
          type: "in", qty: inQty,
          after: qty + inQty,
          time: new Date().toLocaleTimeString(),
        }]);
      },
    });
  };

  const handleStockOut = () => {
    if (!outQty || outQty <= 0) return;
    deductStock({ id: productId, qty: outQty }, {
      onSuccess: () => {
        setOutToday(p => p + outQty);
        setLogs(p => [...p, {
          type: "out", qty: outQty,
          after: qty - outQty,
          time: new Date().toLocaleTimeString(),
        }]);
      },
    });
  };

  return (
    <div className="space-y-3 max-w-lg">

      {/* ── Product Info Card ── */}
      <div className="border rounded-xl p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Product</p>
            <p className="text-lg font-medium">{productName ?? `#${productId}`}</p>
          </div>
          <StatusBadge />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Stock </p>
            <p className="text-2xl font-medium">{qty}</p>
            <div className="h-1.5 bg-gray-200 rounded-full mt-2">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${Math.min(100, (qty / 60) * 100)}%` }}
              />
            </div>
          </div>
          <div className="grid grid-rows-2 gap-3">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground">ចូលថ្ងៃនេះ</p>
              <p className="text-lg font-medium text-green-700">+{inToday}</p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground">ចេញថ្ងៃនេះ</p>
              <p className="text-lg font-medium text-red-700">-{outToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stock In ── */}
      <div className="border rounded-xl p-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">
         Stock (Stock In)
        </p>
        <div className="flex gap-2">
          <Input
            type="number" min={1} value={inQty}
            onChange={e => setInQty(Number(e.target.value))}
            placeholder="ចំនួន..."
          />
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleStockIn}
            disabled={adding}
          >
            <ArrowUp className="w-4 h-4 mr-1" />
            {adding ? "..." : "Stock In"}
          </Button>
        </div>
      </div>

      {/* ── Stock Out ── */}
      <div className="border rounded-xl p-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">
        </p>
        <div className="flex gap-2">
          <Input
            type="number" min={1} value={outQty}
            onChange={e => setOutQty(Number(e.target.value))}
            placeholder="ចំនួន..."
          />
          <Button
            variant="destructive"
            onClick={handleStockOut}
            disabled={deducting}
          >
            <ArrowDown className="w-4 h-4 mr-1" />
            {deducting ? "..." : "Stock Out"}
          </Button>
        </div>
      </div>

      {/* ── Log ── */}
      <div className="border rounded-xl p-4">
        <p className="text-sm font-medium text-muted-foreground mb-3"> Stock</p>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-3">
     
          </p>
        ) : (
          <div className="space-y-2">
            {[...logs].reverse().map((log, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className={log.type === "in" ? "text-green-700" : "text-red-700"}>
                  {log.type === "in"
                    ? <ArrowUp className="inline w-3 h-3 mr-1" />
                    : <ArrowDown className="inline w-3 h-3 mr-1" />}
                  {log.type === "in" ? "Stock In" : "Stock Out"} &nbsp;
                  {log.type === "in" ? "+" : "-"}{log.qty}
                </span>
                <span className="text-muted-foreground">
                  នៅសល់: {log.after} · {log.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockManagement;
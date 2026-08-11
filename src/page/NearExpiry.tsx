import { useMemo, useState } from "react";
import { CalendarClock, Percent } from "lucide-react";
import type { IProductBatch } from "@/types/product";

import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useNearExpiryProducts,
  useSetProductDiscount,
} from "@/hooks/useProduct";

// ─── Days remaining (color-coded: red < 3, orange < 7) ───
const getDaysLeft = (expireDate?: string | null): number => {
  if (!expireDate) return Number.POSITIVE_INFINITY;
  const exp = new Date(expireDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const daysBadge = (days: number) => {
  if (days < 3) {
    return <Badge className="bg-red-500">{days} day{days === 1 ? "" : "s"}</Badge>;
  }
  if (days < 7) {
    return <Badge className="bg-orange-500">{days} days</Badge>;
  }
  return <Badge className="bg-green-500">{days} days</Badge>;
};

interface DiscountFormProps {
  product: IProductBatch;
  onClose: () => void;
}

function DiscountForm({ product, onClose }: DiscountFormProps) {
  const [percent, setPercent] = useState<number>(
    Number(product.product.discountPercent) || 0
  );
  const { mutate: setDiscount, isPending } = useSetProductDiscount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDiscount(
      {
        id: product.product.id,
        discount_percent: Number(percent) || 0,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Set Discount</DialogTitle>
        <DialogDescription>
          Apply a near-expiry discount to “{product.product.name}”
        </DialogDescription>
      </DialogHeader>

      <form id="discount-form" onSubmit={handleSubmit} className="space-y-4">
        <Field>
          <FieldContent>
            <FieldLabel htmlFor="discount-percent">
              Discount (%) — 0 clears the discount
            </FieldLabel>
            <Input
              id="discount-percent"
              name="discount_percent"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={percent}
              onChange={(e) => setPercent(e.target.valueAsNumber || 0)}
              placeholder="e.g. 20"
              autoComplete="off"
            />
          </FieldContent>
        </Field>
      </form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          type="submit"
          form="discount-form"
          className="bg-blue-500"
          disabled={isPending}
        >
          {isPending ? "Saving…" : "Save Discount"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Main Page ─────────────────────────────────────────────
const NearExpiry = () => {
  const [days, setDays] = useState<number>(7);
  const [selected, setSelected] = useState<IProductBatch | null>(null);
  const { data, isLoading } = useNearExpiryProducts(days);

  const products = useMemo(
    () => (data?.data as IProductBatch[]) ?? [],
    [data]
  );

  return (
    <div>
      {/* ─── Toolbar ─────────────────────────────────────── */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Near Expiry Products</h2>
        </div>

        <div className="flex items-center gap-2">
          <Field orientation="horizontal" className="items-center gap-2">
            <FieldLabel htmlFor="days-range" className="mb-0">
              Within
            </FieldLabel>
            <Input
              id="days-range"
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(Math.max(1, e.target.valueAsNumber || 7))}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">days</span>
          </Field>
        </div>
      </div>

      {/* ─── Table ───────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2 border rounded-md">
          <CalendarClock className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No products expiring within {days} days
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Expire Date</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((batch, index) => {
                const daysLeft = getDaysLeft(batch.expireDate);
                const hasDiscount =
                  Number(batch.product.discountPercent) > 0;
                return (
                  <TableRow key={batch.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                          <img
                            className="w-full h-full object-contain"
                            src={
                              batch.product.productImages?.[0]?.imageUrl ??
                              "/productImages.png"
                            }
                            alt={batch.product.name}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{batch.product.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          batch.product.qty === 0
                            ? "bg-red-500"
                            : batch.product.qty <= 10
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }
                      >
                        {batch.product.qty}
                      </Badge>
                    </TableCell>
                    <TableCell>{batch.expireDate ?? "—"}</TableCell>
                    <TableCell>{daysBadge(daysLeft)}</TableCell>
                    <TableCell>
                      {hasDiscount ? (
                        <Badge className="bg-orange-500">
                          <Percent className="h-3 w-3" />
                          {Number(batch.product.discountPercent)}% off
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={hasDiscount ? "outline" : "default"}
                        className={hasDiscount ? "" : "bg-blue-500"}
                        size="sm"
                        onClick={() => setSelected(batch)}
                      >
                        {hasDiscount ? "Edit Discount" : "Set Discount"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ─── Discount Dialog ─────────────────────────────── */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DiscountForm product={selected} onClose={() => setSelected(null)} />
        </Dialog>
      )}
    </div>
  );
};

export default NearExpiry;

/**
 * Expiry helpers for the POS. `expireDate` is an ISO date-only string
 * ("YYYY-MM-DD") from the backend, or null when the product has no tracked
 * expiry. Compare as fixed-width strings so we avoid timezone shifting — an
 * ISO date string orders lexicographically == chronologically.
 */

/** Today's date as a local "YYYY-MM-DD" string (ignores time-of-day). */
export function todayDateString(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * A product is "expired" when its expireDate is strictly before today.
 * Batches with no expiry (null) are never expired, and a product expiring
 * today is still sellable — mirrors the backend check in batchStock.isExpired.
 */
export function isProductExpired(
  product: { expireDate?: string | null } | undefined | null
): boolean {
  if (!product?.expireDate) return false;
  return product.expireDate < todayDateString();
}

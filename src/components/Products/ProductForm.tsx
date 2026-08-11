import { useForm } from "@tanstack/react-form";

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import z from "zod";
import { Spinner } from "../ui/spinner";
import { useEffect, useRef, useState } from "react";
import type { ICategory, IProduct, IProductImage } from "../../types/product";
import { Trash2, Upload } from "lucide-react";
import { cn } from "../../lib/utils";
import { useCategoriesList } from "../../hooks/useCategories";
import {
  useCreateProduct,
  useDeleteProductImage,
  useUpdateProduct,
  useUploadProductImage,
} from "../../hooks/useProduct";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be 0 or more"),
  categoryId: z
    .union([z.undefined(), z.number().min(1, "Category is required")])
    .refine((value) => value !== undefined, {
      message: "Category is required",
    }),
  qty: z.number().int().min(0, "Quantity must be 0 or more"),
  // Always present in defaultValues — null means "no expiry date tracked"
  expireDate: z.string().nullable(),
});

export type ProductSchema = z.infer<typeof productSchema>;

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  product?: IProduct;
}

// ─── Extract product ID from API response ────────────────
const extractId = (res: any): number | undefined => {
  const id = res?.data?.id ?? res?.id ?? undefined;
  if (!id) {
    console.warn("Could not extract product ID from response:", JSON.stringify(res));
  }
  return id;
};

// ─── Stable Object URL hook ───────────────────────────────
const useObjectUrl = (file: File) => {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url;
};

// ─── File Preview Item ────────────────────────────────────
const FilePreviewItem = ({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) => {
  const imageUrl = useObjectUrl(file);
  return (
    <div className="border border-border rounded-lg p-2 flex flex-col">
      <div className="flex items-center gap-2">
        <div className="w-18 h-14 bg-muted rounded-sm flex items-center justify-center self-start overflow-hidden">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1 pr-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground truncate max-w-[250px]">
                {file.name}
              </span>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {Math.round(file.size / 1024)} KB
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              className="bg-transparent! hover:text-red-500"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────
const ProductForm = ({ open, setOpen, product }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);
  const [extraBarcode, setExtraBarcode] = useState(product?.barcode ?? "");

  const { data } = useCategoriesList();
  const { mutateAsync: createProductMutate } = useCreateProduct();
  const { mutateAsync: updateProductMutate } = useUpdateProduct();
  const { mutateAsync: uploadProductImageMutate } = useUploadProductImage();
  const { mutateAsync: deleteProductImageMutate } = useDeleteProductImage();

  const form = useForm({
    defaultValues: {
      name: product?.name ?? "",
      price: product?.price ? Number(product.price) : 0,
      categoryId: product?.categoryId || undefined,
      qty: product?.qty ?? 0,
      expireDate: product?.expireDate ?? null,
    },
    validators: {
      onSubmit: productSchema,
    },
    onSubmit: async ({ value }) => {
      if (value.categoryId === undefined) return;

      const payload = {
        ...value,
        categoryId: value.categoryId,
        barcode: extraBarcode || undefined,
        expireDate: value.expireDate || null,
      };
      setIsLoading(true);

      const resetFormState = () => {
        setUploadedFiles([]);
        setDeleteImageIds([]);
        setExtraBarcode("");
        form.reset();
        setOpen(false);
      };

      try {
        if (product) {
          // ─── Update Product ───────────────────────────
          // Step 1: Save product info — wait for this
          const res = await updateProductMutate({
            id: product.id,
            request: payload,
          });
          const productId = extractId(res) ?? product.id;

          // Step 2: Close dialog immediately — feel fast to user 
          resetFormState();

          // Step 3: Run image delete + upload in background
          // Dialog is already closed, user can do other things
          Promise.all([
            ...deleteImageIds.map((imageId) =>
              deleteProductImageMutate({ id: imageId, productId }).catch((err: any) => {
                const status = err?.response?.status;
                if (status !== 404) {
                  console.error(`Failed to delete image ${imageId}:`, err);
                }
              })
            ),
            ...uploadedFiles.map((file) =>
              uploadProductImageMutate({ id: productId, request: file }).catch((err: any) => {
                console.error(`Failed to upload image:`, err);
              })
            ),
          ]).catch((err) => {
            console.error("Background image sync error:", err);
          });

        } else {
          // ─── Create Product ───────────────────────────
          // Step 1: Create product — must wait for ID
          const res = await createProductMutate(payload);
          const productId = extractId(res);

          // Step 2: Close dialog immediately 
          resetFormState();

          // Step 3: Upload images in background
          if (productId && uploadedFiles.length > 0) {
            Promise.all(
              uploadedFiles.map((file) =>
                uploadProductImageMutate({ id: productId, request: file }).catch((err: any) => {
                  console.error(`Failed to upload image:`, err);
                })
              )
            ).catch((err) => {
              console.error("Background image upload error:", err);
            });
          }
        }
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // ─── Sync form when editing existing product ──────────
  useEffect(() => {
    if (product) {
      form.setFieldValue("name", product.name);
      form.setFieldValue("price", Number(product.price));
      form.setFieldValue("categoryId", product.categoryId);
      form.setFieldValue("qty", product.qty);
      form.setFieldValue("expireDate", product.expireDate ?? null);
      setExtraBarcode(product.barcode ?? "");
    } else {
      form.reset();
      setExtraBarcode("");
    }
  }, [product, form]);

  // ─── Reset state when dialog closes ──────────────────
  useEffect(() => {
    if (!open) {
      setDeleteImageIds([]);
      setUploadedFiles([]);
    }
  }, [open]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    setUploadedFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const handleBoxClick = () => fileInputRef.current?.click();
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      {isLoading && <Spinner />}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          key={product?.id ?? "create"}
          className="sm:max-w-[60vw] h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>{product ? "Update" : "Create"} Product</DialogTitle>
            <DialogDescription>Product Information Detail</DialogDescription>
          </DialogHeader>

          <form
            key={product?.id ?? "create"}
            id="product-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              {/* ── Product Name ──────────────────────────── */}
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Product Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter product name"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              {/* ── Price & Quantity ───────────────────────── */}
              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="price"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Price ($)</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          type="number"
                          min={0}
                          step="0.01"
                          onChange={(e) =>
                            field.handleChange(e.target.valueAsNumber)
                          }
                          aria-invalid={isInvalid}
                          placeholder="Enter price"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="qty"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Stock Quantity
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          type="number"
                          min={0}
                          step={1}
                          onChange={(e) =>
                            field.handleChange(
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          aria-invalid={isInvalid}
                          placeholder="Enter stock quantity"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </div>

              {/* ── Category ───────────────────────────────── */}
              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="categoryId"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldContent>
                          <FieldLabel htmlFor="form-tanstack-select-language">
                            Category
                          </FieldLabel>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </FieldContent>
                        <Select
                          name={field.name}
                          value={
                            field.state.value !== undefined
                              ? String(field.state.value)
                              : ""
                          }
                          onValueChange={(val) =>
                            field.handleChange(Number(val))
                          }
                        >
                          <SelectTrigger
                            id="form-tanstack-select-language"
                            aria-invalid={isInvalid}
                            className="w-full"
                          >
                            <SelectValue placeholder="Select the category" />
                          </SelectTrigger>
                          <SelectContent position="item-aligned">
                            {data?.data.map(
                              (category: ICategory, index: number) => (
                                <SelectItem
                                  key={index}
                                  value={String(category.id)}
                                >
                                  {category.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </Field>
                    );
                  }}
                />
              </div>

              {/* ── Barcode ───────────────────────────────── */}
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Barcode</FieldLabel>
                  <Input
                    value={extraBarcode}
                    placeholder="Scan or enter barcode"
                    onChange={(e) => setExtraBarcode(e.target.value)}
                    autoComplete="off"
                  />
                </Field>
              </div>

              {/* ── Expire Date ───────────────────────────── */}
              <form.Field
                name="expireDate"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Expire Date
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="date"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value ? e.target.value : null
                          )
                        }
                        aria-invalid={isInvalid}
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              {/* ── Image Upload ──────────────────────────── */}
              <div>
                <div
                  className="border-2 border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer"
                  onClick={handleBoxClick}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="mb-2 bg-muted rounded-full p-3">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-pretty text-sm font-medium text-foreground">
                    Upload product image
                  </p>
                  <p className="text-pretty text-sm text-muted-foreground mt-1">
                    or,{" "}
                    <label
                      htmlFor="fileUpload"
                      className="text-primary hover:text-primary/90 font-medium cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      click to browse
                    </label>{" "}
                    (4MB max)
                  </p>
                  <input
                    type="file"
                    id="fileUpload"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </div>
              </div>

              {/* ── Existing Images (Edit mode) ───────────── */}
              {product?.productImages && product.productImages.length > 0 && (
                <div className="space-y-2">
                  {product.productImages
                    .filter(
                      (image: IProductImage) =>
                        !deleteImageIds.includes(image.id)
                    )
                    .map((image: IProductImage, index: number) => (
                      <div
                        key={index}
                        className="border border-border rounded-lg p-2 flex flex-col"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-18 h-14 bg-muted rounded-sm flex items-center justify-center self-start overflow-hidden">
                            <img
                              src={image.imageUrl}
                              alt={image.fileName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 pr-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-foreground truncate max-w-[250px]">
                                {image.fileName}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="bg-transparent! hover:text-red-500"
                                type="button"
                                onClick={() =>
                                  setDeleteImageIds((prev) => [
                                    ...prev,
                                    image.id,
                                  ])
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* ── New Uploaded Files Preview ────────────── */}
              <div
                className={cn(
                  "pb-5 space-y-3",
                  uploadedFiles.length > 0 ? "mt-4" : ""
                )}
              >
                {uploadedFiles.map((file, index) => (
                  <FilePreviewItem
                    key={file.name + index}
                    file={file}
                    onRemove={() => removeFile(index)}
                  />
                ))}
              </div>
            </FieldGroup>
          </form>

          <DialogFooter>
            <Field orientation="horizontal" className="flex justify-end">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button className="bg-blue-500" type="submit" form="product-form">
                {product ? "Update" : "Save"}
              </Button>
            </Field>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductForm;
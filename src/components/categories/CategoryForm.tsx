"use client";

import * as z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useCreateCategory, useUpdateCategory } from "../../hooks/useCategories";
import { useEffect } from "react";
import type { ICategory } from "../../types/category";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  category?: ICategory;
}

export function CategoryForm({ open, setOpen, category }: Props) {
  const { mutate: createCategoryMutate } = useCreateCategory();
  const { mutate: updateCategoryMutate } = useUpdateCategory();

  const form = useForm({
    defaultValues: {
      name: category?.name ?? "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (category) {
        updateCategoryMutate(
          { id: category.id, request: value },
          {
            onSuccess: () => {
              toast.success("Category updated successfully");
              setOpen(false);
              form.reset();
            },
          }
        );
      } else {
        createCategoryMutate(value, {
          onSuccess: () => {
            toast.success("Category created successfully");
            setOpen(false);
            form.reset();
          },
        });
      }
    },
  });

  useEffect(() => {
    form.reset({
      name: category?.name ?? "",
    });
  }, [category, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{category ? "Edit" : "Create"} category</DialogTitle>
          <DialogDescription>Enter category information detail</DialogDescription>
        </DialogHeader>

        <form
          id="category-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Category Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Enter category name"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="category-form">
            {category ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
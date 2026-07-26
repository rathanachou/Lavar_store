import React, { type PropsWithChildren } from "react";
import { isNil, some } from "lodash";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Spinner } from "@/components/ui/spinner";
import { CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IActions {
  ok?: string;
  cancel?: string;
  loading?: boolean;
  event?: () => void;
}
interface IProps extends PropsWithChildren {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  desc?: string;
  actions?: IActions[];
  submitTitle?: string;
  cancelTitle?: string;
  width?: string;
  height?: string;
  isCancel?: boolean;
  isClose?: boolean;
  isSubmit?: boolean;
  closeEvent?: () => void;
  submitEvent?: () => void;
  isLoading?: boolean;
  className?: string;
}

const SharedDialog = ({
  open,
  setOpen,
  title,
  desc = undefined,
  actions = undefined,
  submitTitle = "Submit",
  cancelTitle,
  width,
  height,
  isCancel = true,
  isClose = false,
  isLoading = false,
  closeEvent,
  submitEvent,
  className,
  isSubmit,
  children,
}: IProps) => {
  const message =
    desc ??
    "Are you sure you want to delete this record? This action cannot be undone.";
  const hasVisibleChildren = some(
    React.Children.toArray(children),
    (child: any) => !isNil(child) && child !== false,
  );

  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="gap-2 overflow-y-auto"
        style={{
          width: width,
          maxWidth: width ?? "42rem",
          height: height ?? "auto",
          maxHeight: "85dvh",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          overflow: "hidden",
        }}
      >
        <AlertDialogHeader className="space-y-1 relative h-10">
          <AlertDialogTitle className="text-2xl font-bold  fixed">
            {title}
            {!isClose && (
              <Button
                variant="ghost"
                className="fixed right-2 top-2 text-red-600"
                onClick={() => {
                  setOpen(false);
                  closeEvent?.();
                }}
                disabled={isClose}
              >
                <CircleX />
              </Button>
            )}
          </AlertDialogTitle>

        </AlertDialogHeader>
        <div className="overflow-auto px-2">
          {hasVisibleChildren ? children : message}
        </div>

        <AlertDialogFooter className="mt-[30px]">
          {isCancel && (
            <AlertDialogCancel
              onClick={() => {
                setOpen(false);
                closeEvent?.();
              }}
              disabled={isLoading}
            >
              {cancelTitle ?? "Cancel"}
            </AlertDialogCancel>
          )}
          {isSubmit && (
            <AlertDialogAction
              disabled={isLoading}
              className={cn(`${className}`)}
              onClick={() => {
                submitEvent?.();
              }}
            >
              {isLoading ? <Spinner className="text-white" /> : null}
              {isLoading ? "Please wait" : submitTitle}
            </AlertDialogAction>
          )}
          {actions?.length
            ? actions.map((item, index) => {
                return (
                  <AlertDialogAction
                    key={index}
                    onClick={() => {
                      item?.event?.();
                    }}
                    disabled={item?.loading ?? false}
                  >
                    {item?.loading && <Spinner className="text-white" />}
                    {item?.ok}
                  </AlertDialogAction>
                );
              })
            : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SharedDialog;
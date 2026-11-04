"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteAnalysis } from "../actions/deleteAnalysis";

export function DeleteAnalysisControl({
  id,
  name,
  labels,
}: {
  id: string;
  name: string;
  labels: {
    delete: string;
    deleteNamed: string;
    confirmTitle: string;
    confirmDescription: string;
    cancel: string;
    deleteError: string;
    deleteUnavailable: string;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const mutation = useMutation({
    mutationFn: () => deleteAnalysis({ id }),
    onSuccess: (result) => {
      if (!result.ok) return;
      setOpen(false);
      router.refresh();
    },
  });

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={labels.deleteNamed.replace("{name}", name)}
        onClick={() => {
          mutation.reset();
          setOpen(true);
        }}
      >
        <Trash2 className="size-4" />
        {labels.delete}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labels.confirmTitle}</DialogTitle>
            <DialogDescription>
              {labels.confirmDescription.replace("{name}", name)}
            </DialogDescription>
          </DialogHeader>
          {mutation.isError || (mutation.isSuccess && !mutation.data.ok) ? (
            <p role="alert" className="text-sm text-destructive">
              {mutation.isSuccess && !mutation.data.ok
                ? labels.deleteUnavailable
                : labels.deleteError}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              {labels.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => mutation.mutate()}
              disabled={
                mutation.isPending || (mutation.isSuccess && !mutation.data.ok)
              }
            >
              <Trash2 className="size-4" />
              {mutation.isPending ? `${labels.delete}…` : labels.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

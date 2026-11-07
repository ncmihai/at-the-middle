"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import type { ResultEntry, SearchProgress } from "@/lib/types";
import { messages } from "@/lib/messages";
import ResultsList from "@/components/ResultsList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

type WaitingScreenProps = {
  progress: SearchProgress;
  /** partial results stream in live while the search runs */
  results: ResultEntry[];
  onCancel: () => void;
  cancelling?: boolean;
};

export default function WaitingScreen({
  progress,
  results,
  onCancel,
  cancelling = false,
}: WaitingScreenProps) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const pct =
    progress.totalSteps > 0
      ? Math.min(100, Math.round((progress.doneSteps / progress.totalSteps) * 100))
      : null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <Loader2Icon className="h-5 w-5 animate-spin text-primary" />
            <h2 className="text-lg font-semibold">{messages.waiting.title}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{messages.waiting.subtitle}</p>
          <Progress value={pct} aria-label={messages.waiting.title} />
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="truncate">
              {progress.currentStep ||
                messages.waiting.progress(progress.doneSteps, progress.totalSteps)}
            </span>
            <span className="shrink-0">
              {messages.waiting.progress(progress.doneSteps, progress.totalSteps)}
            </span>
          </div>
          <div>
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={cancelling}
                >
                  {cancelling ? messages.waiting.cancelling : messages.waiting.cancel}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{messages.waiting.cancelDialogTitle}</DialogTitle>
                  <DialogDescription>{messages.waiting.cancelDialogBody}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmOpen(false)}
                  >
                    {messages.waiting.cancelDialogDismiss}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={cancelling}
                    onClick={() => {
                      setConfirmOpen(false);
                      onCancel();
                    }}
                  >
                    {messages.waiting.cancelDialogConfirm}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {results.length === 0 && (
        <div className="flex flex-col gap-4" aria-hidden>
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="flex flex-col gap-3 p-6">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {messages.waiting.partialTitle}
          </h3>
          <ResultsList results={results} />
        </div>
      )}
    </div>
  );
}

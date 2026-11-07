import Link from "next/link";
import { PlaneIcon } from "lucide-react";

import { messages } from "@/lib/messages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <PlaneIcon className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">{messages.notFound.title}</h1>
          <p className="text-sm text-muted-foreground">{messages.notFound.body}</p>
          <Button asChild variant="outline">
            <Link href="/">{messages.notFound.backHome}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

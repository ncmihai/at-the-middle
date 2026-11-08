"use client";

// ShareCardButton — downloadable share-card PNG (PLAN.md Faza 4 lot 4).
// Draws the SAME card design as app/r/[slug]/opengraph-image.tsx on a
// client-side <canvas> (1200x630), from the best result passed down as a prop,
// and downloads it via canvas.toDataURL("image/png") + <a download>.
// All content comes from lib/share.ts cardModel(), so the PNG and the OG
// image always match.
import * as React from "react";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import type { ResultEntry } from "@/lib/types";
import { useMessages } from "@/lib/i18n";
import {
  SHARE_CARD_COLORS as C,
  SHARE_CARD_SIZE,
  cardModel,
  getSiteUrl,
  hostOf,
  type ShareCardModel,
} from "@/lib/share";
import { maxPricePerPerson } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";

const FONT_STACK =
  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function font(px: number, weight: number): string {
  return `${weight} ${px}px ${FONT_STACK}`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** shrink the title font until it fits the card width (min 48px) */
function fitTitle(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startPx: number
): number {
  let px = startPx;
  ctx.font = font(px, 700);
  while (px > 48 && ctx.measureText(text).width > maxWidth) {
    px -= 4;
    ctx.font = font(px, 700);
  }
  return px;
}

/** Mirror of the JSX layout in opengraph-image.tsx — same geometry, same colors. */
function drawShareCard(ctx: CanvasRenderingContext2D, model: ShareCardModel): void {
  const W = SHARE_CARD_SIZE.width;
  const H = SHARE_CARD_SIZE.height;
  const pad = 64;

  // brand gradient background (sky-400 → blue-600, 135°)
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, C.gradientFrom);
  grad.addColorStop(1, C.gradientTo);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.textBaseline = "middle";
  ctx.fillStyle = C.text;

  // header: wordmark (rounded square + paper-plane glyph) + host, top-right
  const headerY = pad + 28;
  ctx.fillStyle = C.wordmarkBg;
  roundRect(ctx, pad, pad, 56, 56, 14);
  ctx.fill();
  ctx.fillStyle = C.text;
  const bx = pad + 14;
  const by = pad + 14;
  const s = 28;
  ctx.beginPath();
  ctx.moveTo(bx, by + s * 0.5);
  ctx.lineTo(bx + s, by);
  ctx.lineTo(bx + s * 0.62, by + s);
  ctx.lineTo(bx + s * 0.5, by + s * 0.66);
  ctx.closePath();
  ctx.fill();
  ctx.font = font(44, 700);
  ctx.textAlign = "left";
  ctx.fillText("midspot", pad + 56 + 16, headerY);
  ctx.font = font(24, 400);
  ctx.textAlign = "right";
  ctx.globalAlpha = 0.85;
  ctx.fillText(hostOf(model.url), W - pad, headerY);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";

  // middle: big destination + dates
  const titleY = 260;
  fitTitle(ctx, model.title, W - pad * 2, 84);
  ctx.fillStyle = C.text;
  ctx.fillText(model.title, pad, titleY);
  ctx.font = font(36, 400);
  ctx.globalAlpha = 0.92;
  ctx.fillText(model.subtitle, pad, titleY + 84 + 24);
  ctx.globalAlpha = 1;

  // bottom row: gap badge pill (left) + price (right)
  const pillY = 430;
  const pillH = 56;
  ctx.font = font(28, 600);
  const pillW = ctx.measureText(model.gapText).width + 52;
  ctx.fillStyle = C.pillBg;
  roundRect(ctx, pad, pillY, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.fillStyle = C.text;
  ctx.fillText(model.gapText, pad + 26, pillY + pillH / 2);
  ctx.font = font(40, 700);
  ctx.textAlign = "right";
  ctx.fillText(model.priceText, W - pad, pillY + pillH / 2 + 4);
  ctx.textAlign = "left";

  // small share URL at the bottom
  ctx.font = font(22, 400);
  ctx.globalAlpha = 0.75;
  ctx.fillText(model.url, pad, H - pad - 11);
  ctx.globalAlpha = 1;
}

export type ShareCardButtonProps = {
  /** the best (rank 1) result — drawn on the card */
  result: ResultEntry;
  slug: string;
  className?: string;
};

export default function ShareCardButton({ result, slug, className }: ShareCardButtonProps) {
  const messages = useMessages();
  const [busy, setBusy] = React.useState(false);

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const model = cardModel(
        {
          destinationCity: result.destinationCity,
          destinationCountry: result.destinationCountry,
          departureDate: result.departureDate,
          returnDate: result.returnDate,
          gapMinutes: result.gapMinutes,
          pricePerPersonEur: maxPricePerPerson(result),
        },
        getSiteUrl(),
        slug
      );
      const canvas = document.createElement("canvas");
      canvas.width = SHARE_CARD_SIZE.width;
      canvas.height = SHARE_CARD_SIZE.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("2d context unavailable");
      drawShareCard(ctx, model);
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `midspot-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success(messages.results.shareCardDownloaded);
    } catch (err) {
      console.error("[share-card] failed to render card:", err);
      toast.error(messages.results.shareCardFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void download()}
      disabled={busy}
      className={className}
    >
      {busy ? (
        <Loader2Icon className="h-4 w-4 animate-spin" />
      ) : (
        <DownloadIcon className="h-4 w-4" />
      )}
      {messages.results.shareCard}
    </Button>
  );
}

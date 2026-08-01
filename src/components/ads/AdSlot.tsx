import { useEffect, useRef } from "react";

/**
 * Flip to `true` only AFTER the AdSense account is approved.
 * Until then every slot renders nothing, keeping pages clean for review.
 */
export const ADS_ENABLED = false;
export const ADSENSE_CLIENT = "ca-pub-1732774008864933";

type SlotFormat = "header" | "in-content" | "sidebar" | "multiplex";

interface AdSlotProps {
  slot?: string;
  format?: SlotFormat;
  className?: string;
}

const formatProps: Record<SlotFormat, { format: string; layout?: string }> = {
  header: { format: "horizontal" },
  "in-content": { format: "fluid", layout: "in-article" },
  sidebar: { format: "vertical" },
  multiplex: { format: "autorelaxed" },
};

export function AdSlot({ slot, format = "in-content", className }: AdSlotProps) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADS_ENABLED || pushed.current || !ref.current) return;
    try {
      ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ||= []).push({});
      pushed.current = true;
    } catch {
      /* AdSense not loaded */
    }
  }, []);

  if (!ADS_ENABLED) return null;

  const cfg = formatProps[format];

  return (
    <div className={className} aria-label="Advertisement">
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={cfg.format}
        data-ad-layout={cfg.layout}
        data-full-width-responsive="true"
      />
    </div>
  );
}
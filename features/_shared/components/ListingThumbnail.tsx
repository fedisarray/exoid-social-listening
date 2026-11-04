"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Listing } from "../schemas/listing";
import { cn } from "@/lib/utils";

export function ListingThumbnail({
  listing,
  className,
  loading = "lazy",
}: {
  listing?: Pick<Listing, "name" | "thumbnailUrl">;
  className?: string;
  loading?: "eager" | "lazy";
}) {
  const t = useTranslations("reviews");
  const [failedUrl, setFailedUrl] = useState<string>();
  const url = listing?.thumbnailUrl;
  return (
    <div
      className={cn(
        "relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground",
        className,
      )}
    >
      {url && url !== failedUrl ? (
        <Image
          src={url}
          alt={listing?.name ?? ""}
          fill
          unoptimized
          loading={loading}
          sizes="(max-width: 639px) 100vw, 400px"
          className="object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(url)}
        />
      ) : (
        <Building2
          className="size-6"
          role="img"
          aria-label={t("noThumbnail")}
        />
      )}
    </div>
  );
}

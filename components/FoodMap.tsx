"use client";

import { useMemo } from "react";

type Props = {
  address: string;
};

export default function FoodMap({ address }: Props) {
  const mapUrl = useMemo(() => {
    if (!address) return null;
    const encoded = encodeURIComponent(address);
    return `https://www.google.com/maps?q=${encoded}&output=embed`;
  }, [address]);

  if (!mapUrl) {
    return (
      <div className="w-full h-48 sm:h-64 flex items-center justify-center bg-neutral-100 rounded-xl text-sm text-neutral-500">
        No location available
      </div>
    );
  }

  return (
    <div className="w-full h-48 sm:h-64 md:h-72 rounded-xl overflow-hidden border bg-white">
      <iframe
        title="Food Location Map"
        src={mapUrl}
        width="100%"
        height="100%"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="border-0"
        allowFullScreen
      />
    </div>
  );
}
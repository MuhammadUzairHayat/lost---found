"use client";

import Image from "next/image";
import { useTheme } from "@/components/theme/ThemeProvider";

export function BrandLogo({
  className = "h-10 w-10",
  width = 40,
  height = 40,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  const { theme, mounted } = useTheme();
  const src =
    mounted && theme === "dark" ? "/logo-dark.png" : "/logo-light.png";

  return (
    <Image
      src={src}
      alt="Lost & Found"
      className={className}
      width={width}
      height={height}
      priority
    />
  );
}

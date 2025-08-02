import React from "react";
import { riskIcons } from "@/lib/icons";

interface Props {
  name: keyof typeof riskIcons;
  size?: number;
  color?: string;
  className?: string;
}

export default function DynamicLucideIcon({ name, size = 24, color = "currentColor", className }: Props) {
  const Icon = riskIcons[name] ?? riskIcons["SNOW"];
  return <Icon className={className} />;
}
import { RiskType } from "@/generated/prisma"
import { Snowflake, CloudHail, CloudRain, CloudFog, CloudSnow, Wind, Hourglass, Disc3, EqualApproximately, Mountain, Trash, TrafficCone, Construction, Shield, XCircle } from "lucide-react"

export const riskIcons: Record<RiskType, React.ComponentType<{ className?: string }>> = {
  SNOW: Snowflake,
  HAIL: CloudHail,
  RAIN: CloudRain,
  FOG: CloudFog,
  ICE: CloudSnow,
  WIND: Wind,
  SANDY: Hourglass,
  BAD_GRAVEL: Disc3,
  MUD: EqualApproximately,
  ROCK: Mountain,
  DEBRIS: Trash,
  POTHOLE: TrafficCone,
  ROADWORK: Construction,
  POLICE: Shield,
  CLOSED_ROAD: XCircle,
}
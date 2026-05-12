import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatTimeAgo(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  
  // Show actual date for older transactions
  return past.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short',
    year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

// Schema-allowed split_type values: all | adults | children | custom
export type DbSplitType = "all" | "adults" | "children" | "custom"

const SPLIT_TYPE_MAP: Record<string, DbSplitType> = {
  everyone: "all",
  all: "all",
  adults: "adults",
  kids: "children",
  children: "children",
  custom: "custom",
}

export function normalizeSplitType(value: string | null | undefined): DbSplitType {
  if (!value) return "all"
  return SPLIT_TYPE_MAP[value] ?? "all"
}

/**
 * Single source of truth for split-type display labels.
 * Accepts both DB values (`all`, `adults`, `children`, `custom`) and legacy UI values
 * (`everyone`, `kids`).
 */
export function getSplitDisplayLabel(
  splitType: string | null | undefined,
  customNames: string[] = [],
): string {
  switch (splitType) {
    case "adults":
      return "Adults Only"
    case "kids":
    case "children":
      return "Kids Only"
    case "custom":
      return customNames.length > 0 ? `Custom: ${customNames.join(", ")}` : "Custom Split"
    case "all":
    case "everyone":
    default:
      return "Everyone"
  }
}

/**
 * Compute weighted split amounts using each member's share_ratio.
 * Guarantees sum(splitAmounts) === totalAmount (paise-precision adjustment on last row).
 */
export function computeWeightedSplits<
  T extends { id: string; shareRatio?: number | null; share_ratio?: number | null },
>(
  members: T[],
  totalAmount: number,
): Array<{ member: T; ratio: number; amount: number }> {
  const total = Number(totalAmount) || 0
  const withRatios = members.map((m) => ({
    member: m,
    ratio: Number(m.shareRatio ?? m.share_ratio ?? 1) || 0,
  }))
  const totalRatio = withRatios.reduce((s, r) => s + r.ratio, 0)
  if (withRatios.length === 0 || totalRatio <= 0) return []

  // Round to 2dp; absorb residual into last entry so sums match exactly.
  const rows = withRatios.map(({ member, ratio }) => ({
    member,
    ratio,
    amount: Math.round(((ratio / totalRatio) * total) * 100) / 100,
  }))
  const sumSoFar = rows.reduce((s, r) => s + r.amount, 0)
  const residual = Math.round((total - sumSoFar) * 100) / 100
  if (residual !== 0 && rows.length > 0) {
    rows[rows.length - 1].amount = Math.round((rows[rows.length - 1].amount + residual) * 100) / 100
  }
  return rows
}

export function formatFullDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

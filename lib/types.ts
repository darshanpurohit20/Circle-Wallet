// Circle Wallet Types - Prepaid Wallet System

export type MemberType = "adult" | "teenager" | "child"
export type UserRole = "admin" | "co-admin" | "member"
export type TransactionType = "deposit" | "withdrawal" | "payment" | "transfer"
export type TransactionStatus = "pending" | "confirmed" | "declined" | "settled"
export type InviteStatus = "pending" | "accepted" | "expired" | "declined"

export interface Profile {
  id: string
  email: string | null
  phone: string | null
  full_name: string
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  description: string | null
  currency: string
  shared_wallet_balance: number
  large_payment_threshold: number
  require_approval_above_threshold: boolean
  allow_member_invites: boolean
  default_member_role: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Family {
  id: string
  group_id: string
  name: string
  total_contribution: number
  balance: number
  created_at: string
  members?: FamilyMember[]
}

export interface FamilyMember {
  id: string
  family_id: string
  profile_id: string | null
  name: string
  avatar_url: string | null
  member_type: MemberType
  age: number | null
  share_ratio: number
  created_at: string
}

export interface Transaction {
  id: string
  group_id: string
  type: TransactionType
  description: string
  amount: number
  category: string | null
  paid_by: string | null
  paid_by_name: string | null
  merchant_name: string | null
  merchant_id: string | null
  split_type: "all" | "adults" | "children" | "custom" | null
  status: TransactionStatus
  requires_approval: boolean
  approved_by: string | null
  approved_at: string | null
  receipt_url: string | null
  created_at: string
  updated_at: string
  splits?: TransactionSplit[]
}

export interface TransactionSplit {
  id: string
  transaction_id: string
  member_id: string
  amount: number
  created_at: string
  member?: FamilyMember
}

export interface WalletDeposit {
  id: string
  group_id: string
  family_id: string
  deposited_by: string
  amount: number
  payment_method: string | null
  reference_id: string | null
  status: "pending" | "confirmed" | "failed"
  created_at: string
}

export interface Invite {
  id: string
  group_id: string
  email: string | null
  phone: string | null
  role: UserRole
  status: InviteStatus
  invited_by: string
  invited_by_name: string | null
  expires_at: string | null
  created_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  profile_id: string
  family_id: string | null
  role: UserRole
  joined_at: string
  profile?: Profile
}

export interface Merchant {
  id: string
  name: string
  category: string | null
  upi_id: string | null
  account_number: string | null
  ifsc_code: string | null
  created_at: string
}

// Expense categories with icons
export const transactionCategories = [
  { id: "accommodation", name: "Accommodation", icon: "Building" },
  { id: "food", name: "Food & Dining", icon: "Utensils" },
  { id: "transport", name: "Transport", icon: "Car" },
  { id: "activities", name: "Activities", icon: "Target" },
  { id: "drinks", name: "Drinks", icon: "Wine" },
  { id: "shopping", name: "Shopping", icon: "ShoppingBag" },
  { id: "utilities", name: "Utilities", icon: "Zap" },
  { id: "medical", name: "Medical", icon: "Heart" },
  { id: "other", name: "Other", icon: "Package" },
]

// Currency formatter for INR
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

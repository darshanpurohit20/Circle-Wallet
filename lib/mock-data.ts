export type MemberType = "adult" | "child" | "teenager"
export type TransactionType = "deposit" | "withdrawal" | "payment" | "transfer"
export type TransactionStatus = "pending" | "confirmed" | "declined" | "settled"

export interface FamilyMember {
  id: string
  name: string
  avatar: string
  type: MemberType
  age?: number
  shareRatio: number
}

export interface Family {
  id: string
  name: string
  members: FamilyMember[]
  totalContribution: number
  balance: number
}

export interface Transaction {
  id: string
  type: TransactionType
  description: string
  amount: number
  category: string
  paidBy: string
  paidByName: string
  merchantName?: string
  merchantId?: string
  date: string
  splitType: "all" | "adults" | "children" | "custom"
  splitAmong: string[]
  status: TransactionStatus
  requiresApproval: boolean
  approvedBy?: string
  approvedAt?: string
}

export interface Group {
  id: string
  name: string
  description: string
  currency: string
  families: Family[]
  sharedWalletBalance: number
  totalSpent: number
  transactions: Transaction[]
  createdAt: string
  invites: Invite[]
  settings: GroupSettings
}

export interface Invite {
  id: string
  email: string
  phone?: string
  role: "member" | "co-admin"
  status: "pending" | "accepted" | "expired"
  invitedBy: string
  invitedByName: string
  createdAt: string
  expiresAt: string
}

export interface GroupSettings {
  largePaymentThreshold: number
  requireApprovalAboveThreshold: boolean
  allowMemberInvites: boolean
  defaultMemberRole: "member" | "co-admin"
}

export const mockGroup: Group = {
  id: "grp_001",
  name: "Goa Trip 2025",
  description: "Annual family vacation to Goa",
  currency: "INR",
  sharedWalletBalance: 245000,
  totalSpent: 78500,
  createdAt: "2025-01-15",
  families: [
    {
      id: "fam_001",
      name: "The Sharmas",
      totalContribution: 100000,
      balance: 35000,
      members: [
        {
          id: "mem_001",
          name: "Rajesh Sharma",
          avatar: "/indian-professional-man.png",
          type: "adult",
          shareRatio: 1.0,
        },
        {
          id: "mem_002",
          name: "Priya Sharma",
          avatar: "/indian-woman-professional.png",
          type: "adult",
          shareRatio: 1.0,
        },
        {
          id: "mem_003",
          name: "Arjun Sharma",
          avatar: "/indian-teenage-boy.jpg",
          type: "teenager",
          age: 16,
          shareRatio: 0.8,
        },
        {
          id: "mem_004",
          name: "Ananya Sharma",
          avatar: "/indian-young-girl.jpg",
          type: "child",
          age: 8,
          shareRatio: 0.5,
        },
      ],
    },
    {
      id: "fam_002",
      name: "The Patels",
      totalContribution: 90000,
      balance: 28000,
      members: [
        {
          id: "mem_005",
          name: "Amit Patel",
          avatar: "/indian-man-casual.png",
          type: "adult",
          shareRatio: 1.0,
        },
        {
          id: "mem_006",
          name: "Neha Patel",
          avatar: "/indian-woman-casual.jpg",
          type: "adult",
          shareRatio: 1.0,
        },
      ],
    },
    {
      id: "fam_003",
      name: "Vikram Singh",
      totalContribution: 55000,
      balance: 15500,
      members: [
        {
          id: "mem_007",
          name: "Vikram Singh",
          avatar: "/indian-man-young.jpg",
          type: "adult",
          shareRatio: 1.0,
        },
      ],
    },
  ],
  transactions: [
    {
      id: "txn_001",
      type: "deposit",
      description: "Initial contribution - Sharmas",
      amount: 100000,
      category: "Deposit",
      paidBy: "mem_001",
      paidByName: "Rajesh Sharma",
      date: "2025-01-15",
      splitType: "all",
      splitAmong: [],
      status: "confirmed",
      requiresApproval: false,
    },
    {
      id: "txn_002",
      type: "deposit",
      description: "Initial contribution - Patels",
      amount: 90000,
      category: "Deposit",
      paidBy: "mem_005",
      paidByName: "Amit Patel",
      date: "2025-01-15",
      splitType: "all",
      splitAmong: [],
      status: "confirmed",
      requiresApproval: false,
    },
    {
      id: "txn_003",
      type: "deposit",
      description: "Initial contribution - Vikram",
      amount: 55000,
      category: "Deposit",
      paidBy: "mem_007",
      paidByName: "Vikram Singh",
      date: "2025-01-16",
      splitType: "all",
      splitAmong: [],
      status: "confirmed",
      requiresApproval: false,
    },
    {
      id: "txn_004",
      type: "payment",
      description: "Beach Resort Booking",
      amount: 45000,
      category: "Accommodation",
      paidBy: "mem_001",
      paidByName: "Rajesh Sharma",
      merchantName: "Goa Beach Resort",
      merchantId: "mer_001",
      date: "2025-01-20",
      splitType: "all",
      splitAmong: ["mem_001", "mem_002", "mem_003", "mem_004", "mem_005", "mem_006", "mem_007"],
      status: "confirmed",
      requiresApproval: true,
      approvedBy: "mem_001",
      approvedAt: "2025-01-20",
    },
    {
      id: "txn_005",
      type: "payment",
      description: "Group Dinner at Fisherman's Wharf",
      amount: 12500,
      category: "Food & Dining",
      paidBy: "mem_005",
      paidByName: "Amit Patel",
      merchantName: "Fisherman's Wharf",
      merchantId: "mer_002",
      date: "2025-01-21",
      splitType: "all",
      splitAmong: ["mem_001", "mem_002", "mem_003", "mem_004", "mem_005", "mem_006", "mem_007"],
      status: "confirmed",
      requiresApproval: false,
    },
    {
      id: "txn_006",
      type: "payment",
      description: "Feni & Cocktails at Sunset Bar",
      amount: 8500,
      category: "Drinks",
      paidBy: "mem_007",
      paidByName: "Vikram Singh",
      merchantName: "Sunset Bar",
      date: "2025-01-21",
      splitType: "adults",
      splitAmong: ["mem_001", "mem_002", "mem_005", "mem_006", "mem_007"],
      status: "pending",
      requiresApproval: false,
    },
    {
      id: "txn_007",
      type: "payment",
      description: "Ice Cream at Naturals",
      amount: 1200,
      category: "Treats",
      paidBy: "mem_002",
      paidByName: "Priya Sharma",
      merchantName: "Naturals Ice Cream",
      date: "2025-01-22",
      splitType: "children",
      splitAmong: ["mem_003", "mem_004"],
      status: "confirmed",
      requiresApproval: false,
    },
    {
      id: "txn_008",
      type: "payment",
      description: "Water Sports Package",
      amount: 11300,
      category: "Activities",
      paidBy: "mem_001",
      paidByName: "Rajesh Sharma",
      merchantName: "Goa Water Sports",
      merchantId: "mer_003",
      date: "2025-01-23",
      splitType: "custom",
      splitAmong: ["mem_001", "mem_002", "mem_003", "mem_005", "mem_006", "mem_007"],
      status: "pending",
      requiresApproval: false,
    },
  ],
  invites: [
    {
      id: "inv_001",
      email: "gupta.family@email.com",
      role: "member",
      status: "pending",
      invitedBy: "mem_001",
      invitedByName: "Rajesh Sharma",
      createdAt: "2025-01-24",
      expiresAt: "2025-01-31",
    },
    {
      id: "inv_002",
      email: "rahul.mehta@email.com",
      phone: "+91 98765 43210",
      role: "co-admin",
      status: "pending",
      invitedBy: "mem_001",
      invitedByName: "Rajesh Sharma",
      createdAt: "2025-01-23",
      expiresAt: "2025-01-30",
    },
  ],
  settings: {
    largePaymentThreshold: 50000,
    requireApprovalAboveThreshold: true,
    allowMemberInvites: false,
    defaultMemberRole: "member",
  },
}

export const transactionCategories = [
  { id: "deposit", name: "Deposit", icon: "PlusCircle" },
  { id: "accommodation", name: "Accommodation", icon: "Building" },
  { id: "food", name: "Food & Dining", icon: "Utensils" },
  { id: "transport", name: "Transport", icon: "Car" },
  { id: "activities", name: "Activities", icon: "Target" },
  { id: "drinks", name: "Drinks", icon: "Wine" },
  { id: "treats", name: "Treats", icon: "IceCream" },
  { id: "shopping", name: "Shopping", icon: "ShoppingBag" },
  { id: "utilities", name: "Utilities", icon: "Zap" },
  { id: "other", name: "Other", icon: "Package" },
]

export const mockInvites: Invite[] = mockGroup.invites

export const mockGroupSettings: GroupSettings = mockGroup.settings

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

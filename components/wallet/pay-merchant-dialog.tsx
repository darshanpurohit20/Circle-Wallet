"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatINR, transactionCategories, type Family } from "@/lib/mock-data"
import { AlertCircleIcon } from "@/components/icons"

interface PayMerchantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  families: Family[]
  walletBalance: number
  onSubmit: (data: {
    merchantName: string
    merchantUpi?: string
    amount: number
    description: string
    category: string
    splitType: string
    splitAmong: string[]
  }) => void
}

export function PayMerchantDialog({
  open,
  onOpenChange,
  families,
  walletBalance,
  onSubmit,
}: PayMerchantDialogProps) {
  const [merchantName, setMerchantName] = useState("")
  const [merchantUpi, setMerchantUpi] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [splitType, setSplitType] = useState("all")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  // SAFE MEMBERS LIST
  const allMembers = families.flatMap((f) => f.members ?? []).filter(Boolean)

  const adults = allMembers.filter((m) => m.type === "adult" || m.role === "adult")
  const children = allMembers.filter((m) => m.type !== "adult" && m.role !== "adult")

  const handleSplitTypeChange = (type: string) => {
    setSplitType(type)
    if (type === "all") {
      setSelectedMembers(allMembers.map((m) => m.id))
    } else if (type === "adults") {
      setSelectedMembers(adults.map((m) => m.id))
    } else if (type === "children") {
      setSelectedMembers(children.map((m) => m.id))
    }
  }

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleSubmit = () => {
    onSubmit({
      merchantName,
      merchantUpi: merchantUpi || undefined,
      amount: Number(amount),
      description,
      category,
      splitType,
      splitAmong:
        splitType === "custom"
          ? selectedMembers
          : splitType === "adults"
          ? adults.map((m) => m.id)
          : splitType === "children"
          ? children.map((m) => m.id)
          : allMembers.map((m) => m.id),
    })
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setMerchantName("")
    setMerchantUpi("")
    setAmount("")
    setDescription("")
    setCategory("")
    setSplitType("all")
    setSelectedMembers([])
  }

  const amountNum = Number(amount) || 0
  const insufficientBalance = amountNum > walletBalance

  const calculateSplit = () => {
    if (!amount) return null

    const membersToSplit =
      splitType === "custom"
        ? selectedMembers
        : splitType === "adults"
        ? adults.map((m) => m.id)
        : splitType === "children"
        ? children.map((m) => m.id)
        : allMembers.map((m) => m.id)

    const membersData = allMembers.filter((m) => membersToSplit.includes(m.id))
    const totalRatio = membersData.reduce((acc, m) => acc + m.shareRatio, 0)

    return membersData.map((m) => ({
      ...m,
      share: (amountNum * m.shareRatio) / totalRatio,
    }))
  }

  const splitPreview = calculateSplit()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pay Merchant</DialogTitle>
          <DialogDescription>
            Pay a merchant from the shared wallet. Balance: {formatINR(walletBalance)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Merchant Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Merchant Name</Label>
              <Input value={merchantName} onChange={(e) => setMerchantName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>UPI ID (Optional)</Label>
              <Input value={merchantUpi} onChange={(e) => setMerchantUpi(e.target.value)} />
            </div>
          </div>

          {/* Amount + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (INR)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              {insufficientBalance && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="w-3 h-3" />
                  Insufficient balance
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {transactionCategories
                    .filter((c) => c.id !== "deposit")
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this payment for?"
            />
          </div>

          {/* Split selection */}
          <div className="space-y-3">
            <Label>Split Among</Label>
            <Tabs value={splitType} onValueChange={handleSplitTypeChange}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">Everyone</TabsTrigger>
                <TabsTrigger value="adults">Adults</TabsTrigger>
                <TabsTrigger value="children">Kids</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>

              {/* Custom Split */}
              <TabsContent value="custom" className="mt-4">
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {families.map((family) => (
                    <div key={family.id} className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">{family.name}</p>

                      {(family.members ?? []).map((member) => (
                        <div key={member.id} className="flex items-center gap-3">
                          <Checkbox
                            id={member.id}
                            checked={selectedMembers.includes(member.id)}
                            onCheckedChange={() => toggleMember(member.id)}
                          />
                          <label htmlFor={member.id} className="flex items-center gap-2 flex-1 cursor-pointer">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-[10px]">
                                {member.name.split(" ").map((x) => x[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.name}</span>

                            <span className="text-xs text-muted-foreground ml-auto">
                              {(member.shareRatio * 100).toFixed(0)}%
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Split Preview */}
          {splitPreview && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Split Preview</p>
              {splitPreview.map((member) => (
                <div key={member.id} className="flex justify-between text-sm">
                  <span>{member.name}</span>
                  <span className="font-medium">{formatINR(member.share)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!merchantName || !amount || !category || !description || insufficientBalance}
          >
            Pay {amount ? formatINR(amountNum) : "Merchant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

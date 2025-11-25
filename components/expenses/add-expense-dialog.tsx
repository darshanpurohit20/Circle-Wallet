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
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Family } from "@/lib/mock-data"
import { expenseCategories } from "@/lib/mock-data"

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  families: Family[]
  currency: string
  onSubmit: (data: {
    description: string
    amount: number
    category: string
    paidBy: string
    splitType: string
    splitAmong: string[]
  }) => void
}

export function AddExpenseDialog({ open, onOpenChange, families, currency, onSubmit }: AddExpenseDialogProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [paidBy, setPaidBy] = useState("")
  const [splitType, setSplitType] = useState("all")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const allMembers = families.flatMap((f) => f.members)
  const adults = allMembers.filter((m) => m.type === "adult")
  const children = allMembers.filter((m) => m.type !== "adult")

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
    setSelectedMembers((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }

  const handleSubmit = () => {
    onSubmit({
      description,
      amount: Number.parseFloat(amount),
      category,
      paidBy,
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
    setDescription("")
    setAmount("")
    setCategory("")
    setPaidBy("")
    setSplitType("all")
    setSelectedMembers([])
  }

  const calculateSplit = () => {
    if (!amount) return null
    const amountNum = Number.parseFloat(amount)
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
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Add a new expense and choose how to split it among members.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What was this for?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({currency})</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min={0}
                step={0.01}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Paid By</Label>
              <Select value={paidBy} onValueChange={setPaidBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Who paid?" />
                </SelectTrigger>
                <SelectContent>
                  {allMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <span className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-[10px]">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Split Among</Label>
            <Tabs value={splitType} onValueChange={handleSplitTypeChange}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">Everyone</TabsTrigger>
                <TabsTrigger value="adults">Adults</TabsTrigger>
                <TabsTrigger value="children">Kids</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>

              <TabsContent value="custom" className="mt-4">
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {families.map((family) => (
                    <div key={family.id} className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">{family.name}</p>
                      {family.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3">
                          <Checkbox
                            id={member.id}
                            checked={selectedMembers.includes(member.id)}
                            onCheckedChange={() => toggleMember(member.id)}
                          />
                          <label htmlFor={member.id} className="flex items-center gap-2 cursor-pointer flex-1">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-[10px]">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
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

          {splitPreview && splitPreview.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium text-foreground mb-3">Split Preview</p>
              <div className="space-y-2">
                {splitPreview.map((member) => (
                  <div key={member.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{member.name}</span>
                    <span className="font-medium text-foreground">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(member.share)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!description || !amount || !category || !paidBy}>
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

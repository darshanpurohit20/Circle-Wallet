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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatINR, type Family } from "@/lib/mock-data"

interface AddFundsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  families: Family[]
  onSubmit: (data: { familyId: string; amount: number; method: string }) => void
}

export function AddFundsDialog({ open, onOpenChange, families, onSubmit }: AddFundsDialogProps) {
  const [familyId, setFamilyId] = useState("")
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("upi")

  const handleSubmit = () => {
    onSubmit({
      familyId,
      amount: Number.parseFloat(amount),
      method,
    })
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setFamilyId("")
    setAmount("")
    setMethod("upi")
  }

  const quickAmounts = [5000, 10000, 25000, 50000]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Funds to Wallet</DialogTitle>
          <DialogDescription>Add money to the shared wallet from your family account.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Contributing Family</Label>
            <Select value={familyId} onValueChange={setFamilyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select family" />
              </SelectTrigger>
              <SelectContent>
                {families.map((family) => (
                  <SelectItem key={family.id} value={family.id}>
                    {family.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (INR)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min={100}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="text-xs"
                >
                  {formatINR(quickAmount)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup value={method} onValueChange={setMethod} className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="cursor-pointer flex-1">
                  <span className="font-medium">UPI</span>
                  <p className="text-xs text-muted-foreground">GPay, PhonePe, Paytm</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="cursor-pointer flex-1">
                  <span className="font-medium">Bank Transfer</span>
                  <p className="text-xs text-muted-foreground">NEFT/IMPS</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="cursor-pointer flex-1">
                  <span className="font-medium">Card</span>
                  <p className="text-xs text-muted-foreground">Debit/Credit</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="cursor-pointer flex-1">
                  <span className="font-medium">Cash</span>
                  <p className="text-xs text-muted-foreground">Manual entry</p>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!familyId || !amount || Number(amount) < 100}>
            Add {amount ? formatINR(Number(amount)) : "Funds"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

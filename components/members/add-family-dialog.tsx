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

interface AddFamilyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; initialContribution: number }) => void
  currency: string
}

export function AddFamilyDialog({ open, onOpenChange, onSubmit, currency }: AddFamilyDialogProps) {
  const [name, setName] = useState("")
  const [contribution, setContribution] = useState("")

  const handleSubmit = () => {
    onSubmit({
      name,
      initialContribution: Number.parseFloat(contribution) || 0,
    })
    setName("")
    setContribution("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Family/Person</DialogTitle>
          <DialogDescription>Add a new family or individual to join your Circle Wallet group.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="familyName">Family/Person Name</Label>
            <Input
              id="familyName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., The Wilsons or John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution">Initial Contribution ({currency})</Label>
            <Input
              id="contribution"
              type="number"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              placeholder="0.00"
              min={0}
              step={0.01}
            />
            <p className="text-xs text-muted-foreground">Optional: Amount to contribute to the shared wallet.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name}>
            Add to Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

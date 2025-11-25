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
import { Slider } from "@/components/ui/slider"

interface AddMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  familyName: string
  onSubmit: (data: { name: string; type: string; age?: number; shareRatio: number }) => void
}

export function AddMemberDialog({ open, onOpenChange, familyName, onSubmit }: AddMemberDialogProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState("adult")
  const [age, setAge] = useState("")
  const [shareRatio, setShareRatio] = useState([1.0])

  const handleTypeChange = (newType: string) => {
    setType(newType)
    if (newType === "adult") {
      setShareRatio([1.0])
    } else if (newType === "teenager") {
      setShareRatio([0.8])
    } else {
      setShareRatio([0.5])
    }
  }

  const handleSubmit = () => {
    onSubmit({
      name,
      type,
      age: age ? Number.parseInt(age) : undefined,
      shareRatio: shareRatio[0],
    })
    setName("")
    setType("adult")
    setAge("")
    setShareRatio([1.0])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member to {familyName}</DialogTitle>
          <DialogDescription>Add a new family member with their share ratio for expense splitting.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter member name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Member Type</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adult">Adult (Full share)</SelectItem>
                <SelectItem value="teenager">Teenager (80% share)</SelectItem>
                <SelectItem value="child">Child (50% share)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(type === "teenager" || type === "child") && (
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter age"
                min={0}
                max={17}
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Share Ratio</Label>
              <span className="text-sm font-medium text-foreground">{(shareRatio[0] * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={shareRatio}
              onValueChange={setShareRatio}
              min={0.1}
              max={1.0}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              This ratio determines how expenses are split for this member.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name}>
            Add Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

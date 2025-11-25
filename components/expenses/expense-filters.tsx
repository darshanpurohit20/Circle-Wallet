"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { transactionCategories as expenseCategories } from "@/lib/mock-data"


interface ExpenseFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  splitType: string
  onSplitTypeChange: (value: string) => void
  onClearFilters: () => void
}

export function ExpenseFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  splitType,
  onSplitTypeChange,
  onClearFilters,
}: ExpenseFiltersProps) {
  const hasFilters = search || category !== "all" || status !== "all" || splitType !== "all"

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="sm:max-w-xs"
        />

        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
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

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={splitType} onValueChange={onSplitTypeChange}>
          <SelectTrigger className="sm:w-[150px]">
            <SelectValue placeholder="Split Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Splits</SelectItem>
            <SelectItem value="all-members">Everyone</SelectItem>
            <SelectItem value="adults">Adults Only</SelectItem>
            <SelectItem value="children">Kids Only</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" onClick={onClearFilters} className="sm:ml-auto">
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}

"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GroupSettings } from "@/lib/mock-data"

interface PermissionsSettingsProps {
  settings: GroupSettings
  currency: string
  onSettingsChange: (settings: Partial<GroupSettings>) => void
}

export function PermissionsSettings({ settings, currency, onSettingsChange }: PermissionsSettingsProps) {
  return (
    <Card className="p-4 md:p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-1">Group Permissions</h3>
        <p className="text-sm text-muted-foreground">Control how members can interact with the group</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allow-invites" className="font-medium">
              Allow Members to Invite
            </Label>
            <p className="text-sm text-muted-foreground">Let regular members send invitations</p>
          </div>
          <Switch
            id="allow-invites"
            checked={settings.allowMemberInvites}
            onCheckedChange={(checked) => onSettingsChange({ allowMemberInvites: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="require-approval" className="font-medium">
              Require Approval for Large Payments
            </Label>
            <p className="text-sm text-muted-foreground">Admin/Co-admin must confirm expenses above threshold</p>
          </div>
          <Switch
            id="require-approval"
            checked={settings.requireApprovalAboveThreshold}
            onCheckedChange={(checked) => onSettingsChange({ requireApprovalAboveThreshold: checked })}
          />
        </div>

        {settings.requireApprovalAboveThreshold && (
          <div className="pl-4 border-l-2 border-primary/20">
            <Label htmlFor="threshold">Payment Threshold ({currency})</Label>
            <Input
              id="threshold"
              type="number"
              value={settings.largePaymentThreshold}
              onChange={(e) => onSettingsChange({ largePaymentThreshold: Number.parseFloat(e.target.value) || 0 })}
              className="mt-2 max-w-xs"
              min={0}
              step={100}
            />
            <p className="text-xs text-muted-foreground mt-1">Expenses above this amount need admin approval</p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Default Role for New Members</Label>
          <Select
            value={settings.defaultMemberRole}
            onValueChange={(value) => onSettingsChange({ defaultMemberRole: value as "member" | "co-admin" })}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="co-admin">Co-Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}

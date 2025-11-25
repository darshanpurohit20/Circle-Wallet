"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClockIcon, XIcon, CheckCircleIcon } from "@/components/icons"
import type { Invite } from "@/lib/mock-data"

interface PendingInvitesProps {
  invites: Invite[]
  onResend: (inviteId: string) => void
  onCancel: (inviteId: string) => void
}

export function PendingInvites({ invites, onResend, onCancel }: PendingInvitesProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <ClockIcon className="w-3 h-3" />
            Pending
          </Badge>
        )
      case "accepted":
        return (
          <Badge className="gap-1 bg-success text-success-foreground">
            <CheckCircleIcon className="w-3 h-3" />
            Accepted
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="destructive" className="gap-1">
            Expired
          </Badge>
        )
      default:
        return null
    }
  }

  if (invites.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No pending invitations</p>
      </Card>
    )
  }

  return (
    <Card className="divide-y divide-border">
      {invites.map((invite) => (
        <div key={invite.id} className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground">
            {invite.email[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-foreground truncate">{invite.email}</p>
              {getStatusBadge(invite.status)}
              <Badge variant="outline" className="capitalize">
                {invite.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Invited by {invite.invitedByName} • Expires {formatDate(invite.expiresAt)}
            </p>
          </div>

          {invite.status === "pending" && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => onResend(invite.id)}>
                Resend
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onCancel(invite.id)}>
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          )}

          {invite.status === "expired" && (
            <Button variant="outline" size="sm" onClick={() => onResend(invite.id)}>
              Resend
            </Button>
          )}
        </div>
      ))}
    </Card>
  )
}

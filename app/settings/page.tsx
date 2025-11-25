"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { mockGroup } from "@/lib/mock-data"
import { SettingsIcon, UsersIcon, BellIcon, WalletIcon } from "@/components/icons"

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
]

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ja", name: "日本語" },
  { code: "zh", name: "中文" },
  { code: "hi", name: "हिन्दी" },
]

export default function SettingsPage() {
  const [group] = useState(mockGroup)
  const [groupName, setGroupName] = useState(group.name)
  const [groupDescription, setGroupDescription] = useState(group.description)
  const [currency, setCurrency] = useState(group.currency)
  const [language, setLanguage] = useState("en")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [expenseAlerts, setExpenseAlerts] = useState(true)
  const [lowBalanceAlerts, setLowBalanceAlerts] = useState(true)
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState("500")

  const handleSaveGroup = () => {
    console.log("Saving group settings:", { groupName, groupDescription, currency })
  }

  const handleSaveNotifications = () => {
    console.log("Saving notification settings")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header groupName={group.name} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your group and account settings</p>
        </div>

        <Tabs defaultValue="group" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            <TabsTrigger value="group" className="gap-2">
              <UsersIcon className="w-4 h-4 hidden sm:block" />
              Group
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-2">
              <WalletIcon className="w-4 h-4 hidden sm:block" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <BellIcon className="w-4 h-4 hidden sm:block" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <SettingsIcon className="w-4 h-4 hidden sm:block" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="group">
            <Card className="p-4 md:p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Group Settings</h2>
                <p className="text-sm text-muted-foreground">Update your group name and description</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input id="groupName" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupDescription">Description</Label>
                  <Textarea
                    id="groupDescription"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          <span className="flex items-center gap-2">
                            <span className="font-mono">{c.symbol}</span>
                            <span>
                              {c.name} ({c.code})
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Changing currency will not convert existing amounts</p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={handleSaveGroup}>Save Changes</Button>
              </div>
            </Card>

            <Card className="p-4 md:p-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">Irreversible actions for this group</p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Archive Group</p>
                    <p className="text-sm text-muted-foreground">Hide this group from your dashboard</p>
                  </div>
                  <Button variant="outline">Archive</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                  <div>
                    <p className="font-medium text-foreground">Delete Group</p>
                    <p className="text-sm text-muted-foreground">Permanently delete this group and all data</p>
                  </div>
                  <Button variant="destructive">Delete</Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="wallet">
            <Card className="p-4 md:p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Wallet Settings</h2>
                <p className="text-sm text-muted-foreground">Configure your shared wallet preferences</p>
              </div>

              <div className="grid gap-6">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Current Balance</span>
                    <Badge variant="secondary">Shared</Badge>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: group.currency }).format(
                      group.sharedWalletBalance,
                    )}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Low Balance Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when balance is low</p>
                    </div>
                    <Switch checked={lowBalanceAlerts} onCheckedChange={setLowBalanceAlerts} />
                  </div>

                  {lowBalanceAlerts && (
                    <div className="pl-4 border-l-2 border-primary/20">
                      <Label htmlFor="threshold">Alert Threshold ({currency})</Label>
                      <Input
                        id="threshold"
                        type="number"
                        value={lowBalanceThreshold}
                        onChange={(e) => setLowBalanceThreshold(e.target.value)}
                        className="mt-2 max-w-xs"
                        min={0}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button>Save Changes</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-4 md:p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Notification Preferences</h2>
                <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Expense Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when expenses are added</p>
                  </div>
                  <Switch checked={expenseAlerts} onCheckedChange={setExpenseAlerts} />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={handleSaveNotifications}>Save Changes</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="p-4 md:p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Account Settings</h2>
                <p className="text-sm text-muted-foreground">Manage your personal account</p>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/professional-man.png" alt="Profile" />
                  <AvatarFallback>MJ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">Michael Johnson</p>
                  <p className="text-sm text-muted-foreground">michael.johnson@email.com</p>
                  <Badge className="mt-1">Admin</Badge>
                </div>
                <Button variant="outline" className="ml-auto bg-transparent">
                  Change Photo
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => (
                        <SelectItem key={l.code} value={l.code}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                  <Button variant="outline">Update</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button>Save Changes</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

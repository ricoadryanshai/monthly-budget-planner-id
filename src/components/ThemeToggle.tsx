
import * as React from "react"
import { useTheme } from "next-themes"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="theme-switch">Light</Label>
      <Switch
        id="theme-switch"
        checked={resolvedTheme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      <Label htmlFor="theme-switch">Dark</Label>
    </div>
  )
}

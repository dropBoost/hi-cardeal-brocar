"use client"

import * as React from "react"
import { Moon, Sun, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ToggleDarkMode() {
  const { setTheme } = useTheme()

  return (
  <>
    <Button variant="icon" className={`hover:bg-muted`} onClick={() => setTheme("light")}><Sun/></Button>
    <Button variant="icon" className={`hover:bg-muted`} onClick={() => setTheme("dark")}><Moon/></Button>
    <Button variant="icon" className={`hover:bg-muted`} onClick={() => setTheme("system")}><Settings/></Button>
  </>
  )
}

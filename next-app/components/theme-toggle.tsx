"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

type Theme = "light" | "dark"

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const storedTheme = localStorage.getItem("theme")
    const initialTheme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : root.classList.contains("dark")
          ? "dark"
          : "light"

    setTheme(initialTheme)
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark"
    const root = document.documentElement

    root.classList.toggle("dark", nextTheme === "dark")
    localStorage.setItem("theme", nextTheme)
    setTheme(nextTheme)
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      className="rounded-full"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {mounted && theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}

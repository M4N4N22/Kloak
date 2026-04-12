"use client"

import Image from "next/image"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type ActionProgressOverlayProps = {
  open: boolean
  eyebrow?: string
  title: string
  description: string
  statusLabel?: string
}

export function ActionProgressOverlay({
  open,
  eyebrow = "Secure Transaction",
  title,
  description,
  statusLabel,
}: ActionProgressOverlayProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[400px]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        {/* Top Glow Accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="relative space-y-8 p-10 text-center">

          {/* 1. THE ADVANCED LOADER: Concentric Rings */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center ">
            {/* Outer Rotating Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-foreground/5 border-t-primary  animate-[spin_3s_linear_infinite]" />
            {/* Inner Counter-Rotating Ring */}
            <div className="absolute inset-2 rounded-full border-4 border-foreground/5 border-b-primary animate-[spin_2s_linear_infinite_reverse]" />

            {/* Center Icon */}
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl text-primary shadow-[0_0_30px_-5px_rgba(var(--primary-rgb),0.3)]">
              <Image
                src="/kloak_logo.png"
                alt="Kloak"
                height={36}
                width={36}
                className="relative rounded-full border border-foreground/10"
              />
            </div>
          </div>

          {/* 2. TEXT CONTENT */}
          <DialogHeader className="items-center space-y-3">
            <DialogTitle className="text-2xl  tracking-tight text-foreground">
              {title}
            </DialogTitle>
            <DialogDescription className="max-w-[280px] text-sm leading-relaxed text-neutral-500">
              {description}
            </DialogDescription>
          </DialogHeader>

          {/* 3. THE "CONSOLE" STATUS BOX */}
          {statusLabel ? (
            <div className="relative mt-2 overflow-hidden rounded-[1.5rem]  bg-foreground/[0.02] p-5 shadow-inner">
              {/* Animated Background Scanning Effect */}
              <div className="absolute inset-x-0 top-0 h-[100%] w-full bg-gradient-to-b from-primary/[0.03] to-transparent animate-[pulse_2s_ease-in-out_infinite]" />

              <div className="relative flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-medium text-neutral-600">
                    Current Step
                  </p>
                </div>
                <p className="font-mono text-sm font-medium text-neutral-300 tracking-tight">
                  {statusLabel}
                </p>
              </div>
            </div>
          ) : null}

          {/* Subtle Bottom Footer */}
          <div className="flex items-center justify-center gap-2 pt-2 opacity-30">
            <span className="text-[9px] font-medium   text-neutral-500">
              Kloak | Powered by Aleo
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
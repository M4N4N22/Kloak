import { cn } from "@/lib/utils"

export default function AnimatedButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn("animated-border-btn", className)} {...props}>
      <div className="animated-border-inner px-6 py-3 text-lg font-semibold uppercase hover:opacity-90 cursor-pointer">
        {children}
      </div>
    </button>
  )
}
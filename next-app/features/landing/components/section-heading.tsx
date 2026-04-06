type SectionHeadingProps = {
  eyebrow: string
  title: string
  description: string
  centered?: boolean
}

export function SectionHeading({ eyebrow, title, description, centered = false }: SectionHeadingProps) {
  return (
    <div className={centered ? "space-y-4 text-center" : "space-y-4"}>
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
      <div className="space-y-3">
        <h2
          className={
            centered
              ? "mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              : "max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          }
        >
          {title}
        </h2>
        <p
          className={
            centered
              ? "mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base"
              : "max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base"
          }
        >
          {description}
        </p>
      </div>
    </div>
  )
}

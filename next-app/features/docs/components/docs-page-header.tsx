type DocsPageHeaderProps = {
  eyebrow: string
  title: string
  description: string
}

export function DocsPageHeader({ eyebrow, title, description }: DocsPageHeaderProps) {
  return (
    <section className="rounded-[2rem] border border-foreground/8 bg-black/20 px-6 py-7 backdrop-blur-xl">
      <div className="max-w-3xl space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="text-sm leading-7 text-zinc-400 sm:text-base">{description}</p>
      </div>
    </section>
  )
}

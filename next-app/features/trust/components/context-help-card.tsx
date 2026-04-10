import Link from "next/link"

type ContextHelpLink = {
  label: string
  href: string
}

type ContextHelpCardProps = {
  eyebrow?: string
  title: string
  description: string
  links: ContextHelpLink[]
}

export function ContextHelpCard({
  eyebrow = "Need help?",
  title,
  description,
  links,
}: ContextHelpCardProps) {
  return (
    <section className="rounded-[2rem] border  bg-black/20 px-5 py-5 backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold text-primary">
            {eyebrow}
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="text-sm leading-6 text-neutral-400">{description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-foreground/10 bg-foreground/[0.04] px-4 py-2 text-sm text-foreground transition-colors hover:bg-foreground/[0.07]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

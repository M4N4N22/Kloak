import Link from "next/link"

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Payment Links", href: "/payment-links" },
      { label: "Compliance", href: "/compliance" },
      { label: "Bots", href: "/bots" },
    ],
  },
  {
    title: "Ops",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Webhooks", href: "/webhooks" },
      { label: "Automation", href: "/dashboard" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "GitHub", href: "https://github.com" },
      { label: "Demo", href: "https://youtu.be/b1AdffOf_PM" },
      { label: "Docs", href: "/compliance" },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-foreground/5 bg-black py-14">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Kloak</p>
          <h2 className="max-w-lg text-2xl font-semibold tracking-tight text-foreground">
            Payment links with private settlement and selective disclosure when it matters.
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                {group.title}
              </p>
              <div className="space-y-2">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-zinc-400 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-foreground/5 px-6 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>{"\u00A9"} 2026 Kloak Labs</p>
        <p>Built for payments that need privacy and proof.</p>
      </div>
    </footer>
  )
}

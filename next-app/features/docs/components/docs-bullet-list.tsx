type DocsBulletListProps = {
  items: readonly string[]
}

export function DocsBulletList({ items }: DocsBulletListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item} className="flex  gap-3">
          <span className="text-primary">{">>"}</span>
          <p className="flex-1 text-sm leading-7 text-neutral-400">{item}</p>
        </div>
      ))}
    </div>
  )
}

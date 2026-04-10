import Link from "next/link"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type DocsBreadcrumb = {
  label: string
  href?: string
}

export function DocsBreadcrumbs({ items }: { items: DocsBreadcrumb[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs">
        {items.map((item, index) => [
          <BreadcrumbItem key={`${item.label}-${index}`}>
            {item.href ? (
              <BreadcrumbLink asChild>
                <Link href={item.href}>{item.label}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>,
          index < items.length - 1 ? <BreadcrumbSeparator key={`${item.label}-${index}-separator`} /> : null,
        ])}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

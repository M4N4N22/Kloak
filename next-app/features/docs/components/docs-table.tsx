import type { ReactNode } from "react"

type DocsTableProps = {
  headers: string[]
  rows: ReactNode[][]
}

export function DocsTable({ headers, rows }: DocsTableProps) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-foreground/8 bg-black/20">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-foreground/8 text-sm">
          <thead className="bg-foreground/[0.03]">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-left font-medium text-neutral-300">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/8">
            {rows.map((row, index) => (
              <tr key={index} className="align-top">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-4 text-neutral-400">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import type { TopPageRow } from "@/lib/types";
import { formatNumber } from "@/lib/format";

export function TopPagesTable({ pages }: { pages: TopPageRow[] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left text-gray-500">
          <th className="pb-2 font-medium">#</th>
          <th className="pb-2 font-medium">Pagina</th>
          <th className="pb-2 text-right font-medium">Pageview</th>
        </tr>
      </thead>
      <tbody>
        {pages.map((p, i) => (
          <tr key={p.path} className="border-t border-bg-border">
            <td className="py-2 text-gray-600">{i + 1}</td>
            <td className="max-w-0 py-2">
              <p className="truncate text-gray-200" title={p.path}>
                {p.title || p.path}
              </p>
              <p className="truncate text-[11px] text-gray-600" title={p.path}>
                {p.path}
              </p>
            </td>
            <td className="py-2 text-right font-medium text-white">{formatNumber(p.pageviews)}</td>
          </tr>
        ))}
        {pages.length === 0 && (
          <tr>
            <td colSpan={3} className="py-3 text-center text-gray-600">
              Nessun dato disponibile
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

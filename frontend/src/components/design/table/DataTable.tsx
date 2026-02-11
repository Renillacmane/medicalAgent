export type DesignTableRow = {
  service: string;
  status: string;
  note: string;
};

/**
 * Design system: Table with Service / Status / Note columns.
 */
export default function DataTable({
  rows,
  className = "",
}: {
  rows: DesignTableRow[];
  className?: string;
}) {
  return (
    <table className={`min-w-full text-left text-sm ${className}`.trim()}>
      <thead className="border-b border-light-green-subtle/80 bg-light-green-light/60">
        <tr>
          <th className="px-4 py-3 font-semibold text-light-green-dark">Service</th>
          <th className="px-4 py-3 font-semibold text-light-green-dark">Status</th>
          <th className="px-4 py-3 font-semibold text-light-green-dark">Note</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-light-green-subtle/40">
        {rows.map((row) => (
          <tr key={row.service} className="transition-colors hover:bg-light-green-light/40">
            <td className="px-4 py-3 font-medium text-light-green-dark">{row.service}</td>
            <td className="px-4 py-3 text-light-green-dark-grey">{row.status}</td>
            <td className="px-4 py-3 text-light-green-light-grey">{row.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

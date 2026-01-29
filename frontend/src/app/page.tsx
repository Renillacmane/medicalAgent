import Widget from "@/components/Widget";

// Dummy data for testing the index page
const DUMMY_SUMMARY = {
  title: "Daily summary",
  date: new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" }),
  items: [
    { id: 1, label: "Recommendations today", value: "3" },
    { id: 2, label: "Active goals", value: "2" },
    { id: 3, label: "Last check-in", value: "Yesterday" },
  ],
};

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Medical Agent</h1>
        <p className="mb-6 text-slate-600">Test page – widget in bottom right.</p>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{DUMMY_SUMMARY.title}</h2>
          <p className="mb-4 text-sm text-slate-500">{DUMMY_SUMMARY.date}</p>
          <ul className="space-y-2">
            {DUMMY_SUMMARY.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-medium text-slate-800">{item.value}</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-6 text-sm text-slate-500">
          Click the &quot;Hi&quot; button in the bottom right to open the widget and sign in.
        </p>
      </div>

      <Widget />
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { OPPORTUNITIES } from "@/lib/skillbridge";

export const Route = createFileRoute("/opportunities/")({
  head: () => ({
    meta: [
      { title: "Opportunities — SkillBridge Lite" },
      { name: "description", content: "Browse sample early-career opportunities." },
      { property: "og:title", content: "Opportunities — SkillBridge Lite" },
      { property: "og:description", content: "Browse sample early-career opportunities." },
    ],
  }),
  component: List,
});

function List() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Opportunities</h1>
      <p className="mt-2 text-muted-foreground">Sample opportunities to compare with your profile.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {OPPORTUNITIES.map((o) => (
          <article key={o.id} className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">{o.company}</p>
            <h2 className="mt-1 font-display text-lg font-semibold">{o.title}</h2>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">{o.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {o.skills.map((s) => (
                <span key={s} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{s}</span>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/opportunities/$id" params={{ id: o.id }}>View Details</Link>
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useProfile, type Profile } from "@/lib/skillbridge";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — SkillBridge Lite" },
      { name: "description", content: "Enter your skills, projects, and experience." },
      { property: "og:title", content: "My Profile — SkillBridge Lite" },
      { property: "og:description", content: "Enter your skills, projects, and experience." },
    ],
  }),
  component: ProfilePage,
});

const fields: { key: keyof Profile; label: string; area?: boolean; hint?: string }[] = [
  { key: "name", label: "Name" },
  { key: "headline", label: "Headline" },
  { key: "about", label: "About", area: true },
  { key: "skills", label: "Skills", hint: "Separate with commas, e.g. Python, React, APIs" },
  { key: "projects", label: "Projects", area: true },
  { key: "experience", label: "Experience", area: true },
];

function ProfilePage() {
  const { profile, isSample, saveProfile } = useProfile();
  const [form, setForm] = useState<Profile>(profile);
  const [saved, setSaved] = useState(false);

  return (
    <section className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">My Profile</h1>
      <p className="mt-2 text-muted-foreground">Changes are kept while this page stays open.</p>
      {isSample && (
        <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <strong>Sample profile.</strong> This is placeholder data, not your information. Edit
          the fields and save to use your own.
        </div>
      )}
      <form
        className="mt-8 space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          saveProfile(form);
          setSaved(true);
        }}
      >
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="text-sm font-medium">{f.label}</span>
            {f.area ? (
              <textarea
                rows={3}
                value={form[f.key]}
                onChange={(e) => { setForm({ ...form, [f.key]: e.target.value }); setSaved(false); }}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <input
                value={form[f.key]}
                onChange={(e) => { setForm({ ...form, [f.key]: e.target.value }); setSaved(false); }}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            {f.hint && <span className="mt-1 block text-xs text-muted-foreground">{f.hint}</span>}
          </label>
        ))}
        {saved && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm"
          >
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              <strong>Profile saved.</strong> Your updates are now in use — opportunity fit
              analysis will use this latest saved profile.
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Button type="submit">{saved ? "Saved ✓ — Save Again" : "Save Profile"}</Button>
        </div>
      </form>
    </section>
  );
}

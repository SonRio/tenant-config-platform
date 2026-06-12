import Link from "next/link";
import { Layers } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "Tenants" },
  { href: "/preview", label: "Preview" },
  { href: "/diff", label: "Diff" },
];

export function AppNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-soft">
            <Layers className="size-4" />
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            Tenant Config
          </span>
        </Link>
        <div className="flex gap-5 text-sm text-muted-foreground">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

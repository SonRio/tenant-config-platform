import Link from "next/link";

const links = [
  { href: "/", label: "Tenants" },
  { href: "/preview", label: "Preview" },
  { href: "/diff", label: "Diff" },
];

export function AppNav() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
        <Link href="/" className="font-semibold">
          Tenant Config Platform
        </Link>
        <div className="flex gap-4 text-sm text-muted-foreground">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

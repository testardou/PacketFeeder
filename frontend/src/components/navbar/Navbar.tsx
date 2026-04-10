import { Play, Plug, File, Film, Link as LinkIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/themeToggle/ThemeToggle";

const items = [
  { title: "Files", url: "/files", icon: File },
  { title: "Replay", url: "/replay", icon: Play },
  { title: "Mitre", url: "/mitre", icon: Film },
  { title: "Scenario", url: "/scenario", icon: LinkIcon },
  { title: "Live", url: "/live", icon: Plug },
];

export function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="flex items-center justify-between border-b border-border bg-card px-6 py-2 sticky top-0 z-4">
      <div className="flex items-center gap-1">
        <span className="text-lg font-bold mr-6">PacketFeeder</span>
        {items.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent ${
              pathname.startsWith(item.url)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            }`}
          >
            <item.icon size={16} />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
      <ThemeToggle />
    </nav>
  );
}

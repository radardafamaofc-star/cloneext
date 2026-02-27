import { Link, useLocation } from "wouter";
import { Bot, LayoutDashboard, Settings as SettingsIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar variant="inset" className="border-r border-border/50">
      <SidebarHeader className="flex flex-row items-center gap-2 px-4 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight font-display">GroqBot</span>
          <span className="text-xs text-muted-foreground leading-none">Sales Assistant</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    tooltip={item.name}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex min-h-screen w-full bg-background/50">
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <div className="flex-1" />
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

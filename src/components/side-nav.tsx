
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { LayoutDashboard, ArrowRightLeft, Shapes, FileText } from "lucide-react";

const menuItems = [
  { href: "/", label: "Dasbor", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowRightLeft },
  { href: "/categories", label: "Kategori", icon: Shapes },
  { href: "/report", label: "Laporan", icon: FileText },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 text-primary" />
          <h1 className="font-headline text-lg font-bold text-primary-foreground group-data-[collapsible=icon]:hidden">
            Al Madani
          </h1>
        </div>
      </SidebarHeader>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref>
              <SidebarMenuButton
                as="a"
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
         <SidebarTrigger className="self-start" />
      </SidebarFooter>
    </Sidebar>
  );
}

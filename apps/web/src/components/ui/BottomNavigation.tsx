"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, RotateCcw, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  {
    name: 'History',
    href: '/user-history',
    icon: RotateCcw,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-surface border-t border-border px-6 pb-safe pt-2 z-50">
      <div className="flex justify-between items-center h-full max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-primary" : "text-text-muted hover:text-text-main"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              <span className={cn(
                "text-[10px] tracking-wide uppercase",
                isActive ? "font-bold" : "font-semibold"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

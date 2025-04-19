// components/dashboard/Sidebar.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  FileText, 
  Upload, 
  ChevronRight,
  ChevronLeft,
  MessageCircle
} from 'lucide-react';
import { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: JSX.Element;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <Home size={20} />,
    },
    {
      name: 'Chat',
      href: '/dashboard/chat',
      icon: <MessageCircle size={20} />,
    },
    {
      name: 'CV Library',
      href: '/dashboard/cvs',
      icon: <FileText size={20} />,
    },
    {
      name: 'Upload CV',
      href: '/dashboard/upload',
      icon: <Upload size={20} />,
    },
  ];

  return (
    <aside className={cn(
      "hidden md:block bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-end mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        
        <nav className="space-y-1 flex-1">
          {navigationItems.map((item) => (
            <Link 
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                pathname === item.href 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && "justify-center"
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className={cn(
          "mt-auto pt-4 border-t border-gray-200",
          collapsed ? "text-center" : ""
        )}>
          {!collapsed && (
            <div className="px-2 text-xs text-gray-500">
              <p>CV Quota: 12/30 used</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
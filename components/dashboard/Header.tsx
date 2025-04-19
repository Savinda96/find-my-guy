'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Bell, Menu, X, LogOut } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [signingOut, setSigningOut] = useState<boolean>(false);
  const router = useRouter();
  const supabase = createClient();
  
  const toggleMobileMenu = (): void => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Redirect to sign-in page after successful sign-out
      router.push('/auth');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      // Show error message to user (you could add a toast notification here)
    } finally {
      setSigningOut(false);
    }
  };

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'FG';

  return (
    <header className="bg-white shadow sticky top-0 z-10 border-b border-gray-200">
      <div className="w-full px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex-1">
            <Link href="/dashboard" className="flex items-center">
              <div className="bg-black rounded-md p-1.5 mr-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 5.5V3C14 1.89543 13.1046 1 12 1H4C2.89543 1 2 1.89543 2 3V13C2 14.1046 2.89543 15 4 15H12C13.1046 15 14 14.1046 14 13V10.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M6 8H13M13 8L10.5 5.5M13 8L10.5 10.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-semibold text-lg">FindMyGuy</span>
            </Link>
          </div>

          {/* Center space */}
          <div className="flex-1"></div>

          {/* Right side - Icons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Bell size={20} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/dashboard" className="px-2 py-1 text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/dashboard/cvs" className="px-2 py-1 text-gray-600 hover:text-gray-900">
                My CVs
              </Link>
              <Link href="/dashboard/upload" className="px-2 py-1 text-gray-600 hover:text-gray-900">
                Upload CV
              </Link>
              <Link href="/dashboard/profile" className="px-2 py-1 text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <Link href="/dashboard/settings" className="px-2 py-1 text-gray-600 hover:text-gray-900">
                Settings
              </Link>
              <button 
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center px-2 py-1 text-red-600 hover:text-red-800"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {signingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
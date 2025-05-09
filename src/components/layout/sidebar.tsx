import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Briefcase, FileCheck, Settings, BarChart3 } from 'lucide-react';

type SidebarProps = {
  userRole: 'admin' | 'notary' | 'customer' | 'secretary';
  userName: string;
  userEmail: string;
  pendingCount?: number;
};

export function Sidebar({ userRole, userName, userEmail, pendingCount = 0 }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('dashboard');
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };
  
  return (
    <div className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">NotaryNow</span>
        </div>
      </div>
      <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
        <div className="px-4 mb-5">
          <Badge className="w-full justify-center py-1" variant="outline">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Badge>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <Button 
            variant={activeItem === "dashboard" ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveItem("dashboard")}
            asChild
          >
            <Link href={`/dashboard/${userRole}`}>
              <BarChart3 className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
          </Button>
          
          {(userRole === 'admin' || userRole === 'secretary') && (
            <Button 
              variant={activeItem === "notaries" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveItem("notaries")}
              asChild
            >
              <Link href={`/dashboard/${userRole}/notaries`}>
                <Briefcase className="mr-3 h-5 w-5" />
                Notaries
                {pendingCount > 0 && (
                  <Badge className="ml-auto">{pendingCount}</Badge>
                )}
              </Link>
            </Button>
          )}
          
          {(userRole === 'admin' || userRole === 'secretary') && (
            <Button 
              variant={activeItem === "customers" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveItem("customers")}
              asChild
            >
              <Link href={`/dashboard/${userRole}/customers`}>
                <Users className="mr-3 h-5 w-5" />
                Customers
              </Link>
            </Button>
          )}
          
          <Button 
            variant={activeItem === "appointments" ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveItem("appointments")}
            asChild
          >
            <Link href={`/dashboard/${userRole}/appointments`}>
              <Calendar className="mr-3 h-5 w-5" />
              Appointments
            </Link>
          </Button>
          
          {(userRole === 'admin' || userRole === 'notary') && (
            <Button 
              variant={activeItem === "reports" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveItem("reports")}
              asChild
            >
              <Link href={`/dashboard/${userRole}/reports`}>
                <FileCheck className="mr-3 h-5 w-5" />
                Reports
              </Link>
            </Button>
          )}
          
          <Button 
            variant={activeItem === "settings" ? "default" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveItem("settings")}
            asChild
          >
            <Link href={`/dashboard/${userRole}/settings`}>
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </Button>
        </nav>
      </div>
      <div className="flex items-center border-t p-4">
        <div className="flex-shrink-0">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-gray-500">{userEmail}</p>
        </div>
      </div>
    </div>
  );
}
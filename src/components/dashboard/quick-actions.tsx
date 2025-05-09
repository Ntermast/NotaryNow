import { Button } from '@/components/ui/button';
import { Search, Plus, FileText } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/notaries">
          <Button className="h-auto py-6 w-full flex flex-col items-center justify-center gap-2">
            <Search className="h-6 w-6" />
            <span>Find a Notary</span>
          </Button>
        </Link>
        <Link href="/appointments/schedule">
          <Button variant="outline" className="h-auto py-6 w-full flex flex-col items-center justify-center gap-2">
            <Plus className="h-6 w-6" />
            <span>Schedule Appointment</span>
          </Button>
        </Link>
        <Link href="/documents">
          <Button variant="outline" className="h-auto py-6 w-full flex flex-col items-center justify-center gap-2">
            <FileText className="h-6 w-6" />
            <span>Upload Documents</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
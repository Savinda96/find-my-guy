// components/dashboard/EmptyState.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
  icon?: ReactNode;
}

export default function EmptyState({ 
  title = 'No content yet', 
  description = 'Get started by creating your first item', 
  actionText = 'Create', 
  actionLink = '#',
  icon = <Upload className="h-10 w-10" />,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
        {icon}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>
      <div className="mt-6">
        <Link href={actionLink}>
          <Button>{actionText}</Button>
        </Link>
      </div>
    </div>
  );
}
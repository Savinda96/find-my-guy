// components/dashboard/ProfileActions.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MoreVertical, Trash, Tag, Edit, Download, Share } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfileActionsProps {
  cv: {
    id: string;
    file_path?: string;
    public_url: string;
  };
}

export default function ProfileActions({ cv }: ProfileActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const supabase = createClient();
  const router = useRouter();

  const handleDelete = async (): Promise<void> => {
    try {
      setIsDeleting(true);
      
      // Delete the storage file first
      if (cv.file_path) {
        const { error: storageError } = await supabase.storage
          .from('cv-uploads')
          .remove([cv.file_path]);
          
        if (storageError) throw storageError;
      }
      
      // Delete the database record
      const { error: dbError } = await supabase
        .from('cvs')
        .delete()
        .eq('id', cv.id);
        
      if (dbError) throw dbError;
      
      toast({
        title: "CV deleted",
        description: "The CV has been successfully deleted",
      });
      
      router.push('/dashboard/cvs');
      router.refresh();
      
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the CV. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href={cv.public_url} target="_blank" className="flex items-center cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Download CV
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center cursor-pointer">
            <Share className="mr-2 h-4 w-4" />
            Share Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center cursor-pointer">
            <Tag className="mr-2 h-4 w-4" />
            Edit Tags
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete CV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this CV?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the CV and remove the file from storage.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
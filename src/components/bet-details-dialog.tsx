
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/hooks/use-app';
import type { Pariu } from '@/contexts/app-context';
import { Send } from 'lucide-react';

interface BetDetailsDialogProps {
  pariu: Pariu;
  children: React.ReactNode;
}

export function BetDetailsDialog({ pariu, children }: BetDetailsDialogProps) {
  const { addComment, currentUser } = useApp();
  const [commentText, setCommentText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment(pariu.id, commentText.trim());
      setCommentText('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{pariu.title}</DialogTitle>
          <DialogDescription>{pariu.description}</DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <h3 className="font-semibold mb-2">Comentarii și Profeții</h3>
          <ScrollArea className="h-64 border rounded-md p-4">
            {pariu.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">Fii primul care lasă un comentariu!</p>
            ) : (
              <div className="space-y-4">
                {pariu.comments.map((comment, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-bold text-primary">{comment.userId}:</span>
                    <p className="pl-2">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
            <Textarea
                placeholder="Scrie o profeție..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
            />
            <Button onClick={handleAddComment} disabled={!commentText.trim() || !currentUser}>
                <Send className="mr-2 h-4 w-4" />
                Trimite
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    
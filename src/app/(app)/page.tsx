
"use client";

import { useApp } from '@/hooks/use-app';
import { BettingCard } from '@/components/betting-card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function HomePage() {
  const { scenarios } = useApp();

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="p-1">
        {scenarios.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
            The book of scenarios is currently empty. The Spirit will provide new opportunities soon. Check back later!
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {scenarios.map(scenario => (
              <BettingCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

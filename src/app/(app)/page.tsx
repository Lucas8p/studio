
"use client";

import { useApp } from '@/hooks/use-app';
import { BettingCard } from '@/components/betting-card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function HomePage() {
  const { scenarios } = useApp();
  const openScenarios = scenarios.filter(s => s.status === 'open');

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="p-1">
        {openScenarios.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
            Cartea scenariilor este momentan goală. Spiritul va oferi noi oportunități în curând. Reveniți mai târziu!
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {openScenarios.map(scenario => (
              <BettingCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

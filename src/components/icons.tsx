
import { Bird } from 'lucide-react';

export const Logo = () => (
  <div className="flex items-center gap-2" aria-label="FaithBet Fun">
    <Bird className="h-7 w-7 text-primary-foreground" />
    <span className="text-xl font-bold font-headline text-primary-foreground">
      FaithBet Fun
    </span>
  </div>
);

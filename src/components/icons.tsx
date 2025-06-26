
import { Bird } from 'lucide-react';

export const Logo = ({ appName }: { appName: string }) => (
  <div className="flex items-center gap-2" aria-label={`${appName} - Pariază cu credință`}>
    <Bird className="h-8 w-8 text-primary" />
    <div>
      <span className="block text-lg font-bold font-headline text-current leading-tight">
        {appName}
      </span>
      <span className="block text-xs font-normal font-headline text-current/70 leading-tight">
        Pariază cu credință
      </span>
    </div>
  </div>
);

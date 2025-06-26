
import { Bird } from 'lucide-react';

export const Logo = ({ appName }: { appName: string }) => (
  <div className="flex items-center gap-2" aria-label={appName}>
    <Bird className="h-7 w-7 text-primary" />
    <span className="text-xl font-bold font-headline text-current">
      {appName}
    </span>
  </div>
);

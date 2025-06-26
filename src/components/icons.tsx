
import { Bird } from 'lucide-react';

export const Logo = ({ appName, slogan }: { appName: string, slogan: string }) => (
  <div className="flex items-center gap-2" aria-label={`${appName} - ${slogan}`}>
    <Bird className="h-8 w-8 text-primary" />
    <div>
      <span className="block text-lg font-bold font-headline text-current leading-tight">
        {appName}
      </span>
      <span className="block text-xs font-normal font-headline text-current/70 leading-tight">
        {slogan}
      </span>
    </div>
  </div>
);

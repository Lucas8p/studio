
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const { login, appName, slogan } = useApp();
  const router = useRouter();

  const handleLogin = () => {
    if (username.trim()) {
      login(username.trim());
      router.push('/');
    }
  };

  return (
    <Card className="w-full max-w-sm border-2 border-primary/20 shadow-lg shadow-primary/10 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center p-8">
        <div className="mx-auto mb-6 text-primary scale-125">
            <Logo appName={appName} slogan={slogan} />
        </div>
        <CardTitle className="font-headline text-3xl text-primary">Bun venit!</CardTitle>
        <CardDescription className="text-foreground/80">Introdu numele tău de credincios pentru a intra în arenă.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-8 pb-8">
        <Input
          placeholder="Nume de luptător"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          autoFocus
        />
        <Button onClick={handleLogin} className="w-full" size="lg" disabled={!username.trim()}>
          <LogIn className="mr-2 h-4 w-4" />
          Intră în cont
        </Button>
      </CardContent>
    </Card>
  );
}


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
  const { login, appName } = useApp();
  const router = useRouter();

  const handleLogin = () => {
    if (username.trim()) {
      login(username.trim());
      router.push('/');
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 text-primary">
            <Logo appName={appName} />
        </div>
        <CardTitle className="font-headline text-2xl">Bun venit!</CardTitle>
        <CardDescription>Introdu numele tău de utilizator pentru a intra în joc.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Nume utilizator"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          autoFocus
        />
        <Button onClick={handleLogin} className="w-full" disabled={!username.trim()}>
          <LogIn className="mr-2 h-4 w-4" />
          Intră în cont
        </Button>
      </CardContent>
    </Card>
  );
}

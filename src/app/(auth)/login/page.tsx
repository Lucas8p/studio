
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { LogIn, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, appName, slogan, users } = useApp();
  const router = useRouter();

  useEffect(() => {
    const potentialUser = users.find(u => u.id.toLowerCase() === username.toLowerCase());
    const isPotentiallyAdmin = (potentialUser && potentialUser.isAdmin) || (users.length === 0 && username.trim() !== '');
    setShowPassword(isPotentiallyAdmin);
  }, [username, users]);

  const handleLogin = () => {
    if (username.trim()) {
      const loginSuccess = login(username.trim(), password);
      if (loginSuccess) {
        router.push('/');
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleLogin();
    }
  }

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
          onKeyDown={handleKeyDown}
          autoFocus
        />
        {showPassword && (
            <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="password"
                    placeholder="Parolă Admin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10"
                />
            </div>
        )}
        <Button onClick={handleLogin} className="w-full" size="lg" disabled={!username.trim() || (showPassword && !password.trim())}>
          <LogIn className="mr-2 h-4 w-4" />
          Intră în cont
        </Button>
      </CardContent>
    </Card>
  );
}


"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { askOracle, type OracleOutput, type OracleInput } from '@/ai/flows/oracle-flow';
import { Skeleton } from '@/components/ui/skeleton';

export default function OraclePage() {
  const [question, setQuestion] = useState('');
  const [oracleResponse, setOracleResponse] = useState<OracleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setOracleResponse(null);
    setHasAsked(true);
    try {
      // @ts-ignore
      const isSlowConnection = navigator.connection && ['slow-2g', '2g'].includes(navigator.connection.effectiveType);
      const input: OracleInput = { question, generateAudio: !isSlowConnection };
      const result = await askOracle(input);
      setOracleResponse(result);
    } catch (error) {
      console.error("Error asking the oracle:", error);
      setOracleResponse({
          text: "Spiritele sunt tulburi... O eroare neașteptată a întrerupt viziunea.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <Sparkles className="mx-auto h-12 w-12 text-primary animate-pulse" />
          <CardTitle className="font-headline text-3xl mt-4">Oracolul Divin</CardTitle>
          <CardDescription>Adresează o întrebare cosmosului și primește un răspuns enigmatic. Soarta nu oferă răspunsuri simple.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="ex: Voi câștiga la loto?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              disabled={isLoading}
              autoFocus
            />
            <Button onClick={handleAsk} disabled={isLoading || !question.trim()}>
              {isLoading ? 'Se consultă stelele...' : 'Întreabă'}
            </Button>
          </div>
          
          {hasAsked && (
            <div className="pt-4 text-center space-y-4">
              {isLoading ? (
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-5/6 mx-auto" />
                    <Skeleton className="h-4 w-4/6 mx-auto" />
                </div>
              ) : oracleResponse && (
                <>
                    <p className="text-lg italic text-accent">&ldquo;{oracleResponse.text}&rdquo;</p>
                    {oracleResponse.audio && (
                        <audio controls autoPlay className="w-full mx-auto">
                            <source src={oracleResponse.audio} type="audio/wav" />
                            Browser-ul tău nu suportă elementul audio.
                        </audio>
                    )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

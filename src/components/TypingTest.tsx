import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

interface Test {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  paragraph: string;
  status: 'upcoming' | 'active' | 'completed';
}

interface TypingTestProps {
  test: Test;
  currentUser: any;
  onComplete: (results: any) => void;
  onExit: () => void;
}

const TypingTest: React.FC<TypingTestProps> = ({ test, currentUser, onComplete, onExit }) => {
  const [typedText, setTypedText] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(test.duration * 60); // seconds
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isTestStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTestComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isTestStarted, timeRemaining]);

  useEffect(() => {
    if (isTestStarted && typedText.length > 0) {
      calculateWPMAndAccuracy();
    }
  }, [typedText, timeRemaining]);

  const handleStartTest = () => {
    setIsTestStarted(true);
    setStartTime(new Date());
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const calculateWPMAndAccuracy = () => {
    const timeElapsed = test.duration * 60 - timeRemaining; // seconds
    const timeInMinutes = timeElapsed / 60;

    // WPM
    const wordCount = typedText.trim().split(/\s+/).length;
    const currentWPM = timeInMinutes > 0 ? Math.round(wordCount / timeInMinutes) : 0;
    setWpm(currentWPM);

    // Accuracy (word level)
    const referenceWords = test.paragraph.trim().split(/\s+/);
    const typedWords = typedText.trim().split(/\s+/);

    let correctWords = 0;
    for (let i = 0; i < typedWords.length; i++) {
      if (typedWords[i] === referenceWords[i]) {
        correctWords++;
      }
    }

    const currentAccuracy = typedWords.length > 0 ? (correctWords / typedWords.length) * 100 : 100;
    setAccuracy(Math.round(currentAccuracy));
  };

  const handleTestComplete = () => {
    const endTime = new Date();
    const timeTaken = startTime ? Math.round((endTime.getTime() - startTime.getTime()) / 1000) : test.duration * 60;

    const results = {
      typedText,
      timeTaken,
      wpm,
      accuracy,
      wordCount: typedText.trim().split(/\s+/).filter(word => word !== '').length,
      characterCount: typedText.length
    };

    onComplete(results);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = test.duration * 60;
    const elapsedTime = totalTime - timeRemaining;
    return (elapsedTime / totalTime) * 100;
  };

  const getTimeRemainingColor = () => {
    if (timeRemaining > 300) return 'text-green-600';
    if (timeRemaining > 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">{test.name}</h1>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {currentUser?.rollNumber} - {currentUser?.name}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Time Remaining</p>
                <p className={`text-2xl font-bold ${getTimeRemainingColor()}`}>
                  {formatTime(timeRemaining)}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                    Exit Test
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Exit Test</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to exit the test? Your progress will be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continue Test</AlertDialogCancel>
                    <AlertDialogAction onClick={onExit} className="bg-red-500 hover:bg-red-600">
                      Exit Test
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Test Progress</span>
              <span className="text-sm text-gray-500">
                {Math.round(getProgressPercentage())}% Complete
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm font-medium text-gray-600">Words Per Minute</p>
              <p className="text-3xl font-bold text-orange-600">{wpm}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm font-medium text-gray-600">Accuracy</p>
              <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm font-medium text-gray-600">Characters Typed</p>
              <p className="text-3xl font-bold text-blue-600">{typedText.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="bg-orange-500 text-white">
            <CardTitle className="flex justify-between items-center">
              <span>Typing Area</span>
              {!isTestStarted && (
                <Badge variant="secondary" className="bg-white text-orange-600">
                  Ready to Start
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!isTestStarted ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Instructions</h3>
                  <div className="text-gray-600 space-y-2 max-w-2xl mx-auto">
                    <p>• The test will begin when you click "Start Test"</p>
                    <p>• Listen carefully to the dictation</p>
                    <p>• Type exactly what you hear</p>
                    <p>• The test will automatically submit when time runs out</p>
                    <p>• Duration: {test.duration} minutes</p>
                  </div>
                </div>
                <Button
                  onClick={handleStartTest}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 text-lg"
                >
                  Start Test
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-gray-600">
                    Listen to the dictation and type what you hear below
                  </p>
                </div>
                <Textarea
                  ref={textareaRef}
                  value={typedText}
                  onChange={e => setTypedText(e.target.value)}
                  placeholder="Start typing here..."
                  className="min-h-[400px] text-lg leading-relaxed focus:ring-orange-500 focus:border-orange-500"
                  disabled={timeRemaining === 0}
                />
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Words: {typedText.trim().split(/\s+/).filter(word => word !== '').length}
                  </span>
                  <span>Characters: {typedText.length}</span>
                </div>

                {timeRemaining === 0 && (
                  <div className="text-center py-4">
                    <p className="text-lg font-semibold text-red-600 mb-4">
                      Time's up! Your test has been automatically submitted.
                    </p>
                    <Button
                      onClick={handleTestComplete}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      View Results
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {isTestStarted && timeRemaining > 0 && (
          <div className="mt-6 text-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-green-500 text-green-500 hover:bg-green-50"
                >
                  Submit Test Early
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit Test Early</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to submit your test? You still have{' '}
                    {formatTime(timeRemaining)} remaining.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Typing</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleTestComplete}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Submit Test
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingTest;

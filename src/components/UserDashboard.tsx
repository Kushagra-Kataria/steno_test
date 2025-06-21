
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TypingTest from './TypingTest';
import { useToast } from '@/hooks/use-toast';

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

interface UserDashboardProps {
  onLogout: () => void;
  currentUser: any;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onLogout, currentUser }) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    // Load tests from localStorage
    const savedTests = localStorage.getItem('stenoTests');
    if (savedTests) {
      setTests(JSON.parse(savedTests));
    }

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getNextUpcomingTest = () => {
    const now = new Date();
    const upcomingTests = tests
      .filter(test => test.status === 'upcoming')
      .filter(test => {
        const testDateTime = new Date(`${test.date} ${test.startTime}`);
        return testDateTime > now;
      })
      .sort((a, b) => {
        const dateTimeA = new Date(`${a.date} ${a.startTime}`);
        const dateTimeB = new Date(`${b.date} ${b.startTime}`);
        return dateTimeA.getTime() - dateTimeB.getTime();
      });

    return upcomingTests[0] || null;
  };

  const isTestActive = (test: Test) => {
    const now = new Date();
    const startTime = new Date(`${test.date} ${test.startTime}`);
    const endTime = new Date(`${test.date} ${test.endTime}`);
    return now >= startTime && now <= endTime;
  };

  const getTimeUntilTest = (test: Test) => {
    const now = new Date();
    const testStart = new Date(`${test.date} ${test.startTime}`);
    const diff = testStart.getTime() - now.getTime();

    if (diff <= 0) return "Test is starting now!";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const handleStartTest = (test: Test) => {
    if (isTestActive(test)) {
      setActiveTest(test);
      toast({
        title: "Test Started",
        description: `${test.name} has begun. Good luck!`,
      });
    } else {
      toast({
        title: "Test Not Available",
        description: "This test is not currently active",
        variant: "destructive",
      });
    }
  };

  const handleTestComplete = (results: any) => {
    // Save test results to localStorage
    const existingResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    const newResult = {
      id: Date.now().toString(),
      testId: activeTest?.id,
      testName: activeTest?.name,
      rollNumber: currentUser.rollNumber,
      name: currentUser.name,
      typedText: results.typedText,
      timeTaken: results.timeTaken,
      wpm: results.wpm,
      accuracy: results.accuracy,
      submittedAt: new Date().toISOString(),
    };
    
    existingResults.push(newResult);
    localStorage.setItem('testResults', JSON.stringify(existingResults));
    
    setActiveTest(null);
    toast({
      title: "Test Completed",
      description: `Your test has been submitted successfully!`,
    });
  };

  const nextTest = getNextUpcomingTest();
  const activeTestFromList = tests.find(test => isTestActive(test));

  if (activeTest) {
    return (
      <TypingTest 
        test={activeTest}
        currentUser={currentUser}
        onComplete={handleTestComplete}
        onExit={() => setActiveTest(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {currentUser?.rollNumber} - {currentUser?.name}
              </Badge>
            </div>
            <Button 
              onClick={onLogout}
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Time */}
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Current Time</h2>
            <p className="text-3xl font-bold text-orange-600">
              {currentTime.toLocaleTimeString()}
            </p>
            <p className="text-gray-500">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </CardContent>
        </Card>

        {/* Active Test Alert */}
        {activeTestFromList && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader className="bg-green-500 text-white">
              <CardTitle className="flex items-center justify-between">
                <span>🟢 Test Active Now!</span>
                <Badge variant="secondary" className="bg-white text-green-700">
                  LIVE
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{activeTestFromList.name}</h3>
                  <p className="text-gray-600">Duration: {activeTestFromList.duration} minutes</p>
                </div>
                <Button 
                  onClick={() => handleStartTest(activeTestFromList)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
                >
                  Start Test Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Upcoming Test */}
        <Card className="mb-8">
          <CardHeader className="bg-orange-500 text-white">
            <CardTitle>Next Upcoming Test</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {nextTest ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{nextTest.name}</h3>
                    <p className="text-gray-600">
                      {new Date(`${nextTest.date} ${nextTest.startTime}`).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-600">
                      Time: {nextTest.startTime} - {nextTest.endTime}
                    </p>
                    <p className="text-gray-600">Duration: {nextTest.duration} minutes</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="border-orange-500 text-orange-500 font-mono text-lg px-3 py-1"
                  >
                    {getTimeUntilTest(nextTest)}
                  </Badge>
                </div>
                
                {isTestActive(nextTest) ? (
                  <Button 
                    onClick={() => handleStartTest(nextTest)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
                  >
                    Start Test Now
                  </Button>
                ) : (
                  <div className="text-center py-4 bg-orange-50 rounded-lg">
                    <p className="text-orange-600 font-medium">
                      Test will be available at the scheduled time
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No tests upcoming</p>
                <p className="text-gray-400 text-sm mt-2">
                  Check back later or contact your administrator
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Upcoming Tests */}
        {tests.filter(test => test.status === 'upcoming').length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">All Upcoming Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tests
                  .filter(test => test.status === 'upcoming')
                  .sort((a, b) => new Date(`${a.date} ${a.startTime}`).getTime() - new Date(`${b.date} ${b.startTime}`).getTime())
                  .map((test) => (
                    <div key={test.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{test.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(`${test.date} ${test.startTime}`).toLocaleDateString()} at {test.startTime}
                        </p>
                        <p className="text-sm text-gray-500">Duration: {test.duration} minutes</p>
                      </div>
                      <Badge variant="outline" className="border-orange-500 text-orange-500">
                        {getTimeUntilTest(test)}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

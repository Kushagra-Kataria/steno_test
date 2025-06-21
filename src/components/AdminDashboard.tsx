
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateTestForm from './CreateTestForm';
import TestList from './TestList';
import ResultsExport from './ResultsExport';
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

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, currentUser }) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    // Load tests from localStorage
    const savedTests = localStorage.getItem('stenoTests');
    if (savedTests) {
      setTests(JSON.parse(savedTests));
    }
  }, []);

  const saveTestsToStorage = (updatedTests: Test[]) => {
    localStorage.setItem('stenoTests', JSON.stringify(updatedTests));
    setTests(updatedTests);
  };

  const handleCreateTest = (testData: Omit<Test, 'id' | 'status'>) => {
    const newTest: Test = {
      ...testData,
      id: Date.now().toString(),
      status: 'upcoming'
    };
    
    const updatedTests = [...tests, newTest];
    saveTestsToStorage(updatedTests);
    
    toast({
      title: "Test Created",
      description: `${testData.name} has been scheduled successfully`,
    });
  };

  const handleEditTest = (testId: string, updatedTest: Partial<Test>) => {
    const updatedTests = tests.map(test => 
      test.id === testId ? { ...test, ...updatedTest } : test
    );
    saveTestsToStorage(updatedTests);
    
    toast({
      title: "Test Updated",
      description: "Test has been updated successfully",
    });
  };

  const handleDeleteTest = (testId: string) => {
    const updatedTests = tests.filter(test => test.id !== testId);
    saveTestsToStorage(updatedTests);
    
    toast({
      title: "Test Deleted",
      description: "Test has been deleted successfully",
    });
  };

  const upcomingTests = tests.filter(test => test.status === 'upcoming');
  const activeTests = tests.filter(test => test.status === 'active');
  const completedTests = tests.filter(test => test.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {currentUser?.username}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <div className="w-6 h-6 bg-orange-500 rounded"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 rounded"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingTests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 bg-green-500 rounded"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{activeTests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <div className="w-6 h-6 bg-purple-500 rounded"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedTests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Create Test
            </TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Manage Tests
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Recent Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  {tests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No tests created yet</p>
                  ) : (
                    <div className="space-y-3">
                      {tests.slice(-5).map((test) => (
                        <div key={test.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{test.name}</p>
                            <p className="text-sm text-gray-500">{test.date} at {test.startTime}</p>
                          </div>
                          <Badge 
                            variant={test.status === 'upcoming' ? 'default' : 
                                   test.status === 'active' ? 'secondary' : 'outline'}
                            className={test.status === 'upcoming' ? 'bg-orange-500' : ''}
                          >
                            {test.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setActiveTab('create')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Create New Test
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('manage')}
                    variant="outline"
                    className="w-full border-orange-500 text-orange-500 hover:bg-orange-50"
                  >
                    Manage Tests
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('results')}
                    variant="outline"
                    className="w-full border-orange-500 text-orange-500 hover:bg-orange-50"
                  >
                    Export Results
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create">
            <CreateTestForm onCreateTest={handleCreateTest} />
          </TabsContent>

          <TabsContent value="manage">
            <TestList 
              tests={tests}
              onEditTest={handleEditTest}
              onDeleteTest={handleDeleteTest}
            />
          </TabsContent>

          <TabsContent value="results">
            <ResultsExport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

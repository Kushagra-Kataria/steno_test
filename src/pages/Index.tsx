
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboard from '@/components/AdminDashboard';
import UserDashboard from '@/components/UserDashboard';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  const handleAdminLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // Simple authentication - in real app, this would connect to a backend
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      setUserRole('admin');
      setCurrentUser({ username, role: 'admin' });
      toast({
        title: "Login Successful",
        description: "Welcome to the Admin Dashboard",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
    }
  };

  const handleUserLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rollNumber = formData.get('rollNumber') as string;
    const name = formData.get('name') as string;

    if (rollNumber && name) {
      setIsLoggedIn(true);
      setUserRole('user');
      setCurrentUser({ rollNumber, name, role: 'user' });
      toast({
        title: "Login Successful",
        description: `Welcome ${name}! Ready for your typing test?`,
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Please enter both roll number and name",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  if (isLoggedIn && userRole === 'admin') {
    return <AdminDashboard onLogout={handleLogout} currentUser={currentUser} />;
  }

  if (isLoggedIn && userRole === 'user') {
    return <UserDashboard onLogout={handleLogout} currentUser={currentUser} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Steno Speed Arena
          </h1>
          <p className="text-gray-600">
            Professional Stenography Typing Test Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-orange-500 text-white rounded-t-lg">
            <CardTitle className="text-center text-xl">Login to Continue</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="user" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  Student
                </TabsTrigger>
                <TabsTrigger value="admin" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="user">
                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      name="rollNumber"
                      type="text"
                      placeholder="Enter your roll number"
                      className="focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5"
                  >
                    Login as Student
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter admin username"
                      className="focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter admin password"
                      className="focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5"
                  >
                    Login as Admin
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Demo Credentials:</p>
              <p>Admin: username: admin, password: admin123</p>
              <p>Student: Any roll number and name</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;

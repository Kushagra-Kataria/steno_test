
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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

interface TestListProps {
  tests: Test[];
  onEditTest: (testId: string, updatedTest: Partial<Test>) => void;
  onDeleteTest: (testId: string) => void;
}

const TestList: React.FC<TestListProps> = ({ tests, onEditTest, onDeleteTest }) => {
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTest) return;

    const formData = new FormData(e.currentTarget);
    const updatedTest = {
      name: formData.get('name') as string,
      date: formData.get('date') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      duration: parseInt(formData.get('duration') as string),
      paragraph: formData.get('paragraph') as string,
    };

    onEditTest(editingTest.id, updatedTest);
    setIsEditDialogOpen(false);
    setEditingTest(null);
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime || !duration) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (test: Test) => {
    const now = new Date();
    const testStart = new Date(`${test.date} ${test.startTime}`);
    const testEnd = new Date(`${test.date} ${test.endTime}`);

    if (now >= testStart && now <= testEnd) {
      return <Badge className="bg-green-500 text-white">Active</Badge>;
    } else if (now > testEnd) {
      return <Badge variant="outline" className="border-gray-400 text-gray-600">Completed</Badge>;
    } else {
      return <Badge className="bg-orange-500 text-white">Upcoming</Badge>;
    }
  };

  const sortedTests = [...tests].sort((a, b) => {
    const dateTimeA = new Date(`${a.date} ${a.startTime}`);
    const dateTimeB = new Date(`${b.date} ${b.startTime}`);
    return dateTimeB.getTime() - dateTimeA.getTime();
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-orange-600">All Tests</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tests created yet</p>
              <Button 
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {/* Switch to create tab logic */}}
              >
                Create Your First Test
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                        {getStatusBadge(test)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>📅 {new Date(test.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                        <p>⏰ {test.startTime} - {test.endTime} ({test.duration} minutes)</p>
                        <p>📝 Paragraph: {test.paragraph.substring(0, 100)}...</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="border-orange-500 text-orange-500 hover:bg-orange-50"
                            onClick={() => setEditingTest(test)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Test: {editingTest?.name}</DialogTitle>
                          </DialogHeader>
                          {editingTest && (
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Test Name</Label>
                                  <Input
                                    id="edit-name"
                                    name="name"
                                    defaultValue={editingTest.name}
                                    className="focus:ring-orange-500 focus:border-orange-500"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-date">Date</Label>
                                  <Input
                                    id="edit-date"
                                    name="date"
                                    type="date"
                                    defaultValue={editingTest.date}
                                    className="focus:ring-orange-500 focus:border-orange-500"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-startTime">Start Time</Label>
                                  <Input
                                    id="edit-startTime"
                                    name="startTime"
                                    type="time"
                                    defaultValue={editingTest.startTime}
                                    className="focus:ring-orange-500 focus:border-orange-500"
                                    onChange={(e) => {
                                      const duration = parseInt((document.querySelector('[name="duration"]') as HTMLInputElement)?.value || '0');
                                      const endTimeInput = document.querySelector('[name="endTime"]') as HTMLInputElement;
                                      if (endTimeInput && duration > 0) {
                                        endTimeInput.value = calculateEndTime(e.target.value, duration);
                                      }
                                    }}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                                  <Input
                                    id="edit-duration"
                                    name="duration"
                                    type="number"
                                    min="1"
                                    max="180"
                                    defaultValue={editingTest.duration}
                                    className="focus:ring-orange-500 focus:border-orange-500"
                                    onChange={(e) => {
                                      const startTime = (document.querySelector('[name="startTime"]') as HTMLInputElement)?.value;
                                      const endTimeInput = document.querySelector('[name="endTime"]') as HTMLInputElement;
                                      if (endTimeInput && startTime) {
                                        endTimeInput.value = calculateEndTime(startTime, parseInt(e.target.value));
                                      }
                                    }}
                                    required
                                  />
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label htmlFor="edit-endTime">End Time</Label>
                                  <Input
                                    id="edit-endTime"
                                    name="endTime"
                                    type="time"
                                    defaultValue={editingTest.endTime}
                                    className="focus:ring-orange-500 focus:border-orange-500"
                                    readOnly
                                    required
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="edit-paragraph">Paragraph</Label>
                                <Textarea
                                  id="edit-paragraph"
                                  name="paragraph"
                                  rows={6}
                                  defaultValue={editingTest.paragraph}
                                  className="focus:ring-orange-500 focus:border-orange-500"
                                  required
                                />
                              </div>
                              
                              <div className="flex justify-end gap-2">
                                <Button 
                                  type="button" 
                                  variant="outline"
                                  onClick={() => setIsEditDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit"
                                  className="bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Test</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{test.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDeleteTest(test.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestList;

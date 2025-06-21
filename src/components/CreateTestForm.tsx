
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Test {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  paragraph: string;
}

interface CreateTestFormProps {
  onCreateTest: (test: Test) => void;
}

const CreateTestForm: React.FC<CreateTestFormProps> = ({ onCreateTest }) => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const testData: Test = {
      name: formData.get('name') as string,
      date: formData.get('date') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      duration: parseInt(formData.get('duration') as string),
      paragraph: formData.get('paragraph') as string,
    };

    // Validation
    if (!testData.name || !testData.date || !testData.startTime || !testData.endTime || !testData.duration || !testData.paragraph) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if start time is before end time
    const startDateTime = new Date(`${testData.date} ${testData.startTime}`);
    const endDateTime = new Date(`${testData.date} ${testData.endTime}`);
    
    if (startDateTime >= endDateTime) {
      toast({
        title: "Time Error",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    onCreateTest(testData);
    (e.target as HTMLFormElement).reset();
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

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="bg-orange-500 text-white">
        <CardTitle>Create New Typing Test</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Test Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Stenography Test 1"
                className="focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Test Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                className="focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
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
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                max="180"
                placeholder="e.g., 60"
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

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                className="focus:ring-orange-500 focus:border-orange-500"
                readOnly
                required
              />
              <p className="text-sm text-gray-500">
                Automatically calculated based on start time and duration
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paragraph">Test Paragraph *</Label>
            <Textarea
              id="paragraph"
              name="paragraph"
              rows={8}
              placeholder="Enter the paragraph that will be dictated during the test..."
              className="focus:ring-orange-500 focus:border-orange-500"
              required
            />
            <p className="text-sm text-gray-500">
              This paragraph will be dictated to students during the test. Students will not see this text.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
            >
              Create Test
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateTestForm;

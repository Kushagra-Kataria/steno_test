import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  id: string;
  testId: string;
  testName: string;
  rollNumber: string;
  name: string;
  typedText: string;
  timeTaken: number;
  wpm: number;
  accuracy: number;
  submittedAt: string;
}

const ResultsExport: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedRollNumber, setSelectedRollNumber] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load results from localStorage
    const savedResults = localStorage.getItem('testResults');
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    }
  }, []);

  useEffect(() => {
    // Filter results based on search query and selected roll number
    let filtered = results;

    if (selectedRollNumber && selectedRollNumber !== 'all') {
      filtered = filtered.filter(result => result.rollNumber === selectedRollNumber);
    }

    if (searchQuery) {
      filtered = filtered.filter(result => 
        result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.testName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredResults(filtered);
  }, [results, selectedRollNumber, searchQuery]);

  const getUniqueRollNumbers = () => {
    return [...new Set(results.map(result => result.rollNumber))].sort();
  };

  const getUniqueStudents = () => {
    const students = new Map();
    results.forEach(result => {
      if (!students.has(result.rollNumber)) {
        students.set(result.rollNumber, {
          rollNumber: result.rollNumber,
          name: result.name,
          testCount: 0
        });
      }
      students.get(result.rollNumber).testCount += 1;
    });
    return Array.from(students.values()).sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
  };

  const exportToCSV = (data: TestResult[], filename: string) => {
    const headers = ['Roll Number', 'Name', 'Test Name', 'WPM', 'Accuracy (%)', 'Time Taken (min)', 'Submitted At'];
    const csvContent = [
      headers.join(','),
      ...data.map(result => [
        result.rollNumber,
        result.name,
        result.testName,
        result.wpm,
        result.accuracy,
        Math.round(result.timeTaken / 60),
        new Date(result.submittedAt).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `${filename} has been downloaded`,
    });
  };

  const exportStudentResults = (rollNumber: string) => {
    const studentResults = results.filter(result => result.rollNumber === rollNumber);
    if (studentResults.length === 0) {
      toast({
        title: "No Results Found",
        description: `No test results found for roll number ${rollNumber}`,
        variant: "destructive",
      });
      return;
    }

    const studentName = studentResults[0].name;
    exportToCSV(studentResults, `${rollNumber}_${studentName}_results.csv`);
  };

  const exportAllResults = () => {
    if (results.length === 0) {
      toast({
        title: "No Results Found",
        description: "No test results available to export",
        variant: "destructive",
      });
      return;
    }

    exportToCSV(results, 'all_test_results.csv');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceLevel = (wpm: number, accuracy: number) => {
    if (wpm >= 40 && accuracy >= 95) return { level: 'Excellent', color: 'bg-green-500' };
    if (wpm >= 30 && accuracy >= 90) return { level: 'Good', color: 'bg-blue-500' };
    if (wpm >= 20 && accuracy >= 80) return { level: 'Average', color: 'bg-orange-500' };
    return { level: 'Needs Improvement', color: 'bg-red-500' };
  };

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <Card>
        <CardHeader className="bg-orange-500 text-white">
          <CardTitle>Export Test Results</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search and Filter */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Students</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by name, roll number, or test name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rollNumberFilter">Filter by Roll Number</Label>
                <Select value={selectedRollNumber} onValueChange={setSelectedRollNumber}>
                  <SelectTrigger className="focus:ring-orange-500 focus:border-orange-500">
                    <SelectValue placeholder="Select roll number..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {getUniqueRollNumbers().map((rollNumber) => (
                      <SelectItem key={rollNumber} value={rollNumber}>
                        {rollNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Export Actions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Export Options</Label>
                <div className="space-y-2">
                  <Button 
                    onClick={exportAllResults}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={results.length === 0}
                  >
                    Export All Results (CSV)
                  </Button>
                  <Button 
                    onClick={() => selectedRollNumber !== 'all' && exportStudentResults(selectedRollNumber)}
                    variant="outline"
                    className="w-full border-orange-500 text-orange-500 hover:bg-orange-50"
                    disabled={selectedRollNumber === 'all'}
                  >
                    Export Selected Student
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <p>📊 Total Results: {results.length}</p>
                <p>👥 Total Students: {getUniqueRollNumbers().length}</p>
                <p>📋 Filtered Results: {filteredResults.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-orange-600">Students Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {getUniqueStudents().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No test results available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getUniqueStudents().map((student) => (
                <div key={student.rollNumber} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">Roll No: {student.rollNumber}</p>
                    </div>
                    <Badge variant="outline" className="border-orange-500 text-orange-500">
                      {student.testCount} test{student.testCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => exportStudentResults(student.rollNumber)}
                    size="sm"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Export Results
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-orange-600">
            Test Results {selectedRollNumber !== 'all' && `- ${selectedRollNumber}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery || selectedRollNumber !== 'all' ? 'No results match your filters' : 'No test results available'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="space-y-4">
                {filteredResults
                  .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                  .map((result) => {
                    const performance = getPerformanceLevel(result.wpm, result.accuracy);
                    return (
                      <div key={result.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{result.testName}</h3>
                              <Badge className={`${performance.color} text-white`}>
                                {performance.level}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>👤 {result.name} ({result.rollNumber})</p>
                              <p>🕒 Submitted: {new Date(result.submittedAt).toLocaleString()}</p>
                              <p>⏱️ Time Taken: {formatTime(result.timeTaken)}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-4 text-center">
                            <div>
                              <p className="text-2xl font-bold text-orange-600">{result.wpm}</p>
                              <p className="text-xs text-gray-500">WPM</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-green-600">{result.accuracy}%</p>
                              <p className="text-xs text-gray-500">Accuracy</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsExport;

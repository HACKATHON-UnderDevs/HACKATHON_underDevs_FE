import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import {
  Calendar,
  Clock,
  Plus,
  Brain,
  Target,
  CheckCircle,
  AlertCircle,
  BarChart,
  TrendingUp,
  Zap,
  BookOpen,
  ArrowRight,
  Bell,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { StudyScheduleSkeleton } from '@/components/skeletons';

export const Route = createFileRoute('/study-schedule')({ component: StudySchedulePage });

function StudySchedulePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [studyDuration, setStudyDuration] = useState('30');
  const [isStudySessionActive, setIsStudySessionActive] = useState(false);
  const [sessionTimer] = useState(1800); // 30 minutes in seconds

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <StudyScheduleSkeleton />;
  }
  
  const upcomingReviews = [
    {
      id: 1,
      title: 'Biology Cell Structure',
      type: 'flashcards',
      dueDate: '2024-01-16',
      priority: 'high',
      count: 15,
      estimatedTime: 20,
    },
    {
      id: 2,
      title: 'Math Derivatives Quiz',
      type: 'quiz',
      dueDate: '2024-01-17',
      priority: 'medium',
      count: 10,
      estimatedTime: 15,
    },
    {
      id: 3,
      title: 'History WWII Timeline',
      type: 'flashcards',
      dueDate: '2024-01-18',
      priority: 'low',
      count: 20,
      estimatedTime: 25,
    },
  ];

  const completedSessions = [
    {
      id: 1,
      title: 'Chemistry Bonds',
      date: '2024-01-15',
      duration: 45,
      itemsReviewed: 30,
      accuracy: 85,
    },
    {
      id: 2,
      title: 'Physics Motion',
      date: '2024-01-14',
      duration: 30,
      itemsReviewed: 20,
      accuracy: 92,
    },
    {
      id: 3,
      title: 'Literature Analysis',
      date: '2024-01-13',
      duration: 60,
      itemsReviewed: 40,
      accuracy: 78,
    },
  ];

  const studyStats = [
    { name: 'Total Study Time', value: '24h 45m', icon: Clock, color: 'text-blue-500' },
    { name: 'Items Reviewed', value: '342', icon: BookOpen, color: 'text-green-500' },
    { name: 'Avg. Accuracy', value: '87%', icon: Target, color: 'text-purple-500' },
    { name: 'Study Streak', value: '7 days', icon: Zap, color: 'text-orange-500' },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleStudySession = () => {
    setIsStudySessionActive(!isStudySessionActive);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Study Schedule</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Study Session
            </Button>
          </div>

          <Tabs defaultValue="schedule" className="space-y-4">
            <TabsList>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="active-session">Active Session</TabsTrigger>
              <TabsTrigger value="history">Study History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {studyStats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between space-y-0">
                        <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-3">
                <Card className="md:col-span-4 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Upcoming Reviews
                    </CardTitle>
                    <CardDescription>
                      Scheduled items based on spaced repetition algorithm
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingReviews.map((review) => (
                        <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {review.type === 'flashcards' ? (
                              <Brain className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Target className="h-5 w-5 text-green-500" />
                            )}
                            <div>
                              <h4 className="font-medium">{review.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Due: {review.dueDate}</span>
                                <span>•</span>
                                <span>{review.count} items</span>
                                <span>•</span>
                                <span>~{review.estimatedTime} min</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={review.priority === 'high' ? 'destructive' : 
                                     review.priority === 'medium' ? 'default' : 'outline'}
                            >
                              {review.priority}
                            </Badge>
                            <Button size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Bell className="h-4 w-4 mr-2" />
                      Set Review Reminders
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="md:col-span-3 lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Retention Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Biology</span>
                          <span className="text-green-500">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Mathematics</span>
                          <span className="text-green-500">88%</span>
                        </div>
                        <Progress value={88} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>History</span>
                          <span className="text-yellow-500">75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Physics</span>
                          <span className="text-red-500">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Chemistry</span>
                          <span className="text-yellow-500">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Active Session Tab */}
            <TabsContent value="active-session" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Study Session
                      </CardTitle>
                      <CardDescription>
                        {isStudySessionActive ? 'Session in progress' : 'Start a focused study session'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isStudySessionActive ? (
                        <div className="text-center py-8 space-y-6">
                          <div className="text-5xl font-bold">{formatTime(sessionTimer)}</div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-medium">Currently Studying:</h3>
                            <p className="text-xl">Biology Cell Structure</p>
                            <Badge variant="secondary" className="mt-2">15 flashcards remaining</Badge>
                          </div>
                          <div className="flex justify-center gap-2">
                            <Button variant="outline" onClick={toggleStudySession}>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause Session
                            </Button>
                            <Button variant="destructive">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              End Session
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="study-material">Study Material</Label>
                              <Select defaultValue="biology">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select material" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="biology">Biology Cell Structure</SelectItem>
                                  <SelectItem value="math">Math Derivatives</SelectItem>
                                  <SelectItem value="history">History WWII Timeline</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="duration">Session Duration</Label>
                              <Select value={studyDuration} onValueChange={setStudyDuration}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15">15 minutes</SelectItem>
                                  <SelectItem value="30">30 minutes</SelectItem>
                                  <SelectItem value="45">45 minutes</SelectItem>
                                  <SelectItem value="60">1 hour</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="session-type">Session Type</Label>
                            <Select defaultValue="spaced">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="spaced">Spaced Repetition</SelectItem>
                                <SelectItem value="intensive">Intensive Review</SelectItem>
                                <SelectItem value="quiz">Quiz Practice</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button className="w-full" onClick={toggleStudySession}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Study Session
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Study Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">Optimal Study Time</h4>
                          <p className="text-sm text-blue-800">Your peak focus hours are between 9am-11am based on your history.</p>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="text-sm font-medium text-green-900 mb-2">Retention Boost</h4>
                          <p className="text-sm text-green-800">Review Biology flashcards today to maintain your 92% retention rate.</p>
                        </div>
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <h4 className="text-sm font-medium text-purple-900 mb-2">Break Reminder</h4>
                          <p className="text-sm text-purple-800">Take a 5-minute break after every 25 minutes of focused study.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Study Session History</CardTitle>
                  <CardDescription>
                    Track your past study sessions and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completedSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <h4 className="font-medium">{session.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{session.date}</span>
                              <span>•</span>
                              <span>{session.duration} minutes</span>
                              <span>•</span>
                              <span>{session.itemsReviewed} items reviewed</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{session.accuracy}% accuracy</Badge>
                          <Button size="sm" variant="outline">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5" />
                      Study Time Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center border rounded-lg">
                      <p className="text-muted-foreground">Study time chart visualization would appear here</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Retention Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center border rounded-lg">
                      <p className="text-muted-foreground">Retention progress chart would appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Study Insights</CardTitle>
                  <CardDescription>
                    AI-powered analysis of your study patterns and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Weekly Summary</h3>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Total Study Time</p>
                          <p className="text-2xl font-bold">8h 45m</p>
                          <p className="text-xs text-green-500">+15% from last week</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Average Session Length</p>
                          <p className="text-2xl font-bold">42 min</p>
                          <p className="text-xs text-green-500">+8% from last week</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Retention Rate</p>
                          <p className="text-2xl font-bold">87%</p>
                          <p className="text-xs text-green-500">+3% from last week</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <ArrowRight className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p>Increase study time for Physics to improve retention rate</p>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p>Review Math Derivatives more frequently to maintain high retention</p>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p>Your optimal study time appears to be in the morning - schedule more sessions then</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

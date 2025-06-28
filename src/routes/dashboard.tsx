import { createFileRoute, Link } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Brain, 
  Users, 
  Heart, 
  Target,
  Clock,
  TrendingUp,
  Calendar,
  ArrowRight,
  Star,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { DashboardSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/dashboard")({component: Dashboard});

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentMood] = useState("focused");

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const learningStats = {
    totalNotes: 24,
    flashcardsGenerated: 156,
    quizzesCompleted: 12,
    retentionRate: 87,
    studyStreak: 15,
    weeklyGoal: 75,
    weeklyProgress: 68
  };

  const recentActivity = [
    { type: "note", title: "Biology Chapter 5 Notes", time: "2 hours ago", icon: FileText },
    { type: "flashcard", title: "Generated 12 Math flashcards", time: "4 hours ago", icon: Brain },
    { type: "quiz", title: "Completed Physics Quiz", time: "1 day ago", score: "92%", icon: Target },
    { type: "collaboration", title: "Joined Biology Study Group", time: "2 days ago", icon: Users }
  ];

  const upcomingTasks = [
    { title: "Review Chemistry flashcards", due: "Due in 2 hours", priority: "high", icon: Brain },
    { title: "Complete Math quiz", due: "Due tomorrow", priority: "medium", icon: Target },
    { title: "Study group meeting", due: "Tomorrow 3 PM", priority: "low", icon: Users }
  ];

  const quickActions = [
    { title: "Create New Note", description: "Start writing and organizing your thoughts", icon: FileText, href: "/notes", color: "bg-blue-500" },
    { title: "Generate Flashcards", description: "AI-powered flashcard creation", icon: Brain, href: "/ai-generation", color: "bg-purple-500" },
    { title: "View Schedule", description: "Check your study schedule", icon: Calendar, href: "/study-schedule", color: "bg-green-500" },
    { title: "Join Collaboration", description: "Work with study groups", icon: Users, href: "/collaboration", color: "bg-orange-500" }
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="@container/main flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Learning Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's your learning overview</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-blue-500" />
                Mood: {currentMood}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                {learningStats.studyStreak} day streak
              </Badge>
            </div>
          </div>

          {/* Learning Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{learningStats.totalNotes}</div>
                <p className="text-xs text-muted-foreground">+3 from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Flashcards</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{learningStats.flashcardsGenerated}</div>
                <p className="text-xs text-muted-foreground">Auto-generated</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{learningStats.retentionRate}%</div>
                <Progress value={learningStats.retentionRate} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{learningStats.weeklyProgress}%</div>
                <Progress value={(learningStats.weeklyProgress / learningStats.weeklyGoal) * 100} className="mt-2" />
                <p className="text-xs text-muted-foreground">{learningStats.weeklyProgress}/{learningStats.weeklyGoal} goal</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} to={action.href}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium group-hover:text-primary transition-colors">{action.title}</h3>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity & Upcoming Tasks */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest learning activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{activity.time}</span>
                            {activity.score && (
                              <Badge variant="secondary" className="text-xs">{activity.score}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Tasks
                </CardTitle>
                <CardDescription>
                  Your scheduled learning activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingTasks.map((task, index) => {
                    const Icon = task.icon;
                    const priorityColors = {
                      high: "border-red-200 bg-red-50",
                      medium: "border-yellow-200 bg-yellow-50",
                      low: "border-green-200 bg-green-50"
                    };
                    return (
                      <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                        <div className="p-2 rounded-lg bg-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.due}</p>
                        </div>
                        <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}>
                          {task.priority}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <Link to="/study-schedule">
                    <Button variant="outline" className="w-full">
                      View Full Schedule
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
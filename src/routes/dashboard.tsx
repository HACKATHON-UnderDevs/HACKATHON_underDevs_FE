import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Upload, 
  Brain, 
  Users, 
  Heart, 
  BookOpen, 
  Zap, 
  Target,
  Clock,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Plus,
  Download,
  Share2
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({component: Dashboard});

function Dashboard() {
  const [currentMood, setCurrentMood] = useState("neutral");
  const [noteContent, setNoteContent] = useState("");
  const collaborators = ["Alice", "Bob", "Charlie"];

  const moodOptions = [
    { value: "happy", label: "Energetic", icon: Smile, color: "text-green-500" },
    { value: "neutral", label: "Focused", icon: Meh, color: "text-blue-500" },
    { value: "tired", label: "Tired", icon: Frown, color: "text-orange-500" }
  ];

  const learningStats = {
    totalNotes: 24,
    flashcardsGenerated: 156,
    quizzesCompleted: 12,
    retentionRate: 87,
    studyStreak: 15
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="@container/main flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Learning Dashboard</h1>
              <p className="text-muted-foreground">Your personalized AI-powered learning companion</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Mood: {moodOptions.find(m => m.value === currentMood)?.label}
              </Badge>
              <Button>
                <Share2 className="h-4 w-4 mr-2" />
                Share Session
              </Button>
            </div>
          </div>

          {/* Learning Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
                <CardTitle className="text-sm font-medium">Quizzes Done</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{learningStats.quizzesCompleted}</div>
                <p className="text-xs text-muted-foreground">This month</p>
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
                <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{learningStats.studyStreak}</div>
                <p className="text-xs text-muted-foreground">days in a row</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="notes" className="flex-1">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="ai-generation" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Generation
              </TabsTrigger>
              <TabsTrigger value="qa-lifecycle" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Q&A Lifecycle
              </TabsTrigger>
              <TabsTrigger value="mood-learning" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Mood Learning
              </TabsTrigger>
              <TabsTrigger value="collaboration" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Collaboration
              </TabsTrigger>
            </TabsList>

            {/* Unified Note-Taking Tab */}
            <TabsContent value="notes" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Rich Text Editor
                      </CardTitle>
                      <CardDescription>
                        Create and edit your notes with rich formatting
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Input placeholder="Note title..." className="text-lg font-semibold" />
                        <Textarea 
                          placeholder="Start writing your notes here... Use markdown for formatting!"
                          className="min-h-[400px] resize-none"
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm">Save Note</Button>
                          <Button size="sm" variant="outline">Preview</Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Document Upload
                      </CardTitle>
                      <CardDescription>
                        Upload PDF, TXT, DOCX files
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">Drag & drop files here</p>
                          <Button variant="outline" size="sm">Browse Files</Button>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Recent Uploads</h4>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 p-2 rounded border">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">lecture-notes.pdf</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded border">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">chapter-summary.docx</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* AI Content Generation Tab */}
            <TabsContent value="ai-generation" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Smart Flashcard Generation
                    </CardTitle>
                    <CardDescription>
                      AI automatically creates flashcards from your notes and documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="current-note">Current Note</SelectItem>
                          <SelectItem value="lecture-notes">Lecture Notes PDF</SelectItem>
                          <SelectItem value="chapter-summary">Chapter Summary</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="w-full">
                        <Zap className="h-4 w-4 mr-2" />
                        Generate Flashcards
                      </Button>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Recent Flashcards</h4>
                        <div className="space-y-2">
                          <div className="p-3 border rounded-lg">
                            <p className="text-sm font-medium">What is photosynthesis?</p>
                            <p className="text-xs text-muted-foreground mt-1">Generated from Biology Chapter 3</p>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <p className="text-sm font-medium">Define machine learning</p>
                            <p className="text-xs text-muted-foreground mt-1">Generated from CS Lecture Notes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Quiz Generation
                    </CardTitle>
                    <CardDescription>
                      Create adaptive quizzes based on your learning materials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="quiz-length">Quiz Length</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="5 questions" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 questions</SelectItem>
                              <SelectItem value="10">10 questions</SelectItem>
                              <SelectItem value="15">15 questions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="difficulty">Difficulty</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Medium" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button className="w-full">
                        <Brain className="h-4 w-4 mr-2" />
                        Generate Quiz
                      </Button>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Quiz History</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">Biology Quiz #3</span>
                            <Badge variant="secondary">85%</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">Math Quiz #2</span>
                            <Badge variant="secondary">92%</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Q&A Lifecycle Tab */}
            <TabsContent value="qa-lifecycle" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Learning Queue
                    </CardTitle>
                    <CardDescription>
                      Questions scheduled for optimal retention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg bg-red-50 border-red-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Due Now</span>
                          <Badge variant="destructive">Urgent</Badge>
                        </div>
                        <p className="text-sm">What are the main types of chemical bonds?</p>
                        <p className="text-xs text-muted-foreground mt-1">Last reviewed: 3 days ago</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Due Soon</span>
                          <Badge variant="outline">Tomorrow</Badge>
                        </div>
                        <p className="text-sm">Explain Newton's second law</p>
                        <p className="text-xs text-muted-foreground mt-1">Last reviewed: 1 week ago</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Upcoming</span>
                          <Badge variant="secondary">3 days</Badge>
                        </div>
                        <p className="text-sm">Define photosynthesis process</p>
                        <p className="text-xs text-muted-foreground mt-1">Last reviewed: 2 weeks ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Retention Analytics
                    </CardTitle>
                    <CardDescription>
                      Track your long-term memory performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Retention</span>
                          <span>87%</span>
                        </div>
                        <Progress value={87} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Biology</span>
                          <span>92%</span>
                        </div>
                        <Progress value={92} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Mathematics</span>
                          <span>78%</span>
                        </div>
                        <Progress value={78} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Physics</span>
                          <span>85%</span>
                        </div>
                        <Progress value={85} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Study Schedule
                    </CardTitle>
                    <CardDescription>
                      Optimized review schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">Morning Review</p>
                          <p className="text-xs text-muted-foreground">9:00 AM - 15 cards</p>
                        </div>
                        <Button size="sm">Start</Button>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">Afternoon Quiz</p>
                          <p className="text-xs text-muted-foreground">2:00 PM - Biology</p>
                        </div>
                        <Button size="sm" variant="outline">Schedule</Button>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">Evening Review</p>
                          <p className="text-xs text-muted-foreground">7:00 PM - 20 cards</p>
                        </div>
                        <Button size="sm" variant="outline">Schedule</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Mood-Adaptive Learning Tab */}
            <TabsContent value="mood-learning" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Mood Assessment
                    </CardTitle>
                    <CardDescription>
                      Tell us how you're feeling to optimize your learning session
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {moodOptions.map((mood) => {
                          const Icon = mood.icon;
                          return (
                            <Button
                              key={mood.value}
                              variant={currentMood === mood.value ? "default" : "outline"}
                              className="flex flex-col gap-2 h-20"
                              onClick={() => setCurrentMood(mood.value)}
                            >
                              <Icon className={`h-6 w-6 ${mood.color}`} />
                              <span className="text-xs">{mood.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="energy-level">Energy Level</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select energy level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - Need gentle review</SelectItem>
                            <SelectItem value="medium">Medium - Standard session</SelectItem>
                            <SelectItem value="high">High - Challenge me!</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="focus-time">Available Study Time</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="How long can you study?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="120">2+ hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full">
                        <Zap className="h-4 w-4 mr-2" />
                        Start Adaptive Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Personalized Recommendations
                    </CardTitle>
                    <CardDescription>
                      AI-powered suggestions based on your current state
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Recommended for Focused Mood</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Review challenging concepts</li>
                          <li>• Take practice quizzes</li>
                          <li>• Create new flashcards</li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Mood-Based Study History</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <Smile className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Energetic Session</span>
                            </div>
                            <span className="text-xs text-muted-foreground">95% accuracy</span>
                          </div>
                          <div className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <Meh className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">Focused Session</span>
                            </div>
                            <span className="text-xs text-muted-foreground">87% accuracy</span>
                          </div>
                          <div className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <Frown className="h-4 w-4 text-orange-500" />
                              <span className="text-sm">Tired Session</span>
                            </div>
                            <span className="text-xs text-muted-foreground">72% accuracy</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Collaboration Tab */}
            <TabsContent value="collaboration" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Real-time Collaborative Editing
                      </CardTitle>
                      <CardDescription>
                        Work together on notes and study materials
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm font-medium">Active Collaborators:</span>
                          {collaborators.map((name, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${
                                index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                              }`} />
                              {name}
                            </Badge>
                          ))}
                        </div>
                        <Textarea 
                          placeholder="Start collaborating on notes... Others can see your changes in real-time!"
                          className="min-h-[300px] resize-none"
                        />
                        <div className="flex gap-2">
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Invite Collaborator
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Link
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Study Groups
                      </CardTitle>
                      <CardDescription>
                        Join or create study groups
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Button className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Study Group
                        </Button>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Your Groups</h4>
                          <div className="space-y-2">
                            <div className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">Biology Study Group</span>
                                <Badge variant="secondary">5 members</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">Last active: 2 hours ago</p>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">Math Homework Help</span>
                                <Badge variant="secondary">8 members</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">Last active: 1 day ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Recent Activity</h4>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p>Alice added 3 flashcards to Biology</p>
                            <p>Bob completed the Math quiz</p>
                            <p>Charlie shared new notes</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

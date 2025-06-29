import { createFileRoute, useNavigate } from '@tanstack/react-router';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import {
  Users,
  Plus,
  Share2,
  MessageCircle,
  Video,
  Clock,
  Settings,
  UserPlus,
  Copy,
  Send,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Phone,
  PhoneOff,
  Edit,
  Crown,
  Trash2,
  LogOut,
} from 'lucide-react';
import { WorkspaceSkeleton } from '@/components/skeletons';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useAuth } from '@clerk/clerk-react';
import {
  createWorkspace,
  getWorkspacesForUser,
  addWorkspaceMember,
  getWorkspaceMembers,
  deleteWorkspace,
  removeWorkspaceMember,
} from '@/services/workspaceService';
import { getProfileByEmail, getProfile } from '@/services/profileService';
import { Profile, Workspace } from '@/supabase/supabase';
import { toast } from "sonner"

export const Route = createFileRoute('/workspace')({ component: WorkspacePage });

type WorkspaceWithDetails = Workspace & {
  membersCount: number;
  isOwner: boolean;
};

type WorkspaceMemberWithProfile = Profile & {
  role: string;
};

function WorkspacePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [collaborativeNote, setCollaborativeNote] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceWithDetails[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [
    openInviteDialogForWorkspace,
    setOpenInviteDialogForWorkspace,
  ] = useState<string | null>(null);
  const [
    settingsWorkspace,
    setSettingsWorkspace,
  ] = useState<WorkspaceWithDetails | null>(null);
  const [members, setMembers] = useState<WorkspaceMemberWithProfile[]>([]);
  const [isFetchingMembers, setIsFetchingMembers] = useState(false);
  const [dialogOpen, setDialogOpen] = useState<
    'leave' | 'delete' | 'remove' | null
  >(null);
  const [memberToRemove, setMemberToRemove] = useState<Profile | null>(null);

  const supabase = useSupabase();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const fetchWorkspaces = async () => {
    if (userId && supabase) {
      const data = await getWorkspacesForUser(supabase, userId);
      if (data) {
        const workspacesWithDetails = await Promise.all(
          data.map(async (ws) => {
            const members = await getWorkspaceMembers(supabase, ws.id);
            return {
              ...ws,
              membersCount: members?.length ?? 0,
              isOwner: ws.owner_id === userId,
            };
          })
        );
        setWorkspaces(workspacesWithDetails);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWorkspaces();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, supabase]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (settingsWorkspace && supabase) {
        setIsFetchingMembers(true);
        const memberData = await getWorkspaceMembers(
          supabase,
          settingsWorkspace.id
        );
        if (memberData) {
          const memberProfiles = await Promise.all(
            memberData.map(async (member) => {
              const profile = await getProfile(supabase, member.user_id);
              return profile
                ? { ...profile, role: member.role }
                : null;
            })
          );
          setMembers(
            memberProfiles.filter(
              (p) => p !== null
            ) as WorkspaceMemberWithProfile[]
          );
        }
        setIsFetchingMembers(false);
      }
    };

    if (settingsWorkspace) {
      fetchMembers();
    } else {
      setMembers([]);
    }
  }, [settingsWorkspace, supabase]);

  const handleCreateGroup = async () => {
    if (!newGroupName || !userId || !supabase) return;
    setIsLoading(true);
    const newWorkspace = await createWorkspace(supabase, {
      name: newGroupName,
      description: newGroupDescription,
      owner_id: userId,
    });

    if (newWorkspace) {
      await addWorkspaceMember(supabase, {
        workspace_id: newWorkspace.id,
        user_id: userId,
        role: 'admin',
      });
      setNewGroupName('');
      setNewGroupDescription('');
      await fetchWorkspaces(); // Refetch workspaces
    }
    setIsLoading(false);
    // How to close dialog? Assume it's handled.
  };

  const handleInviteMember = async (workspaceId: string) => {
    if (!inviteEmail || !supabase) return;

    const profileToInvite = await getProfileByEmail(supabase, inviteEmail);

    if (!profileToInvite) {
      toast.error('User with that email not found.');
      return;
    }

    const result = await addWorkspaceMember(supabase, {
      workspace_id: workspaceId,
      user_id: profileToInvite.id,
      role: 'member',
    });

    if (result) {
      toast.success('Member invited successfully!');
      setInviteEmail('');
      setOpenInviteDialogForWorkspace(null);
      await fetchWorkspaces(); // Refresh workspace data
    } else {
      toast.error('Failed to invite member.');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !settingsWorkspace || !supabase) return;

    await removeWorkspaceMember(
      supabase,
      settingsWorkspace.id,
      memberToRemove.id
    );
    toast.success(`Removed ${memberToRemove.username} from the workspace.`);
    setMembers(members.filter((m) => m.id !== memberToRemove.id));
    await fetchWorkspaces(); // to update member count on card
    setMemberToRemove(null);
    setDialogOpen(null);
  };

  const handleLeaveWorkspace = async () => {
    if (!settingsWorkspace || !userId || !supabase) return;
    await removeWorkspaceMember(supabase, settingsWorkspace.id, userId);
    toast.success(`You have left "${settingsWorkspace.name}".`);
    setSettingsWorkspace(null);
    await fetchWorkspaces();
    setDialogOpen(null);
  };

  const handleDeleteWorkspace = async () => {
    if (!settingsWorkspace || !supabase) return;
    await deleteWorkspace(supabase, settingsWorkspace.id);
    toast.success(`Workspace "${settingsWorkspace.name}" has been deleted.`);
    setSettingsWorkspace(null);
    await fetchWorkspaces();
    setDialogOpen(null);
  };

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  const activeCollaborators = [
    { name: 'Alice Johnson', status: 'online', avatar: '/avatars/alice.jpg', role: 'editor' },
    { name: 'Bob Smith', status: 'online', avatar: '/avatars/bob.jpg', role: 'viewer' },
    { name: 'Charlie Brown', status: 'away', avatar: '/avatars/charlie.jpg', role: 'editor' },
  ];

  const chatMessages = [
    {
      id: 1,
      user: 'Alice Johnson',
      message: 'Hey everyone! I just added some notes about cell division.',
      timestamp: '10:30 AM',
      avatar: '/avatars/alice.jpg',
    },
    {
      id: 2,
      user: 'Bob Smith',
      message: 'Thanks Alice! Could you explain the mitosis process in more detail?',
      timestamp: '10:32 AM',
      avatar: '/avatars/bob.jpg',
    },
    {
      id: 3,
      user: 'Charlie Brown',
      message: 'I found a great video about meiosis. Should I share the link?',
      timestamp: '10:35 AM',
      avatar: '/avatars/charlie.jpg',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'Alice Johnson',
      action: 'added 5 flashcards to Biology Study Group',
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      user: 'Bob Smith',
      action: 'completed the Math quiz in Math Homework Help',
      timestamp: '4 hours ago',
    },
    {
      id: 3,
      user: 'Charlie Brown',
      action: 'shared new notes in Physics Lab Partners',
      timestamp: '1 day ago',
    },
    {
      id: 4,
      user: 'Diana Wilson',
      action: 'joined Biology Study Group',
      timestamp: '2 days ago',
    },
  ];

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Add message to chat
      setChatMessage('');
    }
  };

  const toggleVideoCall = () => {
    setIsVideoCallActive(!isVideoCallActive);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Workspace</h2>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Study Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Study Group</DialogTitle>
                    <DialogDescription>
                      Start a new collaborative study group and invite others to join.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="group-name">Group Name</Label>
                      <Input
                        id="group-name"
                        placeholder="e.g., Chemistry Study Group"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group-description">Description</Label>
                      <Textarea
                        id="group-description"
                        placeholder="Describe the purpose of this study group..."
                        value={newGroupDescription}
                        onChange={(e) => setNewGroupDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="biology">Biology</SelectItem>
                          <SelectItem value="chemistry">Chemistry</SelectItem>
                          <SelectItem value="physics">Physics</SelectItem>
                          <SelectItem value="mathematics">Mathematics</SelectItem>
                          <SelectItem value="history">History</SelectItem>
                          <SelectItem value="literature">Literature</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleCreateGroup}>
                      <Users className="h-4 w-4 mr-2" />
                      Create Group
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Join Group
              </Button>
            </div>
          </div>

          <Tabs defaultValue="groups" className="space-y-4">
            <TabsList>
              <TabsTrigger value="groups">Study Groups</TabsTrigger>
              <TabsTrigger value="live-session">Live Session</TabsTrigger>
              <TabsTrigger value="shared-notes">Shared Notes</TabsTrigger>
              <TabsTrigger value="activity">Activity Feed</TabsTrigger>
            </TabsList>

            {/* Study Groups Tab */}
            <TabsContent value="groups" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workspaces.map((group) => (
                  <div key={group.id} className="block">
                    <Card
                      className="cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col"
                      onClick={() => {
                        navigate({
                          to: '/notes',
                          search: { workspaceId: group.id },
                        });
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={'/avatars/placeholder.jpg'} />
                              <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg leading-tight flex items-center gap-2">
                                {group.name}
                                {group.isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
                              </CardTitle>
                              <Badge variant="secondary">{new Date(group.created_at).toLocaleDateString()}</Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSettingsWorkspace(group);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground mb-3">
                          {group.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {group.membersCount} members
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(group.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex gap-2 w-full">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Placeholder for chat functionality
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Placeholder for join functionality
                            }}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join
                          </Button>
                          <Dialog
                            open={openInviteDialogForWorkspace === group.id}
                            onOpenChange={(isOpen) => {
                              if (!isOpen) {
                                setOpenInviteDialogForWorkspace(null);
                                setInviteEmail('');
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenInviteDialogForWorkspace(group.id);
                                }}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite
                              </Button>
                            </DialogTrigger>
                            <DialogContent
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DialogHeader>
                                <DialogTitle>
                                  Invite to {group.name}
                                </DialogTitle>
                                <DialogDescription>
                                  Enter the email of the user you want to
                                  invite to this workspace.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Label htmlFor="invite-email">Email</Label>
                                <Input
                                  id="invite-email"
                                  type="email"
                                  placeholder="user@example.com"
                                  value={inviteEmail}
                                  onChange={(e) =>
                                    setInviteEmail(e.target.value)
                                  }
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={() => handleInviteMember(group.id)}
                                >
                                  Send Invite
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Live Session Tab */}
            <TabsContent value="live-session" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        Live Study Session
                      </CardTitle>
                      <CardDescription>
                        Biology Study Group - Cell Structure Review
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isVideoCallActive ? (
                        <div className="space-y-4">
                          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white">
                            <div className="text-center">
                              <Video className="h-12 w-12 mx-auto mb-2" />
                              <p>Video call in progress...</p>
                              <p className="text-sm text-gray-300">3 participants connected</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant={isMicMuted ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => setIsMicMuted(!isMicMuted)}
                            >
                              {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant={isCameraOff ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => setIsCameraOff(!isCameraOff)}
                            >
                              {isCameraOff ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={toggleVideoCall}
                            >
                              <PhoneOff className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No active session</h3>
                          <p className="text-muted-foreground mb-4">
                            Start a video call with your study group members
                          </p>
                          <Button onClick={toggleVideoCall}>
                            <Phone className="h-4 w-4 mr-2" />
                            Start Video Call
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
                        <MessageCircle className="h-5 w-5" />
                        Group Chat
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="h-[300px] overflow-y-auto space-y-3 border rounded-lg p-3">
                          {chatMessages.map((msg) => (
                            <div key={msg.id} className="flex gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={msg.avatar} />
                                <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium">{msg.user}</span>
                                  <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                                </div>
                                <p className="text-sm">{msg.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type a message..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <Button size="sm" onClick={handleSendMessage}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Shared Notes Tab */}
            <TabsContent value="shared-notes" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-4">
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Collaborative Notes
                      </CardTitle>
                      <CardDescription>
                        Real-time collaborative editing with your study group
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm font-medium">Active Collaborators:</span>
                          {activeCollaborators.map((collaborator, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${
                                collaborator.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                              }`} />
                              {collaborator.name}
                            </Badge>
                          ))}
                        </div>
                        <Textarea
                          placeholder="Start collaborating on notes... Others can see your changes in real-time!"
                          value={collaborativeNote}
                          onChange={(e) => setCollaborativeNote(e.target.value)}
                          className="min-h-[400px] resize-none"
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
                          <Button size="sm" variant="outline">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
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
                        Collaborators
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {activeCollaborators.map((collaborator, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={collaborator.avatar} />
                                <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{collaborator.name}</p>
                                <p className="text-xs text-muted-foreground">{collaborator.role}</p>
                              </div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${
                              collaborator.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                            }`} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Permissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Anyone can edit</span>
                          <Badge variant="outline">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Comments allowed</span>
                          <Badge variant="outline">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Download allowed</span>
                          <Badge variant="outline">Enabled</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Activity Feed Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Stay updated with what's happening in your study groups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span> {activity.action}
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Dialog
            open={!!settingsWorkspace}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setSettingsWorkspace(null);
              }
            }}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Manage "{settingsWorkspace?.name}"</DialogTitle>
                <DialogDescription>
                  View members and manage workspace settings.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                <h3 className="text-lg font-medium tracking-tight">
                  Members ({members.length})
                </h3>
                {isFetchingMembers ? (
                  <p>Loading members...</p>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback>
                              {member.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">
                              {member.username}{' '}
                              {member.id === userId && '(You)'}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                              {member.role === 'admin' && (
                                <Crown className="h-3 w-3 text-yellow-500" />
                              )}
                              {member.role}
                            </p>
                          </div>
                        </div>
                        {settingsWorkspace?.isOwner &&
                          member.id !== userId && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setMemberToRemove(member);
                                setDialogOpen('remove');
                              }}
                            >
                              Remove
                            </Button>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter className="sm:justify-between pt-4 border-t">
                <div>
                  {!settingsWorkspace?.isOwner && (
                     <Button
                      variant="outline"
                      onClick={() => setDialogOpen('leave')}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Leave Workspace
                    </Button>
                  )}
                </div>
                <div>
                  {settingsWorkspace?.isOwner && (
                    <Button
                      variant="destructive"
                      onClick={() => setDialogOpen('delete')}
                    >
                       <Trash2 className="mr-2 h-4 w-4" /> Delete Workspace
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={dialogOpen === 'remove'}
            onOpenChange={() => setDialogOpen(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently remove{' '}
                  <strong>{memberToRemove?.username}</strong> from the
                  workspace.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveMember}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={dialogOpen === 'leave'}
            onOpenChange={() => setDialogOpen(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will lose access to this workspace and its contents. You
                  will need to be invited back to regain access.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLeaveWorkspace}>
                  Leave
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <AlertDialog
            open={dialogOpen === 'delete'}
            onOpenChange={() => setDialogOpen(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to delete this workspace?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  workspace and all of its data for everyone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteWorkspace}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

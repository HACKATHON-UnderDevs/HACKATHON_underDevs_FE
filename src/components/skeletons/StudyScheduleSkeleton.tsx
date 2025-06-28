import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function StudyScheduleSkeleton() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          {/* Header */}
          <div className="flex items-center justify-between space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-40" />
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
              {/* Study Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between space-y-0">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4" />
                      </div>
                      <Skeleton className="h-8 w-16 mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-3">
                {/* Upcoming Reviews */}
                <Card className="md:col-span-4 lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-5 w-5" />
                            <div>
                              <Skeleton className="h-5 w-40" />
                              <div className="flex items-center gap-2 mt-1">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-1" />
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-3 w-1" />
                                <Skeleton className="h-3 w-12" />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>

                {/* Retention Forecast */}
                <Card className="md:col-span-3 lg:col-span-1">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-36" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-8" />
                          </div>
                          <Skeleton className="h-2 w-full" />
                        </div>
                      ))}
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
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                      <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="p-3 border rounded-lg">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        ))}
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
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-5 w-32" />
                            <div className="flex items-center gap-4 mt-1">
                              <Skeleton className="h-3 w-16" />
                              <Skeleton className="h-3 w-12" />
                              <Skeleton className="h-3 w-20" />
                              <Skeleton className="h-3 w-12" />
                            </div>
                          </div>
                        </div>
                        <Skeleton className="h-8 w-20" />
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
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-56" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
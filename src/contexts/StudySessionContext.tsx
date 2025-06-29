import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StudySet } from '@/supabase/supabase';
import { useSupabase } from './SupabaseContext';
import { useAuth } from '@clerk/clerk-react';
import { deleteStudySet } from '@/services/studySetService';
import { Button } from '@/components/ui/Button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

interface CountdownProps {
    seconds: number;
}

function Countdown({ seconds }: CountdownProps) {
    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return <div>{formatTime(seconds)}</div>;
}

interface StudySessionContextType {
    startStudySet: (studySet: StudySet) => void;
    activeStudySet: StudySet | null;
    sessionSeconds: number;
    isDrawerOpen: boolean;
    setIsDrawerOpen: (isOpen: boolean) => void;
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useStudySession = () => {
    const context = useContext(StudySessionContext);
    if (!context) {
        throw new Error('useStudySession must be used within a StudySessionProvider');
    }
    return context;
};

interface StudySessionProviderProps {
    children: ReactNode;
}

export const StudySessionProvider = ({ children }: StudySessionProviderProps) => {
    const [activeStudySet, setActiveStudySet] = useState<StudySet | null>(null);
    const [sessionSeconds, setSessionSeconds] = useState(0);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const supabase = useSupabase();
    const { userId } = useAuth();

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (activeStudySet && sessionSeconds > 0) {
            interval = setInterval(() => {
                setSessionSeconds((prev) => prev - 1);
            }, 1000);
        } else if (sessionSeconds === 0 && activeStudySet) {
            setActiveStudySet(null);
            setIsDrawerOpen(false);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeStudySet, sessionSeconds]);

    const startStudySet = (studySet: StudySet) => {
        const estimatedSeconds = (studySet.estimated_time_minutes ?? 30) * 60;
        setActiveStudySet(studySet);
        setSessionSeconds(estimatedSeconds);
        setIsDrawerOpen(true);
    };

    const handleStopSession = () => {
        setActiveStudySet(null);
        setSessionSeconds(0);
        setIsDrawerOpen(false);
    };

    const handleMarkAsDone = async () => {
        if (activeStudySet && supabase && userId) {
            await deleteStudySet(supabase, activeStudySet.id);
            // This is tricky because we don't have access to the study sets list here to refresh it.
            // For now, we just end the session. The list will be stale until the user re-navigates.
            // A more robust solution might involve a global state management library or callbacks.
            handleStopSession();
        }
    };

    const value = {
        startStudySet,
        activeStudySet,
        sessionSeconds,
        isDrawerOpen,
        setIsDrawerOpen,
    };

    return (
        <StudySessionContext.Provider value={value}>
            {children}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent>
                    {activeStudySet && (
                        <>
                            <DrawerHeader>
                                <DrawerTitle>Studying: {activeStudySet.title}</DrawerTitle>
                                <DrawerDescription>
                                    Focus on the material. You can hide this drawer and the timer will keep running.
                                </DrawerDescription>
                            </DrawerHeader>
                            <div className="text-center my-4 text-4xl font-bold">
                               <Countdown seconds={sessionSeconds} />
                            </div>
                            <DrawerFooter>
                                <Button onClick={handleMarkAsDone}>Mark as Done</Button>
                                <DrawerClose asChild>
                                    <Button variant="outline" onClick={handleStopSession}>Skip</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </StudySessionContext.Provider>
    );
}; 
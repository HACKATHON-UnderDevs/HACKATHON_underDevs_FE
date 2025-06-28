import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { BarChart3, FileText, Zap, Users } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BorderBeam } from '@/components/magicui/border-beam'
import feature1 from '@/images/feature1.png'
import feature2 from '@/images/feature2.png'
import feature3 from '@/images/feature3.png'
import feature4 from '@/images/feature4.png'

export default function Features() {
    type ImageKey = 'item-1' | 'item-2' | 'item-3' | 'item-4'
    const [activeItem, setActiveItem] = useState<ImageKey>('item-1')

    const images = {
        'item-1': {
            image: feature1,
            alt: 'Smart Notes Interface',
        },
        'item-2': {
            image: feature2,
            alt: 'AI Flashcard Generation',
        },
        'item-3': {
            image: feature3,
            alt: 'Real-time Collaboration',
        },
        'item-4': {
            image: feature4,
            alt: 'Study Schedule Dashboard',
        },
    }

    return (
        <section className="py-12 md:py-20 lg:py-32">
            <div className="bg-linear-to-b absolute inset-0 -z-10 sm:inset-6 sm:rounded-b-3xl dark:block dark:to-[color-mix(in_oklab,var(--color-zinc-900)_75%,var(--color-background))]"></div>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16 lg:space-y-20 dark:[--color-border:color-mix(in_oklab,var(--color-white)_10%,transparent)]">
                <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-6xl">Powerful Features</h2>
                    <p>Discover the comprehensive tools and capabilities that make our platform the perfect solution for your needs.</p>
                </div>

                <div className="grid gap-12 sm:px-12 md:grid-cols-2 lg:gap-20 lg:px-0">
                    <Accordion
                        type="single"
                        value={activeItem}
                        onValueChange={(value) => setActiveItem(value as ImageKey)}
                        className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <FileText className="size-4" />
                                    Smart Notes
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Create, organize, and manage your study notes with our intelligent note-taking system. Rich text editing, tagging, and search capabilities help you stay organized.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Zap className="size-4" />
                                    AI Flashcard Generation
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Transform your notes into interactive flashcards automatically using AI. Enhance your learning with spaced repetition and adaptive study algorithms.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Users className="size-4" />
                                    Real-time Collaboration
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Work together with classmates and study groups in real-time. Share notes, collaborate on projects, and learn together with seamless team features.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <BarChart3 className="size-4" />
                                    Study Schedule
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Plan and track your study sessions with intelligent scheduling. Set goals, monitor progress, and optimize your learning routine with personalized insights.</AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="bg-background relative flex overflow-hidden rounded-3xl border p-2">
                        <div className="w-15 absolute inset-0 right-0 ml-auto border-l bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]"></div>
                        <div className="aspect-76/59 bg-background relative w-[calc(3/4*100%+3rem)] rounded-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeItem}-id`}
                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="size-full overflow-hidden rounded-2xl border bg-zinc-900 shadow-md">
                                    <img
                                        src={images[activeItem].image}
                                        className="object-cover object-center dark:mix-blend-lighten"
                                        alt={images[activeItem].alt}
                                        style={{ width: '25rem', height: '20rem' }}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <BorderBeam
                            duration={6}
                            size={200}
                            className="from-transparent via-yellow-700 to-transparent dark:via-white/50"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

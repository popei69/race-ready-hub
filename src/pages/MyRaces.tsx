import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRaces } from '@/lib/storage';
import { RaceCard } from '@/components/RaceCard';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { DataManagement } from '@/components/DataManagement';
import { Button } from '@/components/ui/button';
import { Plus, Flag } from 'lucide-react';
import { motion } from 'framer-motion';

function loadSortedRaces() {
  return getRaces().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export default function MyRaces() {
  const navigate = useNavigate();
  const [races, setRaces] = useState(loadSortedRaces);

  const refreshRaces = useCallback(() => {
    setRaces(loadSortedRaces());
  }, []);

  const upcomingRaces = races.filter((r) => new Date(r.date) >= new Date(new Date().toDateString()));
  const pastRaces = races.filter((r) => new Date(r.date) < new Date(new Date().toDateString()));

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="My Races"
        actions={
          <div className="flex items-center gap-2">
            <DataManagement onImportComplete={refreshRaces} />
            {races.length > 0 && (
              <Button onClick={() => navigate('/race/new')} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Race</span>
              </Button>
            )}
          </div>
        }
      />

      <main className="container py-6 sm:py-8">
        {races.length === 0 ? (
          <EmptyState
            icon={Flag}
            title="No races yet"
            description="Add your first race to start building your prep checklist. We'll help you stay organized from registration to race morning."
            actionLabel="Add Your First Race"
            onAction={() => navigate('/race/new')}
          />
        ) : (
          <div className="space-y-8">
            {upcomingRaces.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                  Upcoming ({upcomingRaces.length})
                </h2>
                <div className="space-y-3">
                  {upcomingRaces.map((race, index) => (
                    <RaceCard key={race.id} race={race} index={index} />
                  ))}
                </div>
              </section>
            )}

            {pastRaces.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                  Past Races ({pastRaces.length})
                </h2>
                <div className="space-y-3">
                  {pastRaces.map((race, index) => (
                    <RaceCard key={race.id} race={race} index={index + upcomingRaces.length} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Floating add button on mobile */}
        {races.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="fixed bottom-6 right-6 sm:hidden"
          >
            <Button
              size="lg"
              onClick={() => navigate('/race/new')}
              className="h-14 w-14 rounded-full shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}

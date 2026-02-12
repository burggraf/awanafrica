import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { pb } from './pb';

interface Club {
  id: string;
  name: string;
}

interface ClubYear {
  id: string;
  label: string;
}

interface ClubContextType {
  currentClub: Club | null;
  currentYear: ClubYear | null;
  setCurrentClub: (club: Club | null) => void;
  setCurrentYear: (year: ClubYear | null) => void;
  memberships: any[];
  isLoading: boolean;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export function ClubProvider({ children }: { children: ReactNode }) {
  const [currentClub, setCurrentClub] = useState<Club | null>(() => {
    const saved = localStorage.getItem('active-club');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentYear, setCurrentYear] = useState<ClubYear | null>(() => {
    const saved = localStorage.getItem('active-year');
    return saved ? JSON.parse(saved) : null;
  });
  const [memberships, setMemberships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pb.authStore.isValid) {
      pb.collection('club_memberships').getFullList({ expand: 'club' })
        .then((list) => {
          setMemberships(list);
          if (!currentClub && list.length > 0) {
            const defaultClub = { id: list[0].expand?.club.id, name: list[0].expand?.club.name };
            setCurrentClub(defaultClub);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentClub) localStorage.setItem('active-club', JSON.stringify(currentClub));
    else localStorage.removeItem('active-club');
  }, [currentClub]);

  useEffect(() => {
    if (currentYear) localStorage.setItem('active-year', JSON.stringify(currentYear));
    else localStorage.removeItem('active-year');
  }, [currentYear]);

  return (
    <ClubContext.Provider value={{ currentClub, currentYear, setCurrentClub, setCurrentYear, memberships, isLoading }}>
      {children}
    </ClubContext.Provider>
  );
}

export function useClubs() {
  const context = useContext(ClubContext);
  if (context === undefined) throw new Error('useClubs must be used within a ClubProvider');
  return context;
}

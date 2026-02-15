import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { pb } from './pb';
import type { ClubsResponse, ClubMembershipsResponse, ClubYearsResponse } from '@/types/pocketbase-types';

export type ClubMembershipExpanded = ClubMembershipsResponse<{
  club: ClubsResponse;
}>;

// Leader roles that have club management access
export const LEADER_ROLES = ['Director', 'Secretary', 'Treasurer', 'Leader'] as const;
export const ACTIVE_LEADER_ROLES = ['Director', 'Secretary', 'Treasurer', 'Leader'] as const;
export const GUARDIAN_ROLE = 'Guardian';
export const PENDING_ROLE = 'Pending';

interface ClubContextType {
  currentClub: ClubsResponse | null;
  currentYear: ClubYearsResponse | null;
  setCurrentClub: (club: ClubsResponse | null) => void;
  setCurrentYear: (year: ClubYearsResponse | null) => void;
  memberships: ClubMembershipExpanded[];
  isLoading: boolean;
  refreshMemberships: () => Promise<void>;
  // Role helpers
  isGuardian: boolean;
  isLeader: boolean;
  isPendingLeader: boolean;
  isActiveLeader: boolean;
  hasDualRole: boolean;
  currentClubRoles: string[];
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export function ClubProvider({ children }: { children: ReactNode }) {
  const [currentClub, setCurrentClub] = useState<ClubsResponse | null>(() => {
    const saved = localStorage.getItem('active-club');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentYear, setCurrentYear] = useState<ClubYearsResponse | null>(() => {
    const saved = localStorage.getItem('active-year');
    return saved ? JSON.parse(saved) : null;
  });
  const [memberships, setMemberships] = useState<ClubMembershipExpanded[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derive role information from memberships
  const allRoles = memberships.flatMap(m => m.roles || []);
  
  const isGuardian = allRoles.includes(GUARDIAN_ROLE);
  
  const isLeader = allRoles.some(role => 
    ACTIVE_LEADER_ROLES.includes(role as typeof ACTIVE_LEADER_ROLES[number])
  );
  
  const isPendingLeader = allRoles.includes(PENDING_ROLE) && 
    !allRoles.some(role => ACTIVE_LEADER_ROLES.includes(role as typeof ACTIVE_LEADER_ROLES[number]));
  
  const isActiveLeader = allRoles.some(role => 
    ACTIVE_LEADER_ROLES.includes(role as typeof ACTIVE_LEADER_ROLES[number])
  );
  
  const hasDualRole = isGuardian && isLeader;
  
  const currentClubRoles = currentClub 
    ? memberships
        .filter(m => m.expand?.club?.id === currentClub.id)
        .flatMap(m => m.roles || [])
    : [];

  const fetchMemberships = async () => {
    if (pb.authStore.isValid) {
      setIsLoading(true);
      try {
        // Fetch only the current user's memberships
        const userId = pb.authStore.record?.id;
        const list = await pb.collection('club_memberships').getFullList<ClubMembershipExpanded>({ 
          expand: 'club',
          filter: `user = "${userId}"`,
          requestKey: 'global_memberships_fetch'
        });
        setMemberships(list);
      } catch (error: any) {
        if (error.isAbort) return;
        console.error('Failed to fetch memberships:', error);
        setMemberships([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setMemberships([]);
      setCurrentClub(null);
      setCurrentYear(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();

    return pb.authStore.onChange(() => {
      fetchMemberships();
    });
  }, []);

  useEffect(() => {
    if (isLoading || !pb.authStore.isValid) return;

    if (currentClub) {
      const isStillMember = memberships.some((m) => m.expand?.club?.id === currentClub.id);
      if (!isStillMember) {
        setCurrentClub(null);
        setCurrentYear(null);
      }
    } else if (memberships.length > 0) {
      const firstClub = memberships[0].expand?.club;
      if (firstClub) {
        setCurrentClub(firstClub);
      }
    }
  }, [memberships, currentClub, isLoading]);

  useEffect(() => {
    if (currentYear && currentClub) {
      // Basic validation: ensure currentYear belongs to currentClub
      if (currentYear.club !== currentClub.id) {
        setCurrentYear(null);
      }
    }
  }, [currentClub, currentYear]);

  useEffect(() => {
    if (currentClub) localStorage.setItem('active-club', JSON.stringify(currentClub));
    else localStorage.removeItem('active-club');
  }, [currentClub]);

  useEffect(() => {
    if (currentYear) localStorage.setItem('active-year', JSON.stringify(currentYear));
    else localStorage.removeItem('active-year');
  }, [currentYear]);

  return (
    <ClubContext.Provider value={{ 
      currentClub, 
      currentYear, 
      setCurrentClub, 
      setCurrentYear, 
      memberships, 
      isLoading,
      refreshMemberships: fetchMemberships,
      // Role helpers
      isGuardian,
      isLeader,
      isPendingLeader,
      isActiveLeader,
      hasDualRole,
      currentClubRoles
    }}>
      {children}
    </ClubContext.Provider>
  );
}

export function useClubs() {
  const context = useContext(ClubContext);
  if (context === undefined) throw new Error('useClubs must be used within a ClubProvider');
  return context;
}

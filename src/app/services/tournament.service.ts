import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';

export interface Team {
  id: string;
  name: string;
  players: string[];
  groupPoints?: number;
  groupWins?: number;
  groupLosses?: number;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  team1Score: number;
  team2Score: number;
  completed: boolean;
  phase: 'group' | 'knockout';
  round?: number; // For knockout phase: quarterfinal = 1, semifinal = 2, final = 3
  matchNumber?: number; // For knockout phase bracket positioning
  winnerId?: string;
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  description?: string;
  status: 'pending' | 'group' | 'knockout' | 'completed';
  teams: Team[];
  matches: Match[];
  currentPhase: 'group' | 'knockout';
  teamsPerGroup?: number;
  numberOfGroups?: number;
  knockoutQualifiers?: number; // Number of teams that qualify from each group
}

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  private readonly STORAGE_KEY = 'tournaments';
  private tournaments = new BehaviorSubject<Tournament[]>([
    {
      id: '1',
      name: 'Summer Tournament 2024',
      date: '2024-07-15',
      description: 'Annual summer beer pong tournament',
      status: 'pending',
      teams: [],
      matches: [],
      currentPhase: 'group',
      teamsPerGroup: 4,
      numberOfGroups: 1,
      knockoutQualifiers: 2,
    },
  ]);

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.tournaments.next(JSON.parse(stored));
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(this.tournaments.value)
    );
  }

  getTournaments(): Observable<Tournament[]> {
    return this.tournaments.asObservable();
  }

  getTournament(id: string): Observable<Tournament | undefined> {
    return this.tournaments.pipe(
      map((tournaments) => tournaments.find((t) => t.id === id))
    );
  }

  createTournament(tournament: Tournament): void {
    this.tournaments.next([...this.tournaments.value, tournament]);
    this.saveToLocalStorage();
  }

  updateTournament(tournament: Tournament): void {
    this.tournaments.next(
      this.tournaments.value.map((t) =>
        t.id === tournament.id ? tournament : t
      )
    );
    this.saveToLocalStorage();
  }

  deleteTournament(id: string): void {
    this.tournaments.next(this.tournaments.value.filter((t) => t.id !== id));
    this.saveToLocalStorage();
  }

  generateGroupMatches(tournament: Tournament): void {
    if (!tournament.teams || tournament.teams.length < 4) return;

    // Default to 4 teams per group if not specified
    tournament.teamsPerGroup = tournament.teamsPerGroup || 4;
    tournament.knockoutQualifiers = tournament.knockoutQualifiers || 2;

    // Calculate number of groups
    tournament.numberOfGroups = Math.ceil(
      tournament.teams.length / tournament.teamsPerGroup
    );

    // Reset team stats
    tournament.teams.forEach((team) => {
      team.groupPoints = 0;
      team.groupWins = 0;
      team.groupLosses = 0;
    });

    // Generate round-robin matches within each group
    const matches: Match[] = [];
    for (let g = 0; g < tournament.numberOfGroups; g++) {
      const groupTeams = tournament.teams.slice(
        g * tournament.teamsPerGroup,
        (g + 1) * tournament.teamsPerGroup
      );

      // Generate round-robin matches for this group
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          matches.push({
            id: crypto.randomUUID(),
            team1Id: groupTeams[i].id,
            team2Id: groupTeams[j].id,
            team1Score: 0,
            team2Score: 0,
            completed: false,
            phase: 'group',
          });
        }
      }
    }

    tournament.matches = matches;
    tournament.currentPhase = 'group';
    tournament.status = 'group';
    this.updateTournament(tournament);
  }

  generateKnockoutMatches(tournament: Tournament): void {
    if (!tournament.teams || !tournament.numberOfGroups) return;

    // Get qualified teams from each group based on points
    const qualifiedTeams: Team[] = [];
    for (let g = 0; g < tournament.numberOfGroups; g++) {
      const groupTeams = tournament.teams
        .slice(
          g * tournament.teamsPerGroup!,
          (g + 1) * tournament.teamsPerGroup!
        )
        .sort((a, b) => (b.groupPoints || 0) - (a.groupPoints || 0))
        .slice(0, tournament.knockoutQualifiers);
      qualifiedTeams.push(...groupTeams);
    }

    // Generate knockout matches
    const matches: Match[] = [];
    const rounds = Math.ceil(Math.log2(qualifiedTeams.length));
    let matchNumber = 0;

    // First round
    for (let i = 0; i < qualifiedTeams.length; i += 2) {
      if (i + 1 < qualifiedTeams.length) {
        matches.push({
          id: crypto.randomUUID(),
          team1Id: qualifiedTeams[i].id,
          team2Id: qualifiedTeams[i + 1].id,
          team1Score: 0,
          team2Score: 0,
          completed: false,
          phase: 'knockout',
          round: 1,
          matchNumber: matchNumber++,
        });
      }
    }

    // Add placeholder matches for subsequent rounds
    let matchesInRound = Math.floor(matches.length / 2);
    for (let round = 2; round <= rounds; round++) {
      for (let i = 0; i < matchesInRound; i++) {
        matches.push({
          id: crypto.randomUUID(),
          team1Id: '', // Will be filled when previous round completes
          team2Id: '',
          team1Score: 0,
          team2Score: 0,
          completed: false,
          phase: 'knockout',
          round: round,
          matchNumber: matchNumber++,
        });
      }
      matchesInRound = Math.floor(matchesInRound / 2);
    }

    // Keep group matches and add knockout matches
    tournament.matches = [
      ...tournament.matches.filter((m) => m.phase === 'group'),
      ...matches,
    ];
    tournament.currentPhase = 'knockout';
    tournament.status = 'knockout';
    this.updateTournament(tournament);
  }

  updateMatchScore(
    tournament: Tournament,
    match: Match,
    team1Score: number,
    team2Score: number
  ): void {
    match.team1Score = team1Score;
    match.team2Score = team2Score;

    if (match.completed) {
      if (match.phase === 'group') {
        this.updateGroupStandings(tournament, match);
      } else if (match.phase === 'knockout') {
        this.updateKnockoutBracket(tournament, match);

        // Check if tournament is completed (final match is completed)
        const knockoutMatches = tournament.matches.filter(
          (m) => m.phase === 'knockout'
        );
        const maxRound = Math.max(...knockoutMatches.map((m) => m.round || 0));
        const finalMatch = knockoutMatches.find((m) => m.round === maxRound);

        if (finalMatch?.completed) {
          tournament.status = 'completed';
        }
      }
    }

    this.updateTournament(tournament);
  }

  private updateGroupStandings(tournament: Tournament, match: Match): void {
    const team1 = tournament.teams.find((t) => t.id === match.team1Id);
    const team2 = tournament.teams.find((t) => t.id === match.team2Id);

    if (!team1 || !team2) return;

    if (match.team1Score > match.team2Score) {
      team1.groupPoints = (team1.groupPoints || 0) + 3;
      team1.groupWins = (team1.groupWins || 0) + 1;
      team2.groupLosses = (team2.groupLosses || 0) + 1;
    } else if (match.team1Score < match.team2Score) {
      team2.groupPoints = (team2.groupPoints || 0) + 3;
      team2.groupWins = (team2.groupWins || 0) + 1;
      team1.groupLosses = (team1.groupLosses || 0) + 1;
    } else {
      team1.groupPoints = (team1.groupPoints || 0) + 1;
      team2.groupPoints = (team2.groupPoints || 0) + 1;
    }
  }

  private updateKnockoutBracket(tournament: Tournament, match: Match): void {
    if (!match.round) return;

    // Determine winner
    const winnerId =
      match.team1Score > match.team2Score ? match.team1Id : match.team2Id;
    match.winnerId = winnerId;

    // Find the next match in the bracket
    const nextRound = match.round + 1;
    const nextMatchNumber = Math.floor(match.matchNumber! / 2);
    const nextMatch = tournament.matches.find(
      (m) =>
        m.phase === 'knockout' &&
        m.round === nextRound &&
        m.matchNumber === nextMatchNumber
    );

    if (nextMatch) {
      // Place winner in next match
      if (!nextMatch.team1Id) {
        nextMatch.team1Id = winnerId;
      } else {
        nextMatch.team2Id = winnerId;
      }
    }
  }
}

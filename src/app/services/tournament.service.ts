import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

export type TeamId = string;

export interface Team {
  id: TeamId;
  name: string;
  players: string[];
  groupPoints?: number;
  groupWins?: number;
  groupLosses?: number;
}

export interface Match {
  id: string;
  team1Id: TeamId;
  team2Id: TeamId;
  team1Score: number;
  team2Score: number;
  completed: boolean;
  phase: 'group' | 'knockout';
  round?: number; // For knockout phase: quarterfinal = 1, semifinal = 2, final = 3
  matchNumber?: number; // For knockout phase bracket positioning
  winnerId?: string;
  groupIndex?: number; // For group phase matches
}

export class Tournament {
  public teams: Map<TeamId, Team>;
  public matches: Match[] = [];
  public groups: Team[][] = [];
  public status: 'group' | 'knockout' | 'completed' = 'group';
  public currentPhase: 'group' | 'knockout' = 'group';
  public teamsPerGroup: number = 4;
  public numberOfGroups: number = 1;
  public knockoutQualifiers: number = 2; // Number of teams that qualify from each group) {}

  constructor(
    public id: string,
    public name: string,
    public date: string,
    public description?: string,
  ) {
    this.teams = new Map();
  }
}

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  private readonly STORAGE_KEY = 'tournaments';
  private tournaments = new BehaviorSubject<Tournament[]>([]);

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // Convert tournaments to proper Tournament instances with Map
      const tournaments = parsed.map((t: any) => {
        const tournament = new Tournament(t.id, t.name, t.date, t.description);
        tournament.status = t.status;
        tournament.currentPhase = t.currentPhase;
        tournament.matches = t.matches || [];
        tournament.groups = t.groups || [];
        tournament.teamsPerGroup = t.teamsPerGroup;
        tournament.numberOfGroups = t.numberOfGroups;
        tournament.knockoutQualifiers = t.knockoutQualifiers;

        // Convert teams array back to Map
        if (Array.isArray(t.teams)) {
          t.teams.forEach((team: Team) => {
            tournament.teams.set(team.id, team);
          });
        }

        return tournament;
      });

      this.tournaments.next(tournaments);
    }
  }

  private saveToLocalStorage(): void {
    const tournaments = this.tournaments.value.map((t) => ({
      ...t,
      teams: Array.from(t.teams.values()), // Convert Map to array of teams
    }));

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tournaments));
  }

  getTournaments(): Observable<Tournament[]> {
    return this.tournaments;
  }

  getTournament(id: string): Observable<Tournament | undefined> {
    return this.tournaments.pipe(
      map((tournaments) => tournaments.find((t) => t.id === id)),
    );
  }

  createTournament(tournament: Tournament): void {
    this.tournaments.next([...this.tournaments.value, tournament]);
    this.saveToLocalStorage();
  }

  updateTournament(tournament: Tournament): void {
    this.tournaments.next(
      this.tournaments.value.map((t) =>
        t.id === tournament.id ? tournament : t,
      ),
    );
    this.saveToLocalStorage();
  }

  addTeam(team: Team, tournamentId: string): void {
    const tournament = this.tournaments.value.find(
      (t) => t.id === tournamentId,
    );
    if (!tournament) return;

    // Add the team
    tournament.teams.set(team.id, team);
    this.createGroups(tournament);

    // Update the tournament
    this.updateTournament(tournament);
  }

  removeTeam(teamId: string, tournamentId: string): void {
    const tournament = this.tournaments.value.find(
      (t) => t.id === tournamentId,
    );
    if (!tournament) return;

    // Remove the team
    tournament.teams.delete(teamId);
    this.createGroups(tournament);

    // Update the tournament
    this.updateTournament(tournament);
  }

  generateGroupMatches(tournament: Tournament): void {
    const matches: Match[] = [];
    let matchNumber = 1;

    const groups = tournament.groups;
    for (const group of groups) {
      // If odd number of teams, add a "bye" team
      const teamsInRound = group.length % 2 === 0 ? group : [...group, null];
      const numRounds = teamsInRound.length - 1;
      const halfSize = teamsInRound.length / 2;

      // Generate rounds using circle method
      for (let round = 0; round < numRounds; round++) {
        // Generate matches for this round
        for (let i = 0; i < halfSize; i++) {
          const team1 = teamsInRound[i];
          const team2 = teamsInRound[teamsInRound.length - 1 - i];

          // Skip if either team is the "bye" team
          if (team1 !== null && team2 !== null) {
            matches.push({
              id: crypto.randomUUID(),
              team1Id: team1.id,
              team2Id: team2.id,
              team1Score: 0,
              team2Score: 0,
              completed: false,
              phase: 'group',
              round: round + 1,
              matchNumber: matchNumber++,
              groupIndex: groups.indexOf(group),
            });
          }
        }

        // Rotate teams for next round (keep first team fixed)
        teamsInRound.splice(1, 0, teamsInRound.pop()!);
      }
    }

    tournament.matches = matches;
    tournament.status = 'group';
    this.updateTournament(tournament);
  }

  createGroups(tournament: Tournament): void {
    // Calculate optimal number of groups and teams per group
    const totalTeams = tournament.teams.size;
    let numberOfGroups: number;

    // For 5 teams: 2 groups (3,2)
    // For 6 teams: 2 groups (3,3)
    // For 7 teams: 2 groups (4,3)
    // For 8 teams: 2 groups (4,4)
    // For 9 teams: 3 groups (3,3,3)
    // For 10 teams: 3 groups (4,3,3)
    // For 11 teams: 3 groups (4,4,3)
    // For 12 teams: 3 groups (4,4,4)
    if (totalTeams <= 4) {
      numberOfGroups = 1;
    } else if (totalTeams <= 8) {
      numberOfGroups = 2;
    } else if (totalTeams <= 12) {
      numberOfGroups = 3;
    } else {
      numberOfGroups = 4;
    }

    tournament.numberOfGroups = numberOfGroups;
    tournament.groups = Array.from({ length: numberOfGroups }, () => []);

    // Get all team IDs and shuffle them
    const teamIds = Array.from(tournament.teams.keys());
    for (let i = teamIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [teamIds[i], teamIds[j]] = [teamIds[j], teamIds[i]];
    }

    // Distribute teams across groups using snake pattern
    // For example, with 3 groups:
    // Group 1: 1, 6, 7
    // Group 2: 2, 5, 8
    // Group 3: 3, 4, 9
    let forward = true;
    for (let i = 0; i < teamIds.length; i++) {
      const groupIndex = forward
        ? i % numberOfGroups
        : numberOfGroups - 1 - (i % numberOfGroups);
      const team = tournament.teams.get(teamIds[i])!;

      tournament.groups[groupIndex].push(team);

      // Reverse direction after completing each row
      if ((i + 1) % numberOfGroups === 0) {
        forward = !forward;
      }
    }

    // Update the tournament
    this.updateTournament(tournament);
  }

  deleteTournament(id: string): void {
    this.tournaments.next(this.tournaments.value.filter((t) => t.id !== id));
    this.saveToLocalStorage();
  }

  removeTeamFromTournament(tournamentId: string, teamId: string): void {
    const tournament = this.tournaments.value.find(
      (t) => t.id === tournamentId,
    );
    if (!tournament) return;

    // Remove the team
    tournament.teams.delete(teamId);
    tournament.matches = tournament.matches.filter(
      (m) => m.team1Id !== teamId && m.team2Id !== teamId,
    );

    // Update the tournament
    this.updateTournament(tournament);
  }

  generateKnockoutMatches(tournament: Tournament): void {
    if (!tournament.teams || !tournament.numberOfGroups) return;

    // // Get qualified teams from each group based on points
    // const qualifiedTeams: Team[] = [];
    // for (let g = 0; g < tournament.numberOfGroups; g++) {
    //   const groupTeams = tournament.teams
    //     .slice(
    //       g * tournament.teamsPerGroup!,
    //       (g + 1) * tournament.teamsPerGroup!,
    //     )
    //     .sort((a, b) => (b.groupPoints || 0) - (a.groupPoints || 0))
    //     .slice(0, tournament.knockoutQualifiers);
    //   qualifiedTeams.push(...groupTeams);
    // }

    // // Generate knockout matches
    // const matches: Match[] = [];
    // const rounds = Math.ceil(Math.log2(qualifiedTeams.length));
    // let matchNumber = 0;

    // // First round
    // for (let i = 0; i < qualifiedTeams.length; i += 2) {
    //   if (i + 1 < qualifiedTeams.length) {
    //     matches.push({
    //       id: crypto.randomUUID(),
    //       team1Id: qualifiedTeams[i].id,
    //       team2Id: qualifiedTeams[i + 1].id,
    //       team1Score: 0,
    //       team2Score: 0,
    //       completed: false,
    //       phase: 'knockout',
    //       round: 1,
    //       matchNumber: matchNumber++,
    //     });
    //   }
    // }

    // // Add placeholder matches for subsequent rounds
    // let matchesInRound = Math.floor(matches.length / 2);
    // for (let round = 2; round <= rounds; round++) {
    //   for (let i = 0; i < matchesInRound; i++) {
    //     matches.push({
    //       id: crypto.randomUUID(),
    //       team1Id: '', // Will be filled when previous round completes
    //       team2Id: '',
    //       team1Score: 0,
    //       team2Score: 0,
    //       completed: false,
    //       phase: 'knockout',
    //       round: round,
    //       matchNumber: matchNumber++,
    //     });
    //   }
    //   matchesInRound = Math.floor(matchesInRound / 2);
    // }

    // // Keep group matches and add knockout matches
    // tournament.matches = [
    //   ...tournament.matches.filter((m) => m.phase === 'group'),
    //   ...matches,
    // ];
    // tournament.currentPhase = 'knockout';
    // tournament.status = 'knockout';
    // this.updateTournament(tournament);
  }

  updateMatchScore(
    tournament: Tournament,
    match: Match,
    team1Score: number,
    team2Score: number,
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
          (m) => m.phase === 'knockout',
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
    const team1 = tournament.teams.get(match.team1Id)!;
    const team2 = tournament.teams.get(match.team2Id)!;

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
        m.matchNumber === nextMatchNumber,
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

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type TeamId = string;

export interface Team {
  id: TeamId;
  name: string;
  players: string[];
  groupPoints?: number;
  groupWins?: number;
  groupLosses?: number;
  knockout_used?: boolean;
}

export interface Match {
  id: string;
  team1: Team;
  team2: Team;
  team1Score: number;
  team2Score: number;
  completed: boolean;
  winnerId?: string;
  groupIndex?: number; // For group phase matches
}

export class Tournament {
  public teams: Map<TeamId, Team>;
  public matches: Match[] = [];
  public groups: TeamId[][] = [];
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

  getTournament(id: string, tournaments: Tournament[]): Tournament | undefined {
    return tournaments.find((t) => t.id === id);
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

  deleteTournament(id: string): void {
    this.tournaments.next(this.tournaments.value.filter((t) => t.id !== id));
    this.saveToLocalStorage();
  }

  // ### Teams Section ###

  addTeam(team: Team, tournamentId: string): void {
    const tournament = this.tournaments.value.find(
      (t) => t.id === tournamentId,
    );
    if (!tournament) return;

    // Add the team
    tournament.teams.set(team.id, team);
    this.resetPoints(tournamentId);
    this.createGroupedTeams(tournamentId);
  }

  updateTeam(team: Team, tournamentId: string): void {
    const tournament = this.tournaments.value.find(
      (t) => t.id === tournamentId,
    );
    if (!tournament) return;

    tournament.teams.set(team.id, team);
    this.updateTournament(tournament);
  }

  removeTeamFromTournament(tournamentId: string, teamId: string): void {
    const tournament = this.tournaments.value.find(
      (t) => t.id === tournamentId,
    );
    if (!tournament) return;

    // Remove the team
    tournament.teams.delete(teamId);
    tournament.matches = tournament.matches.filter(
      (m) => m.team1.id !== teamId && m.team2.id !== teamId,
    );
    tournament.groups = tournament.groups.map((g) =>
      g.filter((id) => id !== teamId),
    );

    // Update the tournament
    this.updateTournament(tournament);
  }

  getAllTeams(tournamentId: string): Team[] {
    const tournament = this.tournaments.value.find(
      (t) => t.id === tournamentId,
    );
    if (!tournament) return [];
    const allTeams = Array.from(tournament.teams.values());
    return allTeams;
  }

  // ### Groups Section ###

  createGroupedTeams(tournamentId: string): void {
    const tournament = this.tournaments.value.find(
      (t) => t.id === tournamentId,
    );
    if (!tournament) return;

    const teams = Array.from(tournament.teams.values());
    const numGroups = tournament.numberOfGroups;

    const groups: TeamId[][] = Array.from({ length: numGroups }, () => []);

    teams.forEach((team, index) => {
      const groupIndex = index % numGroups;
      groups[groupIndex].push(team.id);
    });

    tournament.groups = groups;
    this.generateGroupMatches(tournament);
  }

  updateNumberOfGroups(tournamentId: string, numberOfGroups: number): void {
    const tournament = this.tournaments.value.find(
      (t) => t.id === tournamentId,
    );
    if (!tournament) return;

    tournament.numberOfGroups = numberOfGroups;
    this.createGroupedTeams(tournamentId);
  }

  // ### Matches Section ###

  generateGroupMatches(tournament: Tournament): void {
    const matches: Match[] = [];
    let matchNumber = 1;

    const groups = tournament.groups;
    for (const group of groups) {
      const teamsInRound = group.length % 2 === 0 ? group : [...group, null];
      const numRounds = teamsInRound.length - 1;
      const halfSize = teamsInRound.length / 2;

      // Generate rounds using circle method
      for (let round = 0; round < numRounds; round++) {
        // Generate matches for this round
        for (let i = 0; i < halfSize; i++) {
          const team1_id = teamsInRound[i];
          const team2_id = teamsInRound[teamsInRound.length - 1 - i];

          // Skip if either team is the "bye" team
          if (team1_id !== null && team2_id !== null) {
            matches.push({
              id: crypto.randomUUID(),
              team1: tournament.teams.get(team1_id)!,
              team2: tournament.teams.get(team2_id)!,
              team1Score: 0,
              team2Score: 0,
              completed: false,
              groupIndex: groups.indexOf(group),
            });
          }
        }

        // Rotate teams for next round (keep first team fixed)
        teamsInRound.splice(1, 0, teamsInRound.pop()!);
      }
    }

    tournament.matches = matches;
    this.updateTournament(tournament);
  }

  resetPoints(id: string) {
    const tournament = this.tournaments.value.find((t) => t.id === id);
    if (!tournament) return;

    tournament.teams.forEach((team) => {
      team.groupPoints = 0;
      team.groupWins = 0;
      team.groupLosses = 0;
    });

    tournament.matches.forEach((match) => {
      match.team1Score = 0;
      match.team2Score = 0;
      match.completed = false;
    });

    this.updateTournament(tournament);
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
      this.updateGroupStandings(tournament, match);
    }

    this.updateTournament(tournament);
  }

  private updateGroupStandings(tournament: Tournament, match: Match): void {
    const team1 = tournament.teams.get(match.team1.id)!;
    const team2 = tournament.teams.get(match.team2.id)!;

    if (!team1 || !team2) return;

    team1.groupPoints = (team1.groupPoints || 0) + match.team1Score;

    team2.groupPoints = (team2.groupPoints || 0) + match.team2Score;

    if (match.team1Score > match.team2Score) {
      team1.groupWins = (team1.groupWins || 0) + 1;
      team2.groupLosses = (team2.groupLosses || 0) + 1;
    } else if (match.team1Score < match.team2Score) {
      team2.groupWins = (team2.groupWins || 0) + 1;
      team1.groupLosses = (team1.groupLosses || 0) + 1;
    }
  }
}

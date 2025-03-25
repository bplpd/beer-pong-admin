import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import {
  TournamentService,
  Tournament,
  Match,
  Team,
} from '../../../services/tournament.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TeamDialogComponent } from './team-dialog/team-dialog.component';

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatTableModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    TeamDialogComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './tournament-detail.component.html',
  styleUrls: ['./tournament-detail.component.scss'],
})
export class TournamentDetailComponent implements OnInit {
  tournament: Tournament | null = null;
  activeTab: 'teams' | 'matches' = 'teams';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tournamentService: TournamentService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tournamentService.getTournament(id).subscribe((tournament) => {
        this.tournament = tournament || null;
      });
    }
  }

  get groupedTeams(): { [key: string]: Team[] } {
    if (!this.tournament || !this.tournament.teams.length) return {};

    const groups: { [key: string]: Team[] } = {};
    const teamsPerGroup = this.tournament.teamsPerGroup || 4;

    for (let i = 0; i < this.tournament.teams.length; i++) {
      const groupIndex = Math.floor(i / teamsPerGroup);
      if (!groups[groupIndex]) {
        groups[groupIndex] = [];
      }
      groups[groupIndex].push(this.tournament.teams[i]);
    }

    return groups;
  }

  startGroupPhase(): void {
    if (!this.tournament) return;
    this.tournamentService.generateGroupMatches(this.tournament);
  }

  startKnockoutPhase(): void {
    if (!this.tournament) return;
    this.tournamentService.generateKnockoutMatches(this.tournament);
  }

  getGroupMatches(): Match[] {
    return this.tournament?.matches.filter((m) => m.phase === 'group') || [];
  }

  getKnockoutMatches(): Match[] {
    return this.tournament?.matches.filter((m) => m.phase === 'knockout') || [];
  }

  getKnockoutRounds(): { round: number; matches: Match[] }[] {
    const knockoutMatches = this.getKnockoutMatches();
    const rounds: { round: number; matches: Match[] }[] = [];

    if (knockoutMatches.length === 0) return rounds;

    const maxRound = Math.max(...knockoutMatches.map((m) => m.round || 0));

    for (let round = 1; round <= maxRound; round++) {
      rounds.push({
        round,
        matches: knockoutMatches
          .filter((m) => m.round === round)
          .sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0)),
      });
    }

    return rounds;
  }

  getRoundName(round: number): string {
    const roundNames = {
      1: 'Quarter-finals',
      2: 'Semi-finals',
      3: 'Final',
    };
    return roundNames[round as keyof typeof roundNames] || `Round ${round}`;
  }

  getTeamName(teamId: string): string {
    return this.tournament?.teams.find((t) => t.id === teamId)?.name || 'TBD';
  }

  updateMatchScore(match: Match, team1Score: number, team2Score: number): void {
    if (!this.tournament) return;
    this.tournamentService.updateMatchScore(
      this.tournament,
      match,
      team1Score,
      team2Score,
    );
  }

  canStartKnockoutPhase(): boolean {
    if (!this.tournament) return false;

    // Check if all group matches are completed
    const groupMatches = this.getGroupMatches();
    return (
      groupMatches.length > 0 &&
      groupMatches.every((m) => m.completed) &&
      this.tournament.currentPhase === 'group'
    );
  }

  addTeam(): void {
    if (!this.tournament) return;

    const dialogRef = this.dialog.open(TeamDialogComponent, {
      width: '500px',
      data: {},
    });

    dialogRef
      .afterClosed()
      .subscribe((result: { name: string; players: string[] }) => {
        if (result && this.tournament) {
          const newTeam: Team = {
            id: crypto.randomUUID(),
            name: result.name,
            players: result.players,
            groupPoints: 0,
            groupWins: 0,
            groupLosses: 0,
          };

          this.tournament.teams.push(newTeam);
          this.tournamentService.updateTournament(this.tournament);
        }
      });
  }

  removeTeam(team: Team): void {
    if (!this.tournament) return;

    const index = this.tournament.teams.findIndex((t) => t.id === team.id);
    if (index > -1) {
      this.tournament.teams.splice(index, 1);
      this.tournamentService.updateTournament(this.tournament);
    }
  }

  getTeamRecord(team: Team): string {
    if (!this.tournament) return '0-0';

    const matches = this.tournament.matches.filter(
      (m) => m.team1Id === team.id || m.team2Id === team.id,
    );

    const wins = matches.filter((m) => {
      if (m.team1Id === team.id) return m.team1Score > m.team2Score;
      return m.team2Score > m.team1Score;
    }).length;

    const losses = matches.filter((m) => {
      if (m.team1Id === team.id) return m.team1Score < m.team2Score;
      return m.team2Score < m.team1Score;
    }).length;

    return `${wins}-${losses}`;
  }

  generateMatches(): void {
    if (!this.tournament || this.tournament.teams.length < 2) return;

    const teams = this.tournament.teams;
    const matches: Match[] = [];

    // Generate round-robin matches
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          id: crypto.randomUUID(),
          team1Id: teams[i].id,
          team2Id: teams[j].id,
          team1Score: 0,
          team2Score: 0,
          completed: false,
          phase: 'group',
        });
      }
    }

    this.tournament.matches = matches;
    this.tournament.status = 'group';
    this.tournamentService.updateTournament(this.tournament);
  }

  updateScore(event: Event, match: Match, team: 'team1' | 'team2'): void {
    const value = Math.max(
      0,
      parseInt((event.target as HTMLInputElement).value) || 0,
    );
    const updatedMatch = {
      ...match,
      [team === 'team1' ? 'team1Score' : 'team2Score']: value,
    };

    const updatedTournament: Tournament = {
      ...this.tournament!,
      matches: this.tournament!.matches.map((m) =>
        m.team1Id === match.team1Id && m.team2Id === match.team2Id
          ? updatedMatch
          : m,
      ),
    };

    this.tournamentService.updateTournament(updatedTournament);
    this.tournament = updatedTournament;
  }

  incrementScore(
    match: Match,
    team: 'team1' | 'team2',
    increment: number,
  ): void {
    if (!this.tournament) return;

    const currentScore = team === 'team1' ? match.team1Score : match.team2Score;
    const newScore = Math.max(0, currentScore + increment);

    const updatedMatch = {
      ...match,
      [team === 'team1' ? 'team1Score' : 'team2Score']: newScore,
    };

    const updatedTournament: Tournament = {
      ...this.tournament,
      matches: this.tournament.matches.map((m) =>
        m.team1Id === match.team1Id && m.team2Id === match.team2Id
          ? updatedMatch
          : m,
      ),
    };

    this.tournamentService.updateTournament(updatedTournament);
    this.tournament = updatedTournament;
  }

  toggleMatchStatus(match: Match): void {
    if (!this.tournament) return;

    const updatedMatch = {
      ...match,
      completed: !match.completed,
    };

    const updatedTournament = {
      ...this.tournament,
      matches: this.tournament.matches.map((m) =>
        m.id === match.id ? updatedMatch : m,
      ),
    };

    this.tournamentService.updateTournament(updatedTournament);
    this.tournament = updatedTournament;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  deleteTournament(): void {
    if (!this.tournament) return;

    if (
      confirm(
        'Are you sure you want to delete this tournament? This action cannot be undone.',
      )
    ) {
      this.tournamentService.deleteTournament(this.tournament.id);
      this.router.navigate(['/']);
    }
  }

  editTeam(team: Team): void {
    if (!this.tournament) return;

    const dialogRef = this.dialog.open(TeamDialogComponent, {
      width: '500px',
      data: { team },
    });

    dialogRef.afterClosed().subscribe((updatedTeam: Team | undefined) => {
      if (updatedTeam) {
        const updatedTournament: Tournament = {
          ...this.tournament!,
          teams: this.tournament!.teams.map((t) =>
            t.id === team.id ? updatedTeam : t,
          ),
        };

        this.tournamentService.updateTournament(updatedTournament);
        this.tournament = updatedTournament;
      }
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  Match,
  Team,
  TeamId,
  Tournament,
  TournamentService,
} from '../../../services/tournament.service';
import { GroupPhaseComponent } from './group-phase/group-phase.component';
import { KnockoutPhaseComponent } from './knockout-phase/knockout-phase.component';
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
    GroupPhaseComponent,
    KnockoutPhaseComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './tournament-detail.component.html',
  styleUrl: './tournament-detail.component.scss',
})
export class TournamentDetailComponent implements OnInit {
  tournamentId: string | null = null;
  tournament: Tournament | null = null;
  activeTab: 'teams' | 'matches' = 'teams';
  groupedTeams = signal<Team[][]>([]);
  numberOfGroups = signal<number>(1);

  addTeamBtn = viewChild<MatButton>('addTeamBtn');

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
        if (this.tournament) {
          this.tournamentId = id;
          this.createGroupedTeams();
        }
      });
    }
  }

  createGroupedTeams(): void {
    if (!this.tournament) return;

    const teams = Array.from(this.tournament.teams.values());
    const numGroups = this.numberOfGroups();
    const teamsPerGroup = Math.ceil(teams.length / numGroups);

    const groups: Team[][] = Array.from({ length: numGroups }, () => []);

    teams.forEach((team, index) => {
      const groupIndex = index % numGroups;
      groups[groupIndex].push(team);
    });

    this.groupedTeams.set(groups);
  }

  removeTeam(team: any): void {
    if (!this.tournament) return;

    this.tournamentService.removeTeamFromTournament(
      this.tournament.id,
      team.id,
    );

    this.tournamentService
      .getTournament(this.tournament.id)
      .subscribe((tournament) => {
        this.tournament = tournament || null;
        this.createGroupedTeams();
      });
  }

  startGroupPhase(): void {
    if (!this.tournament) return;
    this.tournamentService.generateGroupMatches(this.tournament);

    // Refresh tournament data to get updated groups
    this.tournamentService
      .getTournament(this.tournament.id)
      .subscribe((tournament) => {
        this.tournament = tournament || null;
      });
  }

  startKnockoutPhase(): void {
    if (!this.tournament) return;
    this.tournamentService.generateKnockoutMatches(this.tournament);
  }

  getGroupMatches(): Match[] {
    return Array.from(this.tournament?.matches.values() || []).filter(
      (m) => m.phase === 'group'
    );
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

  getTeamName(teamId: TeamId): string {
    return this.tournament!.teams.get(teamId)!.name || 'TBD';
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

    const btn_ref = this.addTeamBtn();
    btn_ref?._elementRef.nativeElement.blur();

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

          this.tournamentService.addTeam(newTeam, this.tournament.id);
          this.createGroupedTeams();
        }
      });
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
    if (!this.tournament || this.tournament.teams.size < 2) return;
    this.tournamentService.generateGroupMatches(this.tournament);
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

  updateNumberOfGroups(change: number): void {
    const currentGroups = this.numberOfGroups();
    const newValue = currentGroups + change;

    // Ensure we have at least 1 group and not more groups than teams
    if (
      this.tournament &&
      newValue >= 1 &&
      newValue <= this.tournament.teams.size
    ) {
      this.numberOfGroups.set(newValue);
      this.createGroupedTeams();
    }
  }
}

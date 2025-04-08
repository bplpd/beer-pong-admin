import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import {
  Match,
  Team,
  TeamId,
  Tournament,
  TournamentService,
} from '../../../services/tournament.service';
import { GroupComponent } from './group/group.component';
import { KnockoutComponent } from './knockout/knockout.component';
import { MatchesComponent } from './matches/matches.component';
import { NumberGroupsComponent } from './number-groups/number-groups.component';
import { TeamDialogComponent } from './team-dialog/team-dialog.component';

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatTableModule,
    MatTabsModule,
    MatIconModule,
    GroupComponent,
    KnockoutComponent,
    NumberGroupsComponent,
    MatchesComponent,
  ],
  templateUrl: './tournament-detail.component.html',
  styleUrls: ['./tournament-detail.component.scss'],
})
export class TournamentDetailComponent implements OnInit {
  tournamentId: string | null = null;
  tournament: Tournament | null = null;
  activeTab: number = 2;

  useRandomNames = signal<boolean>(false);
  addTeamBtn = viewChild<MatButton>('addTeamBtn');

  constructor(
    private route: ActivatedRoute,
    private tournamentService: TournamentService,
    private dialog: MatDialog,
  ) {
    const storedValue = localStorage.getItem('useRandomNames');
    if (storedValue !== null) {
      this.useRandomNames.set(storedValue === 'true');
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tournamentService.getTournaments().subscribe((tournaments) => {
        const tournament = this.tournamentService.getTournament(
          id,
          tournaments,
        );
        if (tournament) {
          this.tournament = tournament;
          this.tournamentId = id;
        }
      });
    }
  }

  onTabChange(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  setUseRandomNames(value: boolean) {
    this.useRandomNames.set(value);
    localStorage.setItem('useRandomNames', value ? 'true' : 'false');
  }

  removeTeam(team: any): void {
    if (!this.tournament) return;

    this.tournamentService.removeTeamFromTournament(
      this.tournament.id,
      team.id,
    );
  }

  canStartKnockoutPhase(): boolean {
    if (!this.tournament) return false;

    // Check if all group matches are completed
    const groupMatches = this.getGroupMatches(0);
    return (
      groupMatches.length > 0 &&
      groupMatches.every((m) => m.completed) &&
      this.tournament.currentPhase === 'group'
    );
  }

  getGroupMatches(groupIndex: number): Match[] {
    if (!this.tournament) return [];
    return this.tournament.matches.filter((m) => m.groupIndex === groupIndex);
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

  getTeamName(teamId: TeamId): string {
    return this.tournament!.teams.get(teamId)!.name || 'TBD';
  }

  addTeam(): void {
    if (!this.tournament) return;

    const btn = this.addTeamBtn();
    btn?._elementRef?.nativeElement.blur();

    const dialogRef = this.dialog.open(TeamDialogComponent, {
      width: '500px',
      data: { useRandomNames: this.useRandomNames() },
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
        }
      });
  }

  getTeamRecord(team: Team): string {
    if (!this.tournament) return '0-0';

    const matches = this.tournament.matches.filter(
      (m) => m.team1.id === team.id || m.team2.id === team.id,
    );

    const wins = matches.filter((m) => {
      if (m.team1.id === team.id) return m.team1Score > m.team2Score;
      return m.team2Score > m.team1Score;
    }).length;

    const losses = matches.filter((m) => {
      if (m.team1.id === team.id) return m.team1Score < m.team2Score;
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
        m.team1.id === match.team1.id && m.team2.id === match.team2.id
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
        m.team1.id === match.team1.id && m.team2.id === match.team2.id
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
}

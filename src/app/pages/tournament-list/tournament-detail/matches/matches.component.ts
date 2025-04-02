import { CommonModule } from '@angular/common';
import { Component, OnInit, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import {
  Match,
  Team,
  TeamId,
  Tournament,
  TournamentService,
} from '../../../../services/tournament.service';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
  ],
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss'],
})
export class MatchesComponent implements OnInit {
  id = input.required<string>();
  tournament = signal<Tournament | undefined>(undefined);
  groupedTeams = signal<Team[][]>([]);

  constructor(private tournamentService: TournamentService) {}

  ngOnInit() {
    this.tournamentService.getTournaments().subscribe((tournaments) => {
      const id = this.id();
      const tournament = this.tournamentService.getTournament(id, tournaments);
      if (!tournament) {
        throw new Error(`Tournament with id ${id} not found`);
      }
      this.tournament.set(tournament);
      this.groupedTeams.set(tournament.groups || []);
    });
  }

  getGroupMatches(groupIndex: number): Match[] {
    const tournament = this.tournament();
    if (!tournament) return [];
    return tournament.matches.filter(
      (m) => m.phase === 'group' && m.groupIndex === groupIndex,
    );
  }

  getTeamName(teamId: TeamId): string {
    const tournament = this.tournament();
    if (!tournament) return 'TBD';
    return tournament.teams.get(teamId)?.name || 'TBD';
  }

  updateMatchScore(match: Match, team1Score: number, team2Score: number): void {
    const tournament = this.tournament();
    if (!tournament) return;
    this.tournamentService.updateMatchScore(
      tournament,
      match,
      team1Score,
      team2Score,
    );
  }
}

import { Component, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  Match,
  TeamId,
  Tournament,
  TournamentService,
} from '../../../../services/tournament.service';

@Component({
  selector: 'app-knockout',
  imports: [MatCheckboxModule, MatFormFieldModule, FormsModule, MatCardModule],
  templateUrl: './knockout.component.html',
  styleUrl: './knockout.component.scss',
})
export class KnockoutComponent implements OnInit {
  //
  tournamentId = input.required<string>();
  tournament: Tournament | undefined = undefined;

  constructor(private tournamentService: TournamentService) {}

  ngOnInit(): void {
    this.tournamentService.getTournaments().subscribe((tournaments) => {
      const tournament = this.tournamentService.getTournament(
        this.tournamentId(),
        tournaments,
      );
      if (tournament) {
        this.tournament = tournament;
      }
    });
  }

  getKnockoutMatches(): Match[] {
    if (!this.tournament) return [];
    return this.tournament.matches.filter((m) => m.phase === 'knockout');
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
}

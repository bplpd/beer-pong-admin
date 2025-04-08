import {
  Component,
  effect,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  Team,
  TournamentService,
} from '../../../../../services/tournament.service';
import { KnockoutMatch } from '../knockout.component';

@Component({
  selector: 'app-match-card',
  imports: [
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    FormsModule,
  ],
  templateUrl: './match-card.component.html',
})
export class MatchCardComponent implements OnInit {
  tournamentId = input.required<string>();
  teams_selectable = input<boolean>(false);
  match_i = input.required<KnockoutMatch | undefined>();
  match_u = signal<KnockoutMatch | undefined>(undefined);
  match: KnockoutMatch | undefined;

  matchComplete = output<KnockoutMatch>();
  allTeams: Team[] = [];

  constructor(private tournamentService: TournamentService) {
    effect(() => {
      const match = this.match_i();
      const updated = this.match_u();
      if (updated) {
        this.match = updated;
      } else {
        this.match = match;
      }
    });
  }

  ngOnInit(): void {
    this.tournamentService.getTournaments().subscribe((tournaments) => {
      const id = this.tournamentId();
      const tournament = tournaments.find((t) => t.id === id);
      if (tournament) {
        this.allTeams = this.tournamentService.getAllTeams(id);
      }
    });

    const match = this.match_i();
    if (match === undefined) {
      return;
    }

    if (this.teams_selectable() === false) {
      return;
    }
    this.allTeams = this.tournamentService.getAllTeams(this.tournamentId());
  }

  select1Team(teamName: string, match: KnockoutMatch) {
    match.team1 = this.allTeams.find((t) => t.name === teamName);
    this.match_u.set(match);
  }

  select2Team(teamName: string, match: KnockoutMatch) {
    match.team2 = this.allTeams.find((t) => t.name === teamName);
    this.match_u.set(match);
  }

  is1Winner(match: KnockoutMatch): boolean {
    if (!match.team1) return false;
    return match.completed && match.winnerId === match.team1.id;
  }

  is2Winner(match: KnockoutMatch): boolean {
    if (!match.team2) return false;
    return match.completed && match.winnerId === match.team2.id;
  }
}

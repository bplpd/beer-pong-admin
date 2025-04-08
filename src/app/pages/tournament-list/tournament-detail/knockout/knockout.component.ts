import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  Match,
  Team,
  Tournament,
  TournamentService,
} from '../../../../services/tournament.service';
import { MatchCardComponent } from './match-card/match-card.component';

enum MatchType {
  Final = 'final',
  Semi = 'semi',
  Quarter = 'quarter',
  Octo = 'octo',
  Third = 'third',
}

export type KnockoutMatch = Omit<
  Match,
  'team1' | 'team2' | 'team1Score' | 'team2Score' | 'winnerId'
> & {
  team1: Team | undefined;
  team2: Team | undefined;
  team1Score: number | undefined;
  team2Score: number | undefined;
  winnerId: string | undefined;
  type: MatchType;
};

function createSpaceholderMatch(type: MatchType): KnockoutMatch {
  return {
    id: crypto.randomUUID(),
    completed: false,
    winnerId: undefined,
    team1: undefined,
    team2: undefined,
    team1Score: undefined,
    team2Score: undefined,
    type,
  };
}

function createMultipleSpaceholderMatches(
  type: MatchType,
  num: number = 1,
): KnockoutMatch[] {
  return Array.from({ length: num }, () =>
    createSpaceholderMatch(type),
  ) as KnockoutMatch[];
}

@Component({
  selector: 'app-knockout',
  standalone: true,
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatchCardComponent,
  ],
  templateUrl: './knockout.component.html',
  styleUrls: ['./knockout.component.scss'],
})
export class KnockoutComponent implements OnInit {
  id = input.required<string>();
  tournament: Tournament | undefined = undefined;
  matches = signal<KnockoutMatch[]>([]);

  final = signal<KnockoutMatch | undefined>(undefined);
  semifinals = signal<KnockoutMatch[] | undefined>(undefined);
  quarters = signal<KnockoutMatch[] | undefined>(undefined);
  octofinals = signal<KnockoutMatch[] | undefined>(undefined);
  thirdPlaceMatch = signal<KnockoutMatch | undefined>(undefined);

  // finals, semi, quarter, octo, third
  userSelection = signal<boolean[]>([true, true, false, false, false]);

  private tournamentService = inject(TournamentService);

  ngOnInit(): void {
    this.tournamentService.getTournaments().subscribe((tournaments) => {
      const tournament = this.tournamentService.getTournament(
        this.id(),
        tournaments,
      );
      if (tournament) {
        this.tournament = tournament;
        this.initMatches();
      }
    });
  }

  initMatches() {
    if (this.final() !== undefined) {
      this.final.set(createSpaceholderMatch(MatchType.Final));
    }
    if (this.userSelection()[1]) {
      const semis = this.semifinals();
      if (semis === undefined) {
        this.semifinals.set(
          createMultipleSpaceholderMatches(MatchType.Semi, 2),
        );
      }
    } else {
      this.semifinals.set(undefined);
    }
    if (this.userSelection()[2]) {
      const quarters = this.quarters();
      if (quarters === undefined) {
        this.quarters.set(
          createMultipleSpaceholderMatches(MatchType.Quarter, 4),
        );
      }
    } else {
      this.quarters.set(undefined);
    }
    if (this.userSelection()[3]) {
      const octos = this.octofinals();
      if (octos === undefined) {
        this.octofinals.set(
          createMultipleSpaceholderMatches(MatchType.Octo, 8),
        );
      }
    } else {
      this.octofinals.set(undefined);
    }

    if (this.userSelection()[4]) {
      const third = this.thirdPlaceMatch();
      if (third === undefined) {
        this.thirdPlaceMatch.set(createSpaceholderMatch(MatchType.Third));
      }
    } else {
      this.thirdPlaceMatch.set(undefined);
    }
  }

  updateUserSelection(round: number) {
    this.userSelection.update((selection) => {
      selection[round] = !selection[round];
      return selection;
    });
    this.initMatches();
  }

  onMatchComplete(match: KnockoutMatch | undefined): void {
    if (!match) return;
    if (!match.completed) {
      match.winnerId = undefined;
      return;
    }

    if (match.team1Score === undefined || match.team2Score === undefined)
      return;

    match.winnerId =
      match.team1Score > match.team2Score ? match.team1?.id : match.team2?.id;

    this.updateMatch(match);
  }

  updateMatch(match: KnockoutMatch) {
    switch (match.type) {
      case MatchType.Final:
        this.final.set(match);
        break;
      case MatchType.Semi:
        const semifinals_before = this.semifinals()!;
        const semifinals_after = this._updateMatch(match, semifinals_before);
        this.semifinals.set(semifinals_after);
        this._createThirdPlaceMatchBasedOnSemiFinals();
        this._createFinalsBasedOnSemiFinals();
        break;
      case MatchType.Quarter:
        const quarters_before = this.quarters()!;
        const quarters_after = this._updateMatch(match, quarters_before);
        this.quarters.set(quarters_after);
        this._createSemiFinalsBasedOnQuartersFinals();
        break;
      case MatchType.Octo:
        const octofinals_before = this.octofinals()!;
        const octofinals_after = this._updateMatch(match, octofinals_before);
        this.octofinals.set(octofinals_after);
        this._createQuarterFinalsBasedOnOctofinals();
        break;
      case MatchType.Third:
        this.thirdPlaceMatch.set(match);
        break;
    }
  }

  private _updateMatch(match: KnockoutMatch, matches: KnockoutMatch[]) {
    const index = matches.findIndex((m) => m.id === match.id);
    if (index === -1) return;
    matches[index] = match;
    return matches;
  }

  private _createQuarterFinalsBasedOnOctofinals() {
    const octofinals = this.octofinals();
    if (
      !octofinals ||
      octofinals.length !== 8 ||
      !octofinals.every((m) => m.completed)
    ) {
      this.quarters.set(undefined);
      return;
    }

    const quarters: KnockoutMatch[] = [];
    for (let i = 0; i < 4; i++) {
      const match1 = octofinals[i];
      const match2 = octofinals[i + 4];
      const quarter: KnockoutMatch = {
        id: crypto.randomUUID(),
        team1:
          match1.winnerId === match1.team1!.id ? match1.team1 : match1.team2,
        team2:
          match2.winnerId === match2.team1!.id ? match2.team1 : match2.team2,
        team1Score: undefined,
        team2Score: undefined,
        completed: false,
        winnerId: undefined,
        type: MatchType.Quarter,
      };
      quarters.push(quarter);
    }
    this.quarters.set(quarters);
  }

  private _createSemiFinalsBasedOnQuartersFinals(): void {
    const quarters = this.quarters();
    if (
      !quarters ||
      quarters.length !== 4 ||
      !quarters.every((m) => m.completed)
    ) {
      this.semifinals.set(undefined);
      return;
    }

    const semifinals: KnockoutMatch[] = [];
    for (let i = 0; i < 2; i++) {
      const match1 = quarters[i];
      const match2 = quarters[i + 2];
      const semifinal: KnockoutMatch = {
        id: crypto.randomUUID(),
        team1:
          match1.winnerId === match1.team1!.id ? match1.team1 : match1.team2,
        team2:
          match2.winnerId === match2.team1!.id ? match2.team1 : match2.team2,
        team1Score: undefined,
        team2Score: undefined,
        completed: false,
        winnerId: undefined,
        type: MatchType.Semi,
      };
      semifinals.push(semifinal);
    }
    this.semifinals.set(semifinals);
  }

  private _createThirdPlaceMatchBasedOnSemiFinals(): void {
    const semi_finals = this.semifinals();
    if (
      !semi_finals ||
      semi_finals.length !== 2 ||
      !semi_finals.every((m) => m.completed)
    ) {
      this.thirdPlaceMatch.set(undefined);
      return;
    }

    const losers = semi_finals
      .map((m) => (m.winnerId === m.team1!.id ? m.team2 : m.team1))
      .filter((team): team is Team => team !== undefined);

    this.thirdPlaceMatch.set({
      id: crypto.randomUUID(),
      team1: losers[0],
      team2: losers[1],
      team1Score: undefined,
      team2Score: undefined,
      completed: false,
      winnerId: undefined,
      type: MatchType.Third,
    });
  }

  private _createFinalsBasedOnSemiFinals(): void {
    const semifinals = this.semifinals();
    if (
      !semifinals ||
      semifinals.length !== 2 ||
      !semifinals.every((m) => m.completed)
    ) {
      this.final.set(undefined);
      return;
    }

    const final: KnockoutMatch = {
      id: crypto.randomUUID(),
      team1:
        semifinals[0].winnerId === semifinals[0].team1!.id
          ? semifinals[0].team1
          : semifinals[0].team2,
      team2:
        semifinals[1].winnerId === semifinals[1].team1!.id
          ? semifinals[1].team1
          : semifinals[1].team2,
      team1Score: undefined,
      team2Score: undefined,
      completed: false,
      winnerId: undefined,
      type: MatchType.Final,
    };
    this.final.set(final);
  }
}

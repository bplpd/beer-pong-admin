import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  Tournament,
  TournamentService,
} from '../../../../services/tournament.service';

@Component({
  selector: 'app-number-groups',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './number-groups.component.html',
  styleUrl: './number-groups.component.scss',
})
export class NumberGroupsComponent {
  tournament = input.required<Tournament>();
  createGroupedTeams = output<number>();

  constructor(tournamentService: TournamentService) {}

  updateNumberOfGroups(change: number): void {
    const currentGroups = this.tournament().numberOfGroups;
    const newValue = currentGroups + change;

    // Ensure we have at least 1 group and not more groups than teams
    if (
      this.tournament &&
      newValue >= 1 &&
      newValue <= this.tournament().teams.size
    ) {
      this.createGroupedTeams.emit(newValue);
    }
  }
}

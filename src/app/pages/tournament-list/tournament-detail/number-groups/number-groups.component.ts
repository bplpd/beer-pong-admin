import { Component, input, OnInit, signal } from '@angular/core';
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
export class NumberGroupsComponent implements OnInit {
  id = input.required<string>();

  tournament = signal<Tournament | undefined>(undefined);

  constructor(private tournamentService: TournamentService) {}

  ngOnInit() {
    this.tournamentService.getTournaments().subscribe((tournaments) => {
      const id = this.id();
      const tournament = tournaments.find((t) => t.id === id);
      if (tournament) {
        this.tournament.set(tournament);
      }
    });
  }

  updateNumberOfGroups(change: number): void {
    const currentGroups = this.tournament()!.numberOfGroups;
    const newValue = currentGroups + change;

    // Ensure we have at least 1 group and not more groups than teams
    if (newValue >= 1 && newValue <= this.tournament()!.teams.size) {
      this.tournamentService.updateNumberOfGroups(this.id(), newValue);
    }
  }
}

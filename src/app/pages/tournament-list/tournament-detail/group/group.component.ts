import { CommonModule } from '@angular/common';
import { Component, input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  Team,
  Tournament,
  TournamentService,
} from '../../../../services/tournament.service';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
  ],
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
})
export class GroupComponent implements OnInit {
  id = input.required<string>();
  tournament = signal<Tournament | undefined>(undefined);

  constructor(private tournamentService: TournamentService) {}

  ngOnInit(): void {
    this.tournamentService.getTournaments().subscribe((tournaments) => {
      const tournament = this.tournamentService.getTournament(
        this.id(),
        tournaments,
      );
      this.tournament.set(tournament);
    });
  }

  getTeam(id: string) {
    const tournament = this.tournament();
    if (!tournament) return undefined;
    return tournament.teams.get(id);
  }

  removeTeam(team: Team) {
    this.tournamentService.removeTeamFromTournament(this.id(), team.id);
  }
}

import { CommonModule } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
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
  tournament: Tournament | undefined = undefined;

  constructor(private tournamentService: TournamentService) {}

  ngOnInit(): void {
    this.tournamentService.getTournaments().subscribe((tournaments) => {
      this.tournament = this.tournamentService.getTournament(
        this.id(),
        tournaments,
      );
    });
  }

  removeTeam(team: Team) {
    this.tournamentService.removeTeamFromTournament(this.id(), team.id);
  }
}

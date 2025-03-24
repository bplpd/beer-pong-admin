import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  TournamentService,
  Tournament,
} from '../../services/tournament.service';

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tournament-list.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class TournamentListComponent implements OnInit {
  tournaments: Tournament[] = [];

  constructor(private tournamentService: TournamentService) {}

  ngOnInit(): void {
    this.tournamentService.getTournaments().subscribe((tournaments) => {
      this.tournaments = tournaments;
    });
  }

  deleteTournament(id: string): void {
    if (confirm('Are you sure you want to delete this tournament?')) {
      this.tournamentService.deleteTournament(id);
    }
  }

  trackTournamentById(index: number, tournament: Tournament): string {
    return tournament.id;
  }
}

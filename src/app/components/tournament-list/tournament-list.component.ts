import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  TournamentService,
  Tournament,
} from '../../services/tournament.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule],
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

  constructor(
    private tournamentService: TournamentService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.tournamentService.getTournaments().subscribe((tournaments) => {
      this.tournaments = tournaments;
    });
  }

  deleteTournament(tournament: Tournament): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Tournament',
        message: `Are you sure you want to delete the tournament "${tournament.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.tournamentService.deleteTournament(tournament.id);
      }
    });
  }

  trackTournamentById(index: number, tournament: Tournament): string {
    return tournament.id;
  }
}

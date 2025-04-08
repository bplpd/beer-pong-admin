import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import {
  Tournament,
  TournamentService,
} from '../../services/tournament.service';

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
        title: 'Lösche das Turnier',
        message: `Sind Sie sicher, dass Sie das Turnier löschen möchten? "${tournament.name}"?`,
        confirmText: 'Löschen',
        cancelText: 'Abbrechen',
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

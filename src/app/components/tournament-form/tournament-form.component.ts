import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TournamentService, Tournament } from '../../services/tournament.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-tournament-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="container">
      <h2>{{ isEditing ? 'Edit Tournament' : 'Create Tournament' }}</h2>
      <form [formGroup]="tournamentForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Tournament Name</mat-label>
          <input matInput formControlName="name" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date" required>
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4"></textarea>
        </mat-form-field>

        <div class="button-row">
          <button mat-button type="button" (click)="goBack()">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="!tournamentForm.valid">
            {{ isEditing ? 'Save' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }
    .button-row {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }
    h2 {
      margin-bottom: 2rem;
      font-size: 1.5rem;
      font-weight: 500;
    }
  `]
})
export class TournamentFormComponent implements OnInit {
  tournamentForm: FormGroup;
  isEditing = false;
  tournamentId?: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private tournamentService: TournamentService
  ) {
    // Format today's date as YYYY-MM-DD for the date input
    const today = new Date().toISOString().split('T')[0];

    this.tournamentForm = this.fb.group({
      name: ['', Validators.required],
      date: [today, Validators.required],
      description: ['']
    });

    // Check if we're editing an existing tournament
    this.tournamentId = this.route.snapshot.paramMap.get('id') ?? undefined;
    if (this.tournamentId) {
      this.isEditing = true;
    }
  }

  ngOnInit(): void {
    if (this.isEditing && this.tournamentId) {
      this.tournamentService.getTournament(this.tournamentId).subscribe(tournament => {
        if (tournament) {
          this.tournamentForm.patchValue({
            name: tournament.name,
            date: tournament.date,
            description: tournament.description
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      const formValue = this.tournamentForm.value;
      const tournament: Tournament = {
        id: this.tournamentId || crypto.randomUUID(),
        name: formValue.name,
        date: formValue.date,
        description: formValue.description || '',
        status: 'pending',
        teams: [],
        matches: [],
        currentPhase: 'group',
        teamsPerGroup: 4,
        numberOfGroups: 1,
        knockoutQualifiers: 2
      };

      if (this.isEditing) {
        this.tournamentService.updateTournament(tournament);
      } else {
        this.tournamentService.createTournament(tournament);
      }

      this.router.navigate(['/tournaments']);
    }
  }

  goBack(): void {
    this.router.navigate(['/tournaments']);
  }
}

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Team } from '../../services/tournament.service';

@Component({
  selector: 'app-team-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditing ? 'Edit Team' : 'Add Team' }}</h2>
    <form [formGroup]="teamForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Team Name</mat-label>
          <input matInput formControlName="name" required />
        </mat-form-field>

        <div formArrayName="players">
          <h3>Players</h3>
          <div
            *ngFor="let player of players.controls; let i = index"
            class="player-row"
          >
            <mat-form-field appearance="fill" class="player-input">
              <mat-label>Player {{ i + 1 }}</mat-label>
              <input matInput [formControlName]="i" required />
            </mat-form-field>
            <button
              mat-icon-button
              type="button"
              (click)="removePlayer(i)"
              *ngIf="players.length > 2"
            >
              <mat-icon>delete</mat-icon>
            </button>
          </div>
          <button
            mat-button
            type="button"
            (click)="addPlayer()"
            [disabled]="players.length >= 4"
          >
            <mat-icon>add</mat-icon> Add Player
          </button>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancel</button>
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="!teamForm.valid"
        >
          {{ isEditing ? 'Save' : 'Add' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
      }
      .player-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .player-input {
        flex: 1;
      }
      h3 {
        margin: 16px 0 8px;
      }
    `,
  ],
})
export class TeamDialogComponent {
  teamForm: FormGroup;
  isEditing: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { team?: Team }
  ) {
    this.isEditing = !!data.team;
    this.teamForm = this.fb.group({
      name: [data.team?.name || '', Validators.required],
      players: this.fb.array([]),
    });

    // Initialize players
    const initialPlayers = data.team?.players || ['', ''];
    initialPlayers.forEach((player) => this.addPlayer(player));
  }

  get players() {
    return this.teamForm.get('players') as FormArray;
  }

  addPlayer(value: string = '') {
    this.players.push(this.fb.control(value, Validators.required));
  }

  removePlayer(index: number) {
    this.players.removeAt(index);
  }

  onSubmit() {
    if (this.teamForm.valid) {
      const result = {
        id: this.data.team?.id || crypto.randomUUID(),
        name: this.teamForm.value.name,
        players: this.teamForm.value.players,
        groupPoints: this.data.team?.groupPoints || 0,
        groupWins: this.data.team?.groupWins || 0,
        groupLosses: this.data.team?.groupLosses || 0,
      };

      this.dialogRef.close(result);
    }
  }
}

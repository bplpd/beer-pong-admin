import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Team } from '../../../../services/tournament.service';
import { UniqueNameService } from '../../../../services/uniqueName/uniqueName.service';

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
  templateUrl: './team-dialog.component.html',
  styleUrl: './team-dialog.component.scss',
})
export class TeamDialogComponent {
  teamForm: FormGroup;
  isEditing = false;
  isAnimating = false;

  isAnimatingMap: Map<string, boolean> = new Map();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { team?: Team },
    private uniqueNameService: UniqueNameService,
  ) {
    this.isEditing = !!data?.team;
    const name =
      data?.team?.name || this.uniqueNameService.generateRandomTeamName();

    // Generate default player names if not editing
    const defaultPlayers = data?.team?.players || [
      this.uniqueNameService.generateRandomPlayerName(),
      this.uniqueNameService.generateRandomPlayerName(),
    ];

    this.teamForm = this.fb.group({
      name: [name],
      players: this.fb.array(defaultPlayers, Validators.required),
    });
  }

  patchRandomName(controlName: string): void {
    if (this.isAnimatingMap.get(controlName)) return;
    this.isAnimatingMap.set(controlName, true);
    const newName = this.uniqueNameService.generateRandomTeamName();
    this.teamForm.get('name')!.setValue(newName);
    setTimeout(() => this.isAnimatingMap.set(controlName, false), 500);
  }

  patchRandomPlayerName(index: number, controlName: string): void {
    if (this.isAnimatingMap.get(controlName)) return;
    this.isAnimatingMap.set(controlName, true);
    const newName = this.uniqueNameService.generateRandomPlayerName();
    this.players.at(index).setValue(newName);
    setTimeout(() => this.isAnimatingMap.set(controlName, false), 500);
  }

  get players() {
    return this.teamForm.get('players') as FormArray;
  }

  onSubmit() {
    if (this.teamForm.valid) {
      this.dialogRef.close(this.teamForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  deleteName() {
    this.teamForm.get('name')!.setValue('');
  }

  deletePlayerName(index: number) {
    this.players.at(index).setValue('');
  }
}

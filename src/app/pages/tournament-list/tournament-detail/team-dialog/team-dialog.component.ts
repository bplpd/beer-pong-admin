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

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { team?: Team },
    private uniqueNameService: UniqueNameService,
  ) {
    this.isEditing = !!data?.team;
    const name =
      data?.team?.name || this.uniqueNameService.generateRandomTeamName();
    this.teamForm = this.fb.group({
      name: [name],
      players: this.fb.array(
        data?.team?.players || ['', ''],
        Validators.required,
      ),
    });
  }

  patchRandomName(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    const newName = this.uniqueNameService.generateRandomTeamName();
    this.teamForm.get('name')!.setValue(newName);
    setTimeout(() => (this.isAnimating = false), 500);
  }

  get players() {
    return this.teamForm.get('players') as FormArray;
  }

  addPlayer() {
    this.players.push(this.fb.control('', Validators.required));
  }

  removePlayer(index: number) {
    this.players.removeAt(index);
  }

  onSubmit() {
    if (this.teamForm.valid) {
      this.dialogRef.close(this.teamForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

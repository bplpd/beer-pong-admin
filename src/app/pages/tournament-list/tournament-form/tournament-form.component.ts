import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  Tournament,
  TournamentService,
} from '../../../services/tournament.service';
import { UniqueNameService } from '../../../services/uniqueName/uniqueName.service';

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
    MatNativeDateModule,
  ],
  templateUrl: './tournament-form.component.html',
  styleUrl: './tournament-form.component.scss',
})
export class TournamentFormComponent implements OnInit {
  //

  tournamentForm: FormGroup;
  isEditing = false;
  tournamentId?: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private tournamentService: TournamentService,
    private dateAdapter: DateAdapter<any>,
    private uniqueNameService: UniqueNameService,
  ) {
    this.tournamentForm = this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      description: [''],
    });

    // Check if we're editing an existing tournament
    this.tournamentId = this.route.snapshot.paramMap.get('id') ?? undefined;
    if (this.tournamentId) {
      this.isEditing = true;
    }

    // Set default name only for new tournaments
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.uniqueNameService.generateUniqueTournamentName().then((name) => {
        this.tournamentForm.patchValue({
          name: name,
        });
      });
    }
  }

  ngOnInit(): void {
    this.dateAdapter.setLocale('de');
    if (this.isEditing && this.tournamentId) {
      this.tournamentService
        .getTournament(this.tournamentId)
        .subscribe((tournament) => {
          if (tournament) {
            // Format the date to yyyy-MM-dd for the input
            const date = new Date(tournament.date);
            const formattedDate = date.toISOString().split('T')[0];

            this.tournamentForm.patchValue({
              name: tournament.name,
              date: formattedDate,
              description: tournament.description,
            });
          }
        });
    } else {
      const date = new Date().toISOString().split('T')[0];

      this.tournamentForm.patchValue({
        date: date,
      });
    }
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  }

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      const formData = this.tournamentForm.value;
      const routeId = this.route.snapshot.paramMap.get('id')!;
      const id = this.isEditing ? routeId : crypto.randomUUID();

      const tournament = new Tournament(
        id,
        formData.name,
        formData.date,
        formData.description || '',
      );

      if (this.isEditing) {
        this.tournamentService.updateTournament(tournament);
      } else {
        this.tournamentService.createTournament(tournament);
      }

      // Navigate directly to the tournament detail view
      this.router.navigate(['/tournament', id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/tournaments']);
  }
}

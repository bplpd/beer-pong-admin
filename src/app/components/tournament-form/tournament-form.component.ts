import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  TournamentService,
  Tournament,
} from '../../services/tournament.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

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
  styles: [
    `
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
    `,
  ],
})
export class TournamentFormComponent implements OnInit {
  tournamentForm: FormGroup;
  isEditing = false;
  tournamentId?: string;

  private readonly adjectives = [
    'Happy',
    'Brave',
    'Mighty',
    'Swift',
    'Clever',
    'Jolly',
    'Fierce',
    'Wise',
    'Noble',
    'Lucky',
    'Proud',
    'Wild',
  ];

  private readonly animals = [
    'Horse',
    'Lion',
    'Tiger',
    'Eagle',
    'Bear',
    'Wolf',
    'Dolphin',
    'Falcon',
    'Panther',
    'Dragon',
    'Phoenix',
    'Elephant',
  ];

  private async generateUniqueName(): Promise<string> {
    const existingNames = await firstValueFrom(
      this.tournamentService.getTournaments().pipe(
        map((tournaments) => {
          if (!tournaments || !tournaments.length) {
            return new Set();
          }
          return new Set(tournaments.map((t) => t.name.toLowerCase()));
        }),
      ),
    );

    // Try to generate a unique name (max 100 attempts to prevent infinite loop)
    let attempts = 0;
    let name: string;

    do {
      const adjective =
        this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
      const animal =
        this.animals[Math.floor(Math.random() * this.animals.length)];
      name = `${adjective} ${animal} - Tournament`;
      attempts++;

      // If we've tried all combinations, add a number to make it unique
      if (attempts >= 100) {
        name = `${name} ${Math.floor(Math.random() * 1000)}`;
        break;
      }
    } while (existingNames?.has(name.toLowerCase()));

    return name;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private tournamentService: TournamentService,
    private dateAdapter: DateAdapter<any>,
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
      this.generateUniqueName().then((name) => {
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
      const tournament: Tournament = {
        id,
        name: formData.name,
        date: formData.date,
        description: formData.description || '',
        status: 'pending',
        teams: [],
        matches: [],
        currentPhase: 'group',
        teamsPerGroup: 4,
        numberOfGroups: 1,
        knockoutQualifiers: 2,
      };

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

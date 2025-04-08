import { Routes } from '@angular/router';

import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TournamentDetailComponent } from './pages/tournament-list/tournament-detail/tournament-detail.component';
import { TournamentFormComponent } from './pages/tournament-list/tournament-form/tournament-form.component';
import { TournamentListComponent } from './pages/tournament-list/tournament-list.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'tournaments', component: TournamentListComponent },
  { path: 'tournament/new', component: TournamentFormComponent },
  { path: 'tournament/:id', component: TournamentDetailComponent },
  { path: 'privacy', component: PrivacyPolicyComponent },
  { path: '**', redirectTo: '' },
];

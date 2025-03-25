import { Routes } from '@angular/router';

import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { TournamentListComponent } from './pages/tournament-list/tournament-list.component';
import { TournamentFormComponent } from './pages/tournament-list/tournament-form/tournament-form.component';
import { TournamentDetailComponent } from './pages/tournament-list/tournament-detail/tournament-detail.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'tournaments', component: TournamentListComponent },
  { path: 'tournament/new', component: TournamentFormComponent },
  { path: 'tournament/:id', component: TournamentDetailComponent },
  { path: 'privacy', component: PrivacyPolicyComponent },
  { path: '**', redirectTo: '' },
];

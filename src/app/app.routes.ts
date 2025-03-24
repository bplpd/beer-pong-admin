import { Routes } from '@angular/router';
import { TournamentListComponent } from './components/tournament-list/tournament-list.component';
import { TournamentFormComponent } from './components/tournament-form/tournament-form.component';
import { TournamentDetailComponent } from './components/tournament-detail/tournament-detail.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'tournaments', component: TournamentListComponent },
  { path: 'tournament/new', component: TournamentFormComponent },
  { path: 'tournament/:id', component: TournamentDetailComponent },
  { path: 'privacy', component: PrivacyPolicyComponent },
  { path: '**', redirectTo: '' },
];

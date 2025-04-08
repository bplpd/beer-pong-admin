import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  animations: [
    trigger('fadeInUp', [
      state(
        'void',
        style({
          opacity: 0,
          transform: 'translateY(20px)',
        }),
      ),
      transition(':enter', [animate('0.6s ease-out')]),
    ]),
    trigger('slideInRight', [
      state(
        'void',
        style({
          opacity: 0,
          transform: 'translateX(-100px)',
        }),
      ),
      transition(':enter', [animate('0.8s ease-out')]),
    ]),
    trigger('bounce', [
      state(
        'normal',
        style({
          transform: 'scale(1)',
        }),
      ),
      state(
        'bouncing',
        style({
          transform: 'scale(1.1)',
        }),
      ),
      transition('normal <=> bouncing', [animate('0.3s ease-in-out')]),
    ]),
  ],
})
export class LandingPageComponent {
  features = [
    {
      icon: 'emoji_events',
      title: 'Turnierverwaltung',
      description:
        'Erstellen und verwalten Sie Bierpong-Turniere mit Leichtigkeit',
    },
    {
      icon: 'groups',
      title: 'Teamverwaltung',
      description:
        'Registriere Teams und verfolge ihren Fortschritt im gesamten Event',
    },
    {
      icon: 'scoreboard',
      title: 'Live Scoring',
      description: 'Echtzeit-Scoreverfolgung und Match-Updates',
    },
    // {
    //   icon: 'bar_chart',
    //   title: 'Statistiken',
    //   description: 'Detaillierte Statistiken und Turnierbrackets',
    // },
  ];

  rules = [
    {
      icon: 'sports_hockey',
      title: 'Grundlegendes Setup',
      description:
        'Jedes Team stellt 6-10 Becher in einer Dreiecksformation auf. Die Teams werfen abwechselnd Tischtennisbälle in die Becher des Gegners.',
    },
    {
      icon: 'gavel',
      title: 'Shooting Regeln',
      description:
        'Die Spieler müssen ihre Ellbogen beim Werfen hinter der Tischkante halten. Es sind sowohl Überhand- als auch Unterhandwürfe erlaubt.',
    },
    {
      icon: 'sports_score',
      title: 'Scoring',
      description:
        'Wenn ein Ball in einem Becher landet, wird dieser Becher aus dem Spiel entfernt. Die erste Mannschaft, die alle Becher des Gegners entfernt hat, gewinnt.',
    },
    {
      icon: 'add_circle',
      title: 'Je ein Becher wird getroffen',
      description:
        'Wenn beide Spieler einer Mannschaft jeweils einen Becher treffen, müssen beide Becher geleert und weggestellt werden. Jetzt heißt es „Bälle zurück“! Die Mannschaft bekommt die Bälle zurück und jeder Spieler darf noch einmal werfen.',
    },
    {
      icon: 'looks_3',
      title: 'Derselbe Becher wird getroffen',
      description:
        'Wenn beide Spieler in einer Runde DENSELBEN Becher treffen, muss die gegnerische Mannschaft 3 Becher leeren und wegstellen. Die anderen beiden Becher werden von der gegnerischen Mannschaft gewählt. Und nicht vergessen: Beide Spieler haben gepunktet, also Bälle zurück!',
    },
    {
      icon: 'sports_basketball',
      title: 'Rebound',
      description:
        'Abgeleitet vom Basketball, kannst du dir hier die Chance auf einen zweiten Wurfversuch verdienen. Wenn der Ball nach deinem Wurf über den Tisch zurück in deine Spielfeldhälfte rollt, kannst du ihn dir schnappen und erneut werfen. Allerdings darf der Ball vorher nicht den Boden berühren! Wichtig ist nur, dass der zweite Versuch ein „Trickwurf“ sein muss. Das heißt, du musst einen Trick in den Wurf einbauen. Lasst eurer Fantasie freien Lauf und begeistert die Fans (z. B. gegen eine Wand, hinter dem Rücken, zwischen den Beinen, rückwärts, usw.)',
    },
    {
      icon: 'air',
      title: 'Blowout',
      description:
        'Wenn der Gegner einen eurer Becher trifft, kann es sein, dass sich der Ball noch im Becher dreht. Solange dies der Fall ist, könnt ihr in den Becher pusten, um den Ball wieder herauszuholen und so zu verhindern, dass sich der Becher dreht. Aber Vorsicht! Wenn der Ball nur einmal das Bier im Becher berührt, ist er sofort verloren und kann nicht mehr gepustet werden.',
    },

    {
      icon: 'refresh',
      title: 'Re-racking',
      description:
        'Die Mannschaften können beantragen, ihre verbleibenden Becher einmal (bei 10 Becher zweimal) pro Spiel neu zu ordnen, wenn 4 oder weniger Becher übrig sind (bei 10: 6 oder weniger).',
    },
    {
      icon: 'sports_baseball',
      title: 'Bounce Shots',
      description: `Wenn ein Ball absichtlich auf dem Tisch aufspringt ("getischt") und anschließend in einem Becher landet, zählt dieser Treffer als zwei Becher. Die verteidigende Mannschaft darf jedoch versuchen, den Ball nach dem Aufprall auf dem Tisch und bevor er den Becher trifft, abzuwehren (z. B. durch Wegschlagen oder Fangen).`,
    },
    {
      icon: 'replay',
      title: 'Nachwurf',
      description: `Wenn ein Team seinen letzten Becher verliert und die Runde nicht begonnen hat, erhält es eine Chance auf Wiedergutmachung, indem es versucht, alle verbleibenden Becher in einem Zug zu treffen.`,
    },
  ];

  constructor(private router: Router) {}

  navigateToTournaments() {
    this.router.navigate(['/tournament/new']);
  }
}

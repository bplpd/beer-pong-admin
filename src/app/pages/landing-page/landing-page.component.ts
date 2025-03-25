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
      title: 'Tournament Management',
      description: 'Create and manage beer pong tournaments with ease',
    },
    {
      icon: 'groups',
      title: 'Team Organization',
      description:
        'Register teams and track their progress throughout the event',
    },
    {
      icon: 'scoreboard',
      title: 'Live Scoring',
      description: 'Real-time score tracking and match updates',
    },
    {
      icon: 'bar_chart',
      title: 'Statistics',
      description: 'View detailed statistics and tournament brackets',
    },
  ];

  rules = [
    {
      icon: 'sports_hockey',
      title: 'Basic Setup',
      description:
        "Each team arranges 6-10 cups in a triangle formation. Teams take turns throwing ping pong balls into the opponent's cups.",
    },
    {
      icon: 'gavel',
      title: 'Shooting Rules',
      description:
        'Players must keep their elbows behind the table edge when shooting. Both overhand and underhand throws are allowed.',
    },
    {
      icon: 'sports_score',
      title: 'Scoring',
      description:
        "When a ball lands in a cup, that cup is removed from the game. The first team to eliminate all of their opponent's cups wins.",
    },
    {
      icon: 'add_circle',
      title: 'Both players hit one cup each',
      description:
        'If both players of a team each hit a cup, both cups must be emptied and put away. Now it\' "balls back"! The team gets the balls back and each player can throw again.',
    },
    {
      icon: 'looks_3',
      title: 'Both players hit the same cup',
      description:
        "If both players hit the same cup in a round, the opposing team must empty 3 cups and put them away. The other two cups are chosen by the opposing team. And don't forget: Both players have scored, so balls back!",
    },
    {
      icon: 'sports_basketball',
      title: 'Rebound',
      description:
        'Derived from basketball, you can earn a chance for a second throw attempt here. If the ball rolls back over the table into your half of the court after your throw, you can grab it and throw it again. However, the ball must not touch the ground beforehand! The only important thing is that the second attempt must be a "trick shot". This means you have to incorporate a trick into the shot. Let your imagination run wild and wow the fans (e.g. against a wall, behind your back, between your legs, backwards, etc.)',
    },
    {
      icon: '',
      title: 'Blowout',
      description:
        'If the opponent hits one of your cups, it may still be spinning in the cup. As long as this is the case, you can blow into the cup to get the ball out again and thus prevent the cup from spinning. Caution: If the ball touches the beer in the cup just once, it is immediately lost and can no longer be blown.',
    },

    {
      icon: 'refresh',
      title: 'Re-racking',
      description:
        'Teams can request to re-arrange their remaining cups once (if 10 twice) per game when there are (if 10:  6,) 4, 3, or 2 cups left.',
    },
    {
      icon: 'sports_baseball',
      title: 'Bounce Shots',
      description:
        'If a ball bounces before going in a cup, it counts as two cups. However, bounce shots can be defended by the opposing team.',
    },
    {
      icon: 'replay',
      title: 'Redemption',
      description:
        'When a team loses their last cup and didnt start the round, they get a chance at redemption by trying to hit all remaining cups in one turn.',
    },
  ];

  constructor(private router: Router) {}

  navigateToTournaments() {
    this.router.navigate(['/tournament/new']);
  }
}

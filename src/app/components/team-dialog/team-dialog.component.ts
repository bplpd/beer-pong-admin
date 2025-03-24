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
  templateUrl: './team-dialog.component.html',
  styles: [
    `
      .full-width {
        width: 100%;
      }
      .player-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      .player-input {
        flex: 1;
      }
      .add-player-btn {
        margin-top: 8px;
      }
      h3 {
        margin: 16px 0 8px;
      }
      .dice-animation {
        animation: diceRoll 0.5s ease-in-out;
      }
      @keyframes diceRoll {
        0% {
          transform: translateY(0) rotate(0deg);
        }
        25% {
          transform: translateY(-6px) rotate(90deg);
        }
        50% {
          transform: translateY(-8px) rotate(180deg);
        }
        75% {
          transform: translateY(-6px) rotate(270deg);
        }
        100% {
          transform: translateY(0) rotate(360deg);
        }
      }
    `,
  ],
})
export class TeamDialogComponent {
  teamForm: FormGroup;
  isEditing = false;
  isAnimating = false;

  private adjectives = [
    'Mighty',
    'Royal',
    'Epic',
    'Golden',
    'Savage',
    'Elite',
    'Supreme',
    'Mystic',
    'Legendary',
    'Fierce',
    'Thunder',
    'Shadow',
    'Cosmic',
    'Neon',
    'Cyber',
    'Ancient',
    'Blazing',
    'Crystal',
    'Dark',
    'Electric',
    'Flaming',
    'Frozen',
    'Glowing',
    'Hidden',
    'Immortal',
    'Jade',
    'Lunar',
    'Mystic',
    'Noble',
    'Omega',
    'Phantom',
    'Quantum',
    'Radiant',
    'Silent',
    'Toxic',
    'Ultra',
    'Void',
    'Wild',
    'Xenon',
    'Zealous',
    'Astral',
    'Binary',
    'Chaos',
    'Divine',
    'Eternal',
    'Feral',
    'Ghost',
    'Havoc',
    'Infernal',
    'Jungle',
    'Kinetic',
    'Lightning',
    'Molten',
    'Nebula',
    'Obsidian',
    'Primal',
    'Raging',
    'Solar',
    'Tempest',
    'Unity',
    'Venom',
    'Warp',
    'Xenos',
    'Yonder',
    'Zenith',
    'Arctic',
    'Burning',
    'Crimson',
    'Demon',
    'Echo',
    'Frost',
    'Gravity',
    'Hex',
    'Ice',
    'Jade',
    'Killer',
    'Laser',
    'Matrix',
    'Nether',
    'Onyx',
    'Plasma',
    'Quasar',
    'Riot',
    'Storm',
    'Terror',
    'Umbra',
    'Viper',
    'Winter',
    'Xray',
    'Yellow',
    'Zero',
    'Alpha',
    'Beast',
    'Core',
    'Doom',
    'Edge',
    'Fire',
    'Glow',
    'Haze',
    'Iron',
  ];

  private drinkTypes = ['Beer', 'Water'];

  private teamTypes = [
    'Warriors',
    'Kings',
    'Legends',
    'Squad',
    'Titans',
    'Dragons',
    'Knights',
    'Ninjas',
    'Phoenixes',
    'Wizards',
    'Rebels',
    'Guardians',
    'Pirates',
    'Vikings',
    'Spartans',
    'Assassins',
    'Bandits',
    'Champions',
    'Demons',
    'Elementals',
    'Fighters',
    'Ghosts',
    'Heroes',
    'Immortals',
    'Juggernauts',
    'Keepers',
    'Lords',
    'Masters',
    'Necromancers',
    'Outlaws',
    'Paladins',
    'Raiders',
    'Sorcerers',
    'Templars',
    'Undead',
    'Valkyries',
    'Warlocks',
    'Xenomorphs',
    'Yetis',
    'Zealots',
    'Archers',
    'Berserkers',
    'Crusaders',
    'Duelists',
    'Executioners',
    'Fanatics',
    'Gladiators',
    'Hunters',
    'Infiltrators',
    'Jugglers',
    'Killers',
    'Lancers',
    'Marauders',
    'Ninjas',
    'Overlords',
    'Prowlers',
    'Questers',
    'Rangers',
    'Slayers',
    'Trackers',
    'Undertakers',
    'Vanguards',
    'Wardens',
    'Xenials',
    'Yogis',
    'Zephyrs',
    'Avengers',
    'Brawlers',
    'Commandos',
    'Defenders',
    'Elites',
    'Furies',
    'Generals',
    'Harbingers',
    'Inquisitors',
    'Jackals',
    'Knights',
    'Legionnaires',
    'Mercenaries',
    'Nomads',
    'Operatives',
    'Predators',
    'Quickshots',
    'Reapers',
    'Saboteurs',
    'Tacticians',
    'Ultras',
    'Veterans',
    'Wanderers',
    'Xenobytes',
    'Yeomen',
    'Zealots',
    'Arbiters',
    'Battlers',
    'Challengers',
    'Destroyers',
    'Enforcers',
    'Fighters',
    'Guardians',
    'Hunters',
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { team?: Team },
  ) {
    this.isEditing = !!data?.team;
    const name = data?.team?.name || this.generateRandomName();
    this.teamForm = this.fb.group({
      name: [name],
      players: this.fb.array(
        data?.team?.players || ['', ''],
        Validators.required,
      ),
    });
  }

  generateRandomName(): string {
    const adjective =
      this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const drinkType =
      this.drinkTypes[Math.floor(Math.random() * this.drinkTypes.length)];
    const teamType =
      this.teamTypes[Math.floor(Math.random() * this.teamTypes.length)];
    const name = `${adjective} ${drinkType} ${teamType}`;
    return name;
  }

  patchRandomName(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.teamForm.get('name')!.setValue(this.generateRandomName());
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
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

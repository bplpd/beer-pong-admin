import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { TournamentService } from '../tournament.service';
import { adjectives, animals } from './models/animals';
import { drinkTypes } from './models/drinkTypes';
import { playerAdjectives } from './models/playerAdjectives';
import { playerTypes } from './models/playerTypes';
import { teamAdjectives } from './models/teamAdjectives';
import { teamTypes } from './models/teamTypes';

@Injectable({
  providedIn: 'root',
})
export class UniqueNameService {
  private readonly animal_adjectives = adjectives;
  private readonly animals = animals;

  private readonly teamAdjectives = teamAdjectives;
  private readonly drinkTypes = drinkTypes;
  private readonly teamTypes = teamTypes;

  private readonly playerAdjectives = playerAdjectives;
  private readonly playerTypes = playerTypes;

  constructor(private readonly tournamentService: TournamentService) {}

  public async generateUniqueTournamentName(): Promise<string> {
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
      const a_l = this.animal_adjectives.length;
      const adjective = this.animal_adjectives[Math.floor(Math.random() * a_l)];
      const ad_l = this.animals.length;
      const animal = this.animals[Math.floor(Math.random() * ad_l)];
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

  public generateRandomTeamName(
    existingNames: Set<string> = new Set(),
  ): string {
    // Try to generate a unique name (max 100 attempts to prevent infinite loop)
    let attempts = 0;
    let name: string;

    do {
      let l = this.teamAdjectives.length;
      const random_adjective_id = Math.floor(Math.random() * l);
      l = this.drinkTypes.length;
      const random_drinkType_id = Math.floor(Math.random() * l);
      l = this.teamTypes.length;
      const random_teamType_id = Math.floor(Math.random() * l);

      const adjective = this.teamAdjectives[random_adjective_id];
      const drinkType = this.drinkTypes[random_drinkType_id];
      const teamType = this.teamTypes[random_teamType_id];
      name = `${adjective} ${drinkType} ${teamType}`;
      attempts++;

      // If we've tried all combinations, add a number to make it unique
      if (attempts >= 100) {
        name = `${name} ${Math.floor(Math.random() * 1000)}`;
        break;
      }
    } while (existingNames?.has(name.toLowerCase()));

    return name;
  }

  public generateRandomPlayerName(
    existingNames: Set<string> = new Set(),
  ): string {
    // Try to generate a unique name (max 100 attempts to prevent infinite loop)
    let attempts = 0;
    let name: string;

    do {
      let l = this.playerAdjectives.length;
      const random_adjective_id = Math.floor(Math.random() * l);
      l = this.playerTypes.length;
      const random_playerType_id = Math.floor(Math.random() * l);

      const adjective = this.playerAdjectives[random_adjective_id];
      const playerType = this.playerTypes[random_playerType_id];
      name = `${adjective} ${playerType}`;
      attempts++;

      // If we've tried all combinations, add a number to make it unique
      if (attempts >= 100) {
        name = `${name} ${Math.floor(Math.random() * 1000)}`;
        break;
      }
    } while (existingNames?.has(name.toLowerCase()));

    return name;
  }
}

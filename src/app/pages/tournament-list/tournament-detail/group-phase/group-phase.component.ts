import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Team } from '../../../../services/tournament.service';

@Component({
  selector: 'app-group-phase',
  imports: [MatTableModule, MatIconModule, MatTooltipModule],
  templateUrl: './group-phase.component.html',
  styleUrl: './group-phase.component.scss',
})
export class GroupPhaseComponent {
  groupedTeams = input.required<Team[][]>();
  removeTeam = output<Team>();
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Team, Tournament } from '../../../../services/tournament.service';

@Component({
  selector: 'app-group-phase',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule
  ],
  templateUrl: './group-phase.component.html',
  styleUrls: ['./group-phase.component.scss'],
})
export class GroupPhaseComponent {
  @Input({ required: true }) tournament!: Tournament;
  @Output() removeTeam = new EventEmitter<Team>();
}

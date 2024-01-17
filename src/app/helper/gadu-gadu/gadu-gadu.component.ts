import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-gadu-gadu',
  templateUrl: './gadu-gadu.component.html',
  styleUrls: ['./gadu-gadu.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class GaduGaduComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class SpinnerComponent implements OnInit {
  @Input() isReady: boolean = false
  constructor() {}

  ngOnInit() {}
}

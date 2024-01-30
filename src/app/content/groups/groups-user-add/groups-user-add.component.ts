import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { SpinnerComponent } from 'src/app/helper/spinner/spinner.component'

@Component({
  selector: 'app-groups-user-add',
  templateUrl: './groups-user-add.component.html',
  styleUrls: ['./groups-user-add.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    SpinnerComponent,
    RouterLink,
  ],
})
export class GroupsUserAddComponent implements OnInit {
  idGroup: number = 0
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params?.['idGroup'] > 0) {
        this.idGroup = parseInt(params?.['idGroup'])
      }
    })
  }

  cancel() {
    this.router.navigate(['/groups', this.idGroup])
  }
}

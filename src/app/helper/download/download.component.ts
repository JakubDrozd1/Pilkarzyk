import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { IonicModule } from '@ionic/angular'

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class DownloadComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    this.downloadFile()
  }

  downloadFile() {
    const fileUrl = 'assets/jaball.apk'
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = 'jaball.apk'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    this.router.navigate(['home'])
  }
}

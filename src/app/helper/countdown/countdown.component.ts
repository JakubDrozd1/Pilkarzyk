import { CommonModule } from '@angular/common'
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { Subscription, map, takeWhile, timer } from 'rxjs'

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Output() endTime: EventEmitter<boolean> = new EventEmitter()

  @Input() startDate!: Date
  @Input() endDate!: Date

  countdownText!: string
  private subscription: Subscription = new Subscription()

  ngOnInit() {
    this.startCountdown()
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  private startCountdown() {
    const endTime = this.endDate.getTime()
    this.subscription = timer(0, 1000)
      .pipe(
        map(() => this.calculateTimeDifference(endTime)),
        takeWhile((countdownText) => countdownText !== '00:00:00')
      )
      .subscribe((countdownText) => (this.countdownText = countdownText))
  }

  private calculateTimeDifference(endTime: number): string {
    const currentTime = new Date().getTime()
    const timeDifference = endTime - currentTime

    if (timeDifference <= 0) {
      this.endTime.emit(true)
      return '00:00:00'
    }

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
    const hours = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    )
    const minutes = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    )
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000)

    const formatNumber = (value: number): string =>
      value < 10 ? `0${value}` : `${value}`
    return `${formatNumber(days)}:${formatNumber(hours)}:${formatNumber(
      minutes
    )}:${formatNumber(seconds)}`
  }
}

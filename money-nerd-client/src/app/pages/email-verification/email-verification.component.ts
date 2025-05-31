import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmailVerificationService } from './email-verification.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [TranslateModule, FormsModule, NgFor],
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.scss',
})
export class EmailVerificationComponent implements AfterViewInit {
  email: string | null = null;
  codeDigits = new Array(6);
  code: string[] = new Array(6).fill('');

  codeExpireSeconds = 600;
  resendCooldownSeconds = 0;
  private intervalId: any;

  @ViewChildren('inputBox') inputs!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private emailVerificationService: EmailVerificationService
  ) {
    this.email = this.route.snapshot.paramMap.get('email');
    this.startCodeCountdown();
  }

  ngAfterViewInit() {
    this.focusNextEmpty();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  async emailVerify() {
    if (!this.email) {
      console.log('fail');
    }

    this.emailVerificationService
      .emailVerify(this.email, this.getCode())
      .subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (e) => {
          console.log(e);
        },
      });
  }

  resendCode() {
    if (this.resendCooldownSeconds > 0) return;

    console.log('Code resent to:', this.email);

    this.codeExpireSeconds = 600;
    this.resendCooldownSeconds = 60;
  }

  onInput(event: any, index: number) {
    const value = event.target.value;

    if (!/^\d$/.test(value)) {
      this.code[index] = '';
      event.target.value = '';
      return;
    }

    this.code[index] = value;

    const next = this.inputs.toArray()[index + 1];
    if (next) {
      next.nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      event.preventDefault();

      if (this.code[index]) {
        this.code[index] = '';
      } else if (index > 0) {
        const previous = this.inputs.toArray()[index - 1];
        this.code[index - 1] = '';
        previous.nativeElement.focus();
      }
    } else if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onBoxClick() {
    this.focusNextEmpty();
  }

  private focusNextEmpty() {
    console.log(this.getCode());
    const nextIndex = this.code.findIndex((c) => c === '');
    const targetIndex = nextIndex === -1 ? 5 : nextIndex;
    this.inputs.toArray()[targetIndex].nativeElement.focus();
  }

  getCode(): string {
    return this.code.join('');
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
  }

  private startCodeCountdown() {
    this.intervalId = setInterval(() => {
      if (this.codeExpireSeconds > 0) this.codeExpireSeconds--;
      if (this.resendCooldownSeconds > 0) this.resendCooldownSeconds--;
    }, 1000);
  }

  get codeExpireTime(): string {
    const min = Math.floor(this.codeExpireSeconds / 60)
      .toString()
      .padStart(2, '0');
    const sec = (this.codeExpireSeconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }
}

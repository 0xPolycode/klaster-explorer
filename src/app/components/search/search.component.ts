// components/search/search.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-search',
  template: `
    <div
      class="min-h-screen bg-gradient-to-b bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-2xl w-full space-y-8">
        <div class="text-center">
          <h2
            class="mt-6 text-4xl flex flex-row justify-center font-extrabold text-gray-900 tracking-tight"
          >
            <img
              class="h-10"
              src="https://content.pstmn.io/9af7177c-4ec7-40e4-855b-214ea62aaf5f/a2xhc3Rlcl9ib2plLnBuZw=="
            />
          </h2>
        </div>
        <form class="mt-8 space-y-6" (ngSubmit)="searchHash()">
          <div class="rounded-full border border-slate-200 -space-y-px">
            <div>
              <label for="hash" class="sr-only">Transaction Hash</label>
              <input
                id="hash"
                name="hash"
                type="text"
                required
                [(ngModel)]="hash"
                class="appearance-none text-center
                 relative block w-full px-8 py-4 !outline-none placeholder:
                  border-slate-100 placeholder-gray-500 text-gray-900 rounded-full focus:z-10 sm:text-sm"
                placeholder="Paste interchain transaction hash"
                (input)="onInput()"
                [@inputHighlight]="inputState"
              />
            </div>
          </div>

          <div class="w-full flex flex-row justify-center">
            <button
              type="submit"
              class="group relative cursor-pointer w-1/2 flex justify-center gap-x-3
               py-3 px-4 border border-transparent text-sm font-normal
                rounded-md text-slate-800 bg-slate-100 hover:bg-slate-200
                 focus:outline-none focus:ring-2 focus:ring-offset-2
                  focus:ring-indigo-500 transition duration-150 ease-in-out"
              [disabled]="!isValidHash()"
            >
                <svg
                  class="h-5 w-5 -ml-3  transition ease-in-out duration-150"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clip-rule="evenodd"
                  />
                </svg>
              <div class="">
                Search
              </div>
              
            </button>
          </div>
        </form>
        <div
          *ngIf="showError"
          class="text-red-500 text-sm mt-2 text-center"
          [@fadeInOut]
        >
          Please enter a valid transaction hash.
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* You can add any additional component-specific styles here */
    `,
  ],
  animations: [
    trigger('inputHdighlight', [
      transition('inactive => active', [
        style({ transform: 'scale(1)' }),
        animate('100ms ease-out', style({ transform: 'scale(1.01)' })),
        animate('100ms ease-in', style({ transform: 'scale(1)' })),
      ]),
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class SearchComponent {
  hash: string = '';
  nodeUrl: string = '';
  showError: boolean = false;
  inputState: string = 'inactive';

  constructor(private router: Router) {}

  searchHash() {
    if (this.isValidHash()) {
      if (this.nodeUrl.length > 0) {
        this.router.navigate(['/details', this.hash], {
          queryParams: {
            nodeUrl: this.nodeUrl,
          },
        });
      }
      this.router.navigate(['/details', this.hash]);
    } else {
      this.showError = true;
      setTimeout(() => (this.showError = false), 3000); // Hide error after 3 seconds
    }
  }

  isValidHash(): boolean {
    // This is a basic check. You might want to implement a more robust validation.
    return this.hash.length === 66 && this.hash.startsWith('0x');
  }

  onInput() {
    this.inputState = 'active';
    setTimeout(() => (this.inputState = 'inactive'), 200);
  }
}

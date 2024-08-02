// components/details/details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { HashService } from '../../services/hash.service';
import { ChainInfoService } from '../../services/chain-info.service';
import { EMPTY, forkJoin, timer } from 'rxjs';
import { delay, expand, filter, map, repeat, skipWhile, switchMap, take, takeLast } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

interface PaymentInfo {
  chainId: string;
  masterWallet: string;
  salt: string;
  token: string;
  tokenAmount: string;
  tokenValue: string;
}

interface UserOpDetails {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
}

interface UserOp {
  userOp: UserOpDetails;
  userOpHash: string;
  lowerBoundTimestamp: string;
  upperBoundTimestamp: string;
  maxGasLimit: string;
  chainId: string;
  executionStatus: string;
  executionData: string;
}

interface HashDetails {
  itxHash: string;
  node: string;
  commitment: string;
  paymentInfo: PaymentInfo;
  userOps: UserOp[];
}

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
  animations: [
    trigger('expandCollapse', [
      state(
        'collapsed',
        style({
          height: '0',
          overflow: 'hidden',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
        })
      ),
      transition('collapsed <=> expanded', [animate('150ms ease-in-out')]),
    ]),
    trigger('rotate', [
      state('collapsed', style({ transform: 'rotate(0)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition('collapsed <=> expanded', [animate('150ms ease-in-out')]),
    ]),
  ],
})
export class DetailsComponent implements OnInit {
  details: HashDetails | null = null;
  expandedUserOps: boolean[] = [];
  chainNames: { [key: string]: string } = {};
  tokenNames: { [key: string]: string } = {};
  isPaymentInfoExpanded: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private hashService: HashService,
    private chainInfoService: ChainInfoService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const hash: string = params['hash'];
      this.hashService.getHashDetails(hash).pipe(
        expand(res => {
          const retry = res.userOps.map(x => x.executionStatus).includes('PENDING') 
          if(retry) {
            return timer(2000).pipe(
              switchMap(x => this.hashService.getHashDetails(hash))
            )
          }return EMPTY
        }),
      ).subscribe(
        (data: HashDetails) => {
          this.details = data;
          this.expandedUserOps = new Array(data.userOps.length).fill(false);
          this.loadChainAndTokenNames(data);
        },
        (error: any) => alert(`Error fetching! Check node URL. ${error.message}`)
      );
    });
  }

  togglePaymentInfo() {
    this.isPaymentInfoExpanded = !this.isPaymentInfoExpanded;
  }

  getExpandState(index: number): string {
    return this.expandedUserOps[index] ? 'expanded' : 'collapsed';
  }

  loadChainAndTokenNames(data: HashDetails) {
    const chainIds = new Set<string>();
    const tokenAddresses = new Set<string>();

    // Collect all unique chainIds and tokenAddresses
    chainIds.add(data.paymentInfo.chainId);
    tokenAddresses.add(data.paymentInfo.token);
    data.userOps.forEach((op) => {
      chainIds.add(op.chainId);
    });

    // Create observables for all chain and token name resolutions
    const chainObservables = Array.from(chainIds).map((id) =>
      this.chainInfoService.getChainName(id).pipe(map((name) => ({ id, name })))
    );

    const tokenObservables = Array.from(tokenAddresses).map((address) =>
      this.chainInfoService
        .getTokenName(data.paymentInfo.chainId, address)
        .pipe(map((name) => ({ address, name })))
    );

    // Combine all observables
    forkJoin([...chainObservables, ...tokenObservables]).subscribe(
      (results) => {
        results.forEach((result) => {
          if ('id' in result) {
            this.chainNames[result.id] = result.name;
          } else {
            this.tokenNames[result.address] = result.name;
          }
        });
      }
    );
  }

  getChainName(chainId: string): string {
    return this.chainNames[chainId] || 'Unknown Chain';
  }

  getTokenName(address: string): string {
    return this.tokenNames[address] || 'Unknown Token';
  }

  getPaymentInfoItems(): { key: string; value: string }[] {
    if (!this.details) return [];
    return Object.entries(this.details.paymentInfo).map(([key, value]) => ({
      key: this.formatKey(key),
      value: String(value),
    }));
  }

  getUserOpItems(userOp: UserOp): { key: string; value: string }[] {
    return Object.entries(userOp).flatMap(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return Object.entries(value).map(([subKey, subValue]) => ({
          key: this.formatKey(`${key} ${subKey}`),
          value: String(subValue),
        }));
      } else {
        return [
          {
            key: this.formatKey(key),
            value: String(value),
          },
        ];
      }
    });
  }

  formatKey(key: string): string {
    return key.replace('userOp', '')
  }

  toggleUserOp(index: number) {
    this.expandedUserOps[index] = !this.expandedUserOps[index];
  }

  getIcon(key: string): SafeHtml {
    const icons: { [key: string]: string } = {
      node: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>`,
      commitment: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
      chainid: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`,
      masterwallet: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>`,
      token: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
      tokenamount: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>`,
      tokenvalue: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
      salt: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>`,
      back: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>`,
    };

    // Remove spaces and convert to lowercase for matching
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
    return this.sanitizer.bypassSecurityTrustHtml(
      icons[normalizedKey] || icons['info']
    );
  }

  getStatusIcon(status: string) {
    const icons: { [key: string]: string } = {
      SUCCESS: `<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
      FAILURE: `<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
      PENDING: `<svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    };
    return this.sanitizer.bypassSecurityTrustHtml(
      icons[status.toUpperCase()] || icons['PENDING']
    );
  }

  goBack() {
    window.history.back();
  }
}

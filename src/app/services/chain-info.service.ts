// src/app/services/chain-info.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

interface ChainInfo {
  chainId: string;
  name: string;
}

interface TokenInfo {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
}

interface ChainTokenInfo {
  chainId: string;
  paymentTokens: TokenInfo[];
}

interface ApiResponse {
  version: string;
  node: string;
  supported_chains: ChainInfo[];
  supported_gas_tokens: ChainTokenInfo[];
}

@Injectable({
  providedIn: 'root'
})
export class ChainInfoService {
  private apiUrl = 'https://klaster-node.polycode.sh/info';
  private dataCache$: Observable<ApiResponse>;

  constructor(private http: HttpClient) {
    this.dataCache$ = this.http.get<ApiResponse>(this.apiUrl).pipe(
      shareReplay(1)
    );
  }

  getChainName(chainId: string): Observable<string> {
    return this.dataCache$.pipe(
      map(data => {
        const chain = data.supported_chains.find(c => c.chainId === chainId);
        return chain ? chain.name : 'Unknown Chain';
      })
    );
  }

  getTokenName(chainId: string, tokenAddress: string): Observable<string> {
    return this.dataCache$.pipe(
      map(data => {
        const chainTokens = data.supported_gas_tokens.find(c => c.chainId === chainId);
        if (chainTokens) {
          const token = chainTokens.paymentTokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
          return token ? token.name : 'Unknown Token';
        }
        return 'Unknown Token';
      })
    );
  }
}
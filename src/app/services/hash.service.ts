// src/app/services/hash.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class HashService {
  private apiUrl = 'https://klaster-node.polycode.sh/v2/explorer';

  constructor(private http: HttpClient) {}

  getHashDetails(hash: string): Observable<HashDetails> {
    return this.http.get<HashDetails>(`${this.apiUrl}/${hash}`);
  }
}
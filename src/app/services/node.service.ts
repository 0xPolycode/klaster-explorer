import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NodeUrlService {
  private readonly NODE_URL_KEY = 'nodeUrl';
  private readonly DEFAULT_URL = 'https://klaster-node.polycode.sh/v2/explorer';

  constructor() { }

  setNodeUrl(nodeUrl: string): void {
    localStorage.setItem(this.NODE_URL_KEY, nodeUrl);
  }

  getNodeUrl(): string {
    const storedUrl = localStorage.getItem(this.NODE_URL_KEY);
    return storedUrl ?? this.DEFAULT_URL;
  }
}
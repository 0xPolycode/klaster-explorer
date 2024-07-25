import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NodeUrlService } from '../services/node.service';

@Component({
  selector: 'app-set-node-url',
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4" (click)="close()">
      <div class="bg-white rounded-lg max-w-lg w-full p-12 space-y-6" (click)="$event.stopPropagation()">
        <h2 class="text-2xl font-light text-gray-800">Set Node URL</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <input type="text" id="nodeUrl" formControlName="nodeUrl" 
                   class="w-full px-4 py-3 border-b border-gray-300 focus:border-blue-500 transition-colors duration-300 outline-none text-gray-700"
                   placeholder="Enter Node URL">
          </div>
          <div class="flex justify-end space-x-4">
            <button type="button" (click)="close()" 
                    class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-300">
              Cancel
            </button>
            <button type="submit" [disabled]="form.invalid" 
                    class="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class SetNodeUrlComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private nodeUrlService: NodeUrlService
  ) {
    this.form = this.fb.group({
      nodeUrl: ['', [Validators.required, Validators.pattern('https?://.*')]]
    });
  }

  ngOnInit(): void {
    const currentUrl = this.nodeUrlService.getNodeUrl();
    this.form.patchValue({ nodeUrl: currentUrl });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const newUrl = this.form.get('nodeUrl')?.value;
      this.nodeUrlService.setNodeUrl(newUrl);
      alert(`New nodeUrl set to: ${newUrl}`)
      this.close();
    }
  }

  close(): void {

    location.reload()
  }
}
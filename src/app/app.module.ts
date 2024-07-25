// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { HashService } from './services/hash.service';
import { ChainInfoService } from './services/chain-info.service';
import { SearchComponent } from './components/search/search.component';
import { DetailsComponent } from './components/details/details.component';
import { SetNodeUrlComponent } from './set-node-url/set-node-url.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    DetailsComponent,
    SetNodeUrlComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', component: SearchComponent },
      { path: 'details/:hash', component: DetailsComponent }
    ]),
    BrowserAnimationsModule
  ],
  providers: [HashService, ChainInfoService],
  bootstrap: [AppComponent]
})
export class AppModule { }
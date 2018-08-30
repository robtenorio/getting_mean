import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AboutComponent } from './components/about/about.component'
import { DistancePipe } from './pipes/distance.pipe';
import { FrameworkComponent } from './components/framework/framework.component';
import { HomeListComponent } from './components/home-list/home-list.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HtmlLineBreaksPipe } from './pipes/html-line-breaks.pipe';
import { RatingStarsComponent } from './components/rating-stars/rating-stars.component';
import { LocationDetailsComponent } from './components/location-details/location-details.component';
import { DetailsPageComponent } from './components/details-page/details-page.component';

@NgModule({
  declarations: [
    HomeListComponent,
    DistancePipe,
    FrameworkComponent,
    AboutComponent,
    HomepageComponent,
    PageHeaderComponent,
    SidebarComponent,
    HtmlLineBreaksPipe,
    RatingStarsComponent,
    LocationDetailsComponent,
    DetailsPageComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      {
        path: "",
        component: HomepageComponent
      },
      {
        path: "about",
        component: AboutComponent
      },
      {
        path: "location/:locationid",
        component: DetailsPageComponent
      }
    ])
  ],
  providers: [],
  bootstrap: [FrameworkComponent]
})

export class AppModule { }

import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { routes } from './app/app.routes';
import { JwtModule } from '@auth0/angular-jwt';
import { AppConfig } from './app/service/app-config';

export function tokenGetter() {
  return localStorage.getItem('access_token')
}

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load()
}

bootstrapApplication(AppComponent, {
  providers: [
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig],
      multi: true
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    importProvidersFrom(IonicModule.forRoot({})),
    importProvidersFrom(JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter
      }
    })),
    importProvidersFrom(HttpClientModule),
    provideRouter(routes)]
}).catch(err => console.error(err));

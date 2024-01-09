import { APP_INITIALIZER, importProvidersFrom } from '@angular/core'
import { AppComponent } from './app/app.component'
import { IonicModule, IonicRouteStrategy } from '@ionic/angular'
import { bootstrapApplication } from '@angular/platform-browser'
import { RouteReuseStrategy, provideRouter } from '@angular/router'
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http'
import { routes } from './app/app.routes'
import { JwtModule } from '@auth0/angular-jwt'
import { AppConfig } from './app/service/app-config'
import { TokenInterceptor } from './app/helper/TokenInterceptor'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'

export function tokenGetter() {
  return localStorage.getItem('access_token')
}

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load()
}
export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http)
}

bootstrapApplication(AppComponent, {
  providers: [
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    importProvidersFrom(IonicModule.forRoot({})),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
        },
      })
    ),
    importProvidersFrom(HttpClientModule),
    provideRouter(routes),
  ],
}).catch((err) => console.error(err))

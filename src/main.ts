import { importProvidersFrom } from '@angular/core'
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
import { TokenInterceptor } from './app/helper/TokenInterceptor'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { BASE_PATH } from 'libs/api-client'
import { environment } from './environments/environment'

export function tokenGetter() {
  return localStorage.getItem('access_token')
}

export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http)
}

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: BASE_PATH,
      useValue:
        environment.apiEndpoint.slice(-1) === '/'
          ? environment.apiEndpoint.slice(0, -1)
          : environment.apiEndpoint,
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
    provideAnimationsAsync(),
  ],
}).catch((err) => console.error(err))

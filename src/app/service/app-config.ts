import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { catchError, firstValueFrom, of } from "rxjs"

export interface IAppConfig {
    apiEndpoint: string,
    clientSecretPublic: string,
    clientId: string,
}

@Injectable()
export class AppConfig {

    static settings: IAppConfig

    constructor(private http: HttpClient) { }

    async load(): Promise<void> {
        const jsonFile = 'assets/config/config.json'

        try {
            const response = await firstValueFrom(this.http.get<IAppConfig>(jsonFile).pipe(
                catchError(() => of(null)),
            ))

            if (response) {
                const { apiEndpoint, clientSecretPublic, clientId } = response
                AppConfig.settings = {
                    apiEndpoint: this.addSlashToUrl(apiEndpoint),
                    clientSecretPublic,
                    clientId,
                }
            } else {
                AppConfig.settings = {
                    apiEndpoint: this.addSlashToUrl(''),
                    clientSecretPublic: '',
                    clientId: '',
                }
            }

        } catch (error) {
            console.error('Wystąpił błąd podczas ładowania konfiguracji:', error)
        }
    }

    addSlashToUrl(url: string) {
        if (url.slice(-1) != '/') {
            return url + '/'
        }
        return url
    }
}

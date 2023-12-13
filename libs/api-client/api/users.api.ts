/**
 * api.pilkarzyk
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent, HttpParameterCodec, HttpContext 
        }       from '@angular/common/http';
import { CustomHttpParameterCodec }                          from '../encoder';
import { Observable }                                        from 'rxjs';

// @ts-ignore
import { GetEmailSenderRequest } from '../model/get-email-sender-request';
// @ts-ignore
import { GetUserRequest } from '../model/get-user-request';
// @ts-ignore
import { USERS } from '../model/users';

// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';


export interface AddUserRequestParams {
    getUserRequest?: GetUserRequest;
}

export interface DeleteUserRequestParams {
    userId: number;
}

export interface GetAllUsersRequestParams {
    page: number;
    onPage: number;
    sortColumn?: string;
    sortMode?: string;
}

export interface GetAllUsersWithoutGroupAsyncRequestParams {
    page: number;
    onPage: number;
    sortColumn?: string;
    sortMode?: string;
    idGroup?: number;
}

export interface GetUserByIdRequestParams {
    userId: number;
}

export interface GetUserByLoginAndPasswordRequestParams {
    login: string;
    password: string;
}

export interface SendInvitationEmailRequestParams {
    getEmailSenderRequest?: GetEmailSenderRequest;
}

export interface UpdateUserRequestParams {
    userId: number;
    getUserRequest?: GetUserRequest;
}


@Injectable({
  providedIn: 'root'
})
export class UsersApi {

    protected basePath = 'http://localhost:27884';
    public defaultHeaders = new HttpHeaders();
    public configuration = new Configuration();
    public encoder: HttpParameterCodec;

    constructor(protected httpClient: HttpClient, @Optional()@Inject(BASE_PATH) basePath: string|string[], @Optional() configuration: Configuration) {
        if (configuration) {
            this.configuration = configuration;
        }
        if (typeof this.configuration.basePath !== 'string') {
            if (Array.isArray(basePath) && basePath.length > 0) {
                basePath = basePath[0];
            }

            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
    }


    // @ts-ignore
    private addToHttpParams(httpParams: HttpParams, value: any, key?: string): HttpParams {
        if (typeof value === "object" && value instanceof Date === false) {
            httpParams = this.addToHttpParamsRecursive(httpParams, value);
        } else {
            httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return httpParams;
    }

    private addToHttpParamsRecursive(httpParams: HttpParams, value?: any, key?: string): HttpParams {
        if (value == null) {
            return httpParams;
        }

        if (typeof value === "object") {
            if (Array.isArray(value)) {
                (value as any[]).forEach( elem => httpParams = this.addToHttpParamsRecursive(httpParams, elem, key));
            } else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(key, (value as Date).toISOString().substring(0, 10));
                } else {
                   throw Error("key may not be null if value is Date");
                }
            } else {
                Object.keys(value).forEach( k => httpParams = this.addToHttpParamsRecursive(
                    httpParams, value[k], key != null ? `${key}.${k}` : k));
            }
        } else if (key != null) {
            httpParams = httpParams.append(key, value);
        } else {
            throw Error("key may not be null if value is not object or array");
        }
        return httpParams;
    }

    /**
     * @param requestParameters
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public addUser(requestParameters: AddUserRequestParams, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<any>;
    public addUser(requestParameters: AddUserRequestParams, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<HttpResponse<any>>;
    public addUser(requestParameters: AddUserRequestParams, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<HttpEvent<any>>;
    public addUser(requestParameters: AddUserRequestParams, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<any> {
        const getUserRequest = requestParameters.getUserRequest;

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (api-pilkarzyk-oauth2) required
        localVarCredential = this.configuration.lookupCredential('api-pilkarzyk-oauth2');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'text/json',
            'application/*+json'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/users`;
        return this.httpClient.request<any>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: getUserRequest,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param requestParameters
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public deleteUser(requestParameters: DeleteUserRequestParams, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<any>;
    public deleteUser(requestParameters: DeleteUserRequestParams, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<HttpResponse<any>>;
    public deleteUser(requestParameters: DeleteUserRequestParams, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<HttpEvent<any>>;
    public deleteUser(requestParameters: DeleteUserRequestParams, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<any> {
        const userId = requestParameters.userId;
        if (userId === null || userId === undefined) {
            throw new Error('Required parameter userId was null or undefined when calling deleteUser.');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (api-pilkarzyk-oauth2) required
        localVarCredential = this.configuration.lookupCredential('api-pilkarzyk-oauth2');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/users/${this.configuration.encodeParam({name: "userId", value: userId, in: "path", style: "simple", explode: false, dataType: "number", dataFormat: "int32"})}`;
        return this.httpClient.request<any>('delete', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param requestParameters
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getAllUsers(requestParameters: GetAllUsersRequestParams, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<Array<USERS>>;
    public getAllUsers(requestParameters: GetAllUsersRequestParams, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<HttpResponse<Array<USERS>>>;
    public getAllUsers(requestParameters: GetAllUsersRequestParams, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<HttpEvent<Array<USERS>>>;
    public getAllUsers(requestParameters: GetAllUsersRequestParams, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<any> {
        const page = requestParameters.page;
        if (page === null || page === undefined) {
            throw new Error('Required parameter page was null or undefined when calling getAllUsers.');
        }
        const onPage = requestParameters.onPage;
        if (onPage === null || onPage === undefined) {
            throw new Error('Required parameter onPage was null or undefined when calling getAllUsers.');
        }
        const sortColumn = requestParameters.sortColumn;
        const sortMode = requestParameters.sortMode;

        let localVarQueryParameters = new HttpParams({encoder: this.encoder});
        if (page !== undefined && page !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>page, 'Page');
        }
        if (onPage !== undefined && onPage !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>onPage, 'OnPage');
        }
        if (sortColumn !== undefined && sortColumn !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>sortColumn, 'SortColumn');
        }
        if (sortMode !== undefined && sortMode !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>sortMode, 'SortMode');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (api-pilkarzyk-oauth2) required
        localVarCredential = this.configuration.lookupCredential('api-pilkarzyk-oauth2');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'text/plain',
                'application/json',
                'text/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/users`;
        return this.httpClient.request<Array<USERS>>('get', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                params: localVarQueryParameters,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param requestParameters
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getAllUsersWithoutGroupAsync(requestParameters: GetAllUsersWithoutGroupAsyncRequestParams, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<Array<USERS>>;
    public getAllUsersWithoutGroupAsync(requestParameters: GetAllUsersWithoutGroupAsyncRequestParams, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<HttpResponse<Array<USERS>>>;
    public getAllUsersWithoutGroupAsync(requestParameters: GetAllUsersWithoutGroupAsyncRequestParams, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<HttpEvent<Array<USERS>>>;
    public getAllUsersWithoutGroupAsync(requestParameters: GetAllUsersWithoutGroupAsyncRequestParams, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<any> {
        const page = requestParameters.page;
        if (page === null || page === undefined) {
            throw new Error('Required parameter page was null or undefined when calling getAllUsersWithoutGroupAsync.');
        }
        const onPage = requestParameters.onPage;
        if (onPage === null || onPage === undefined) {
            throw new Error('Required parameter onPage was null or undefined when calling getAllUsersWithoutGroupAsync.');
        }
        const sortColumn = requestParameters.sortColumn;
        const sortMode = requestParameters.sortMode;
        const idGroup = requestParameters.idGroup;

        let localVarQueryParameters = new HttpParams({encoder: this.encoder});
        if (page !== undefined && page !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>page, 'Page');
        }
        if (onPage !== undefined && onPage !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>onPage, 'OnPage');
        }
        if (sortColumn !== undefined && sortColumn !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>sortColumn, 'SortColumn');
        }
        if (sortMode !== undefined && sortMode !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>sortMode, 'SortMode');
        }
        if (idGroup !== undefined && idGroup !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>idGroup, 'IdGroup');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (api-pilkarzyk-oauth2) required
        localVarCredential = this.configuration.lookupCredential('api-pilkarzyk-oauth2');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'text/plain',
                'application/json',
                'text/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/users/withoutGroup`;
        return this.httpClient.request<Array<USERS>>('get', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                params: localVarQueryParameters,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param requestParameters
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getUserById(requestParameters: GetUserByIdRequestParams, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<USERS>;
    public getUserById(requestParameters: GetUserByIdRequestParams, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<HttpResponse<USERS>>;
    public getUserById(requestParameters: GetUserByIdRequestParams, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<HttpEvent<USERS>>;
    public getUserById(requestParameters: GetUserByIdRequestParams, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<any> {
        const userId = requestParameters.userId;
        if (userId === null || userId === undefined) {
            throw new Error('Required parameter userId was null or undefined when calling getUserById.');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (api-pilkarzyk-oauth2) required
        localVarCredential = this.configuration.lookupCredential('api-pilkarzyk-oauth2');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'text/plain',
                'application/json',
                'text/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/users/${this.configuration.encodeParam({name: "userId", value: userId, in: "path", style: "simple", explode: false, dataType: "number", dataFormat: "int32"})}`;
        return this.httpClient.request<USERS>('get', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param requestParameters
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getUserByLoginAndPassword(requestParameters: GetUserByLoginAndPasswordRequestParams, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<USERS>;
    public getUserByLoginAndPassword(requestParameters: GetUserByLoginAndPasswordRequestParams, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<HttpResponse<USERS>>;
    public getUserByLoginAndPassword(requestParameters: GetUserByLoginAndPasswordRequestParams, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<HttpEvent<USERS>>;
    public getUserByLoginAndPassword(requestParameters: GetUserByLoginAndPasswordRequestParams, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json', context?: HttpContext}): Observable<any> {
        const login = requestParameters.login;
        if (login === null || login === undefined) {
            throw new Error('Required parameter login was null or undefined when calling getUserByLoginAndPassword.');
        }
        const password = requestParameters.password;
        if (password === null || password === undefined) {
            throw new Error('Required parameter password was null or undefined when calling getUserByLoginAndPassword.');
        }

        let localVarQueryParameters = new HttpParams({encoder: this.encoder});
        if (login !== undefined && login !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>login, 'Login');
        }
        if (password !== undefined && password !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>password, 'Password');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (api-pilkarzyk-oauth2) required
        localVarCredential = this.configuration.lookupCredential('api-pilkarzyk-oauth2');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'text/plain',
                'application/json',
                'text/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/users/login`;
        return this.httpClient.request<USERS>('get', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                params: localVarQueryParameters,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param requestParameters
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public sendInvitationEmail(requestParameters: SendInvitationEmailRequestParams, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<any>;
    public sendInvitationEmail(requestParameters: SendInvitationEmailRequestParams, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<HttpResponse<any>>;
    public sendInvitationEmail(requestParameters: SendInvitationEmailRequestParams, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<HttpEvent<any>>;
    public sendInvitationEmail(requestParameters: SendInvitationEmailRequestParams, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<any> {
        const getEmailSenderRequest = requestParameters.getEmailSenderRequest;

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (api-pilkarzyk-oauth2) required
        localVarCredential = this.configuration.lookupCredential('api-pilkarzyk-oauth2');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'text/json',
            'application/*+json'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/users/sendInvitationEmail`;
        return this.httpClient.request<any>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: getEmailSenderRequest,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param requestParameters
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public updateUser(requestParameters: UpdateUserRequestParams, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<any>;
    public updateUser(requestParameters: UpdateUserRequestParams, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<HttpResponse<any>>;
    public updateUser(requestParameters: UpdateUserRequestParams, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<HttpEvent<any>>;
    public updateUser(requestParameters: UpdateUserRequestParams, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<any> {
        const userId = requestParameters.userId;
        if (userId === null || userId === undefined) {
            throw new Error('Required parameter userId was null or undefined when calling updateUser.');
        }
        const getUserRequest = requestParameters.getUserRequest;

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (api-pilkarzyk-oauth2) required
        localVarCredential = this.configuration.lookupCredential('api-pilkarzyk-oauth2');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
            'text/json',
            'application/*+json'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/api/users/${this.configuration.encodeParam({name: "userId", value: userId, in: "path", style: "simple", explode: false, dataType: "number", dataFormat: "int32"})}`;
        return this.httpClient.request<any>('put', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: getUserRequest,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}

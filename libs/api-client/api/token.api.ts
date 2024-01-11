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
import { GetTokenRequest } from '../model/get-token-request';
// @ts-ignore
import { GetTokenResponse } from '../model/get-token-response';
// @ts-ignore
import { ProblemDetails } from '../model/problem-details';

// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';


export interface GenerateJwtTokenAsyncRequestParams {
    getTokenRequest?: GetTokenRequest;
}

export interface GenerateTokenRequestParams {
    grantType?: string;
    username?: string;
    password?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    scope?: string;
}


@Injectable({
  providedIn: 'root',
})
export class TokenApi {
  protected basePath = 'https://jaball.manowski.pl:8001';
  public defaultHeaders = new HttpHeaders();
  public configuration = new Configuration();
  public encoder: HttpParameterCodec;

  constructor(
    protected httpClient: HttpClient,
    @Optional() @Inject(BASE_PATH) basePath: string | string[],
    @Optional() configuration: Configuration
  ) {
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

  /**
   * @param consumes string[] mime-types
   * @return true: consumes contains 'multipart/form-data', false: otherwise
   */
  private canConsumeForm(consumes: string[]): boolean {
    const form = 'multipart/form-data';
    for (const consume of consumes) {
      if (form === consume) {
        return true;
      }
    }
    return false;
  }

  // @ts-ignore
  private addToHttpParams(
    httpParams: HttpParams,
    value: any,
    key?: string
  ): HttpParams {
    if (typeof value === 'object' && value instanceof Date === false) {
      httpParams = this.addToHttpParamsRecursive(httpParams, value);
    } else {
      httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
    }
    return httpParams;
  }

  private addToHttpParamsRecursive(
    httpParams: HttpParams,
    value?: any,
    key?: string
  ): HttpParams {
    if (value == null) {
      return httpParams;
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        (value as any[]).forEach(
          (elem) =>
            (httpParams = this.addToHttpParamsRecursive(httpParams, elem, key))
        );
      } else if (value instanceof Date) {
        if (key != null) {
          httpParams = httpParams.append(
            key,
            (value as Date).toISOString().substring(0, 10)
          );
        } else {
          throw Error('key may not be null if value is Date');
        }
      } else {
        Object.keys(value).forEach(
          (k) =>
            (httpParams = this.addToHttpParamsRecursive(
              httpParams,
              value[k],
              key != null ? `${key}.${k}` : k
            ))
        );
      }
    } else if (key != null) {
      httpParams = httpParams.append(key, value);
    } else {
      throw Error('key may not be null if value is not object or array');
    }
    return httpParams;
  }

  /**
   * @param requestParameters
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public generateJwtTokenAsync(
    requestParameters: GenerateJwtTokenAsyncRequestParams,
    observe?: 'body',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: undefined; context?: HttpContext }
  ): Observable<any>;
  public generateJwtTokenAsync(
    requestParameters: GenerateJwtTokenAsyncRequestParams,
    observe?: 'response',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: undefined; context?: HttpContext }
  ): Observable<HttpResponse<any>>;
  public generateJwtTokenAsync(
    requestParameters: GenerateJwtTokenAsyncRequestParams,
    observe?: 'events',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: undefined; context?: HttpContext }
  ): Observable<HttpEvent<any>>;
  public generateJwtTokenAsync(
    requestParameters: GenerateJwtTokenAsyncRequestParams,
    observe: any = 'body',
    reportProgress: boolean = false,
    options?: { httpHeaderAccept?: undefined; context?: HttpContext }
  ): Observable<any> {
    const getTokenRequest = requestParameters.getTokenRequest;

    let localVarHeaders = this.defaultHeaders;

    let localVarCredential: string | undefined;
    // authentication (api-pilkarzyk-oauth2) required
    localVarCredential = this.configuration.lookupCredential(
      'api-pilkarzyk-oauth2'
    );
    if (localVarCredential) {
      localVarHeaders = localVarHeaders.set(
        'Authorization',
        'Bearer ' + localVarCredential
      );
    }

    let localVarHttpHeaderAcceptSelected: string | undefined =
      options && options.httpHeaderAccept;
    if (localVarHttpHeaderAcceptSelected === undefined) {
      // to determine the Accept header
      const httpHeaderAccepts: string[] = [];
      localVarHttpHeaderAcceptSelected =
        this.configuration.selectHeaderAccept(httpHeaderAccepts);
    }
    if (localVarHttpHeaderAcceptSelected !== undefined) {
      localVarHeaders = localVarHeaders.set(
        'Accept',
        localVarHttpHeaderAcceptSelected
      );
    }

    let localVarHttpContext: HttpContext | undefined =
      options && options.context;
    if (localVarHttpContext === undefined) {
      localVarHttpContext = new HttpContext();
    }

    // to determine the Content-Type header
    const consumes: string[] = [
      'application/json',
      'text/json',
      'application/*+json',
    ];
    const httpContentTypeSelected: string | undefined =
      this.configuration.selectHeaderContentType(consumes);
    if (httpContentTypeSelected !== undefined) {
      localVarHeaders = localVarHeaders.set(
        'Content-Type',
        httpContentTypeSelected
      );
    }

    let responseType_: 'text' | 'json' | 'blob' = 'json';
    if (localVarHttpHeaderAcceptSelected) {
      if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
        responseType_ = 'text';
      } else if (
        this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)
      ) {
        responseType_ = 'json';
      } else {
        responseType_ = 'blob';
      }
    }

    let localVarPath = `/api/token`;
    return this.httpClient.request<any>(
      'post',
      `${this.configuration.basePath}${localVarPath}`,
      {
        context: localVarHttpContext,
        body: getTokenRequest,
        responseType: <any>responseType_,
        withCredentials: this.configuration.withCredentials,
        headers: localVarHeaders,
        observe: observe,
        reportProgress: reportProgress,
      }
    );
  }

  /**
   * @param requestParameters
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public generateToken(
    requestParameters: GenerateTokenRequestParams,
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json';
      context?: HttpContext;
    }
  ): Observable<GetTokenResponse>;
  public generateToken(
    requestParameters: GenerateTokenRequestParams,
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json';
      context?: HttpContext;
    }
  ): Observable<HttpResponse<GetTokenResponse>>;
  public generateToken(
    requestParameters: GenerateTokenRequestParams,
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json';
      context?: HttpContext;
    }
  ): Observable<HttpEvent<GetTokenResponse>>;
  public generateToken(
    requestParameters: GenerateTokenRequestParams,
    observe: any = 'body',
    reportProgress: boolean = false,
    options?: {
      httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json';
      context?: HttpContext;
    }
  ): Observable<any> {
    const grantType = requestParameters.grantType;
    const username = requestParameters.username;
    const password = requestParameters.password;
    const clientId = requestParameters.clientId;
    const clientSecret = requestParameters.clientSecret;
    const refreshToken = requestParameters.refreshToken;
    const scope = requestParameters.scope;

    let localVarHeaders = this.defaultHeaders;

    let localVarCredential: string | undefined;
    // authentication (api-pilkarzyk-oauth2) required
    localVarCredential = this.configuration.lookupCredential(
      'api-pilkarzyk-oauth2'
    );
    if (localVarCredential) {
      localVarHeaders = localVarHeaders.set(
        'Authorization',
        'Bearer ' + localVarCredential
      );
    }

    let localVarHttpHeaderAcceptSelected: string | undefined =
      options && options.httpHeaderAccept;
    if (localVarHttpHeaderAcceptSelected === undefined) {
      // to determine the Accept header
      const httpHeaderAccepts: string[] = [
        'text/plain',
        'application/json',
        'text/json',
      ];
      localVarHttpHeaderAcceptSelected =
        this.configuration.selectHeaderAccept(httpHeaderAccepts);
    }
    if (localVarHttpHeaderAcceptSelected !== undefined) {
      localVarHeaders = localVarHeaders.set(
        'Accept',
        localVarHttpHeaderAcceptSelected
      );
    }

    let localVarHttpContext: HttpContext | undefined =
      options && options.context;
    if (localVarHttpContext === undefined) {
      localVarHttpContext = new HttpContext();
    }

    // to determine the Content-Type header
    const consumes: string[] = ['multipart/form-data'];

    const canConsumeForm = this.canConsumeForm(consumes);

    let localVarFormParams: { append(param: string, value: any): any };
    let localVarUseForm = false;
    let localVarConvertFormParamsToString = false;
    if (localVarUseForm) {
      localVarFormParams = new FormData();
    } else {
      localVarFormParams = new HttpParams({ encoder: this.encoder });
    }

    if (grantType !== undefined) {
      localVarFormParams =
        (localVarFormParams.append('Grant_type', <any>grantType) as any) ||
        localVarFormParams;
    }
    if (username !== undefined) {
      localVarFormParams =
        (localVarFormParams.append('Username', <any>username) as any) ||
        localVarFormParams;
    }
    if (password !== undefined) {
      localVarFormParams =
        (localVarFormParams.append('Password', <any>password) as any) ||
        localVarFormParams;
    }
    if (clientId !== undefined) {
      localVarFormParams =
        (localVarFormParams.append('Client_id', <any>clientId) as any) ||
        localVarFormParams;
    }
    if (clientSecret !== undefined) {
      localVarFormParams =
        (localVarFormParams.append(
          'Client_secret',
          <any>clientSecret
        ) as any) || localVarFormParams;
    }
    if (refreshToken !== undefined) {
      localVarFormParams =
        (localVarFormParams.append(
          'Refresh_token',
          <any>refreshToken
        ) as any) || localVarFormParams;
    }
    if (scope !== undefined) {
      localVarFormParams =
        (localVarFormParams.append('Scope', <any>scope) as any) ||
        localVarFormParams;
    }

    let responseType_: 'text' | 'json' | 'blob' = 'json';
    if (localVarHttpHeaderAcceptSelected) {
      if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
        responseType_ = 'text';
      } else if (
        this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)
      ) {
        responseType_ = 'json';
      } else {
        responseType_ = 'blob';
      }
    }

    let localVarPath = `/api/token/generate`;
    return this.httpClient.request<GetTokenResponse>(
      'post',
      `${this.configuration.basePath}${localVarPath}`,
      {
        context: localVarHttpContext,
        body: localVarConvertFormParamsToString
          ? localVarFormParams.toString()
          : localVarFormParams,
        responseType: <any>responseType_,
        withCredentials: this.configuration.withCredentials,
        headers: localVarHeaders,
        observe: observe,
        reportProgress: reportProgress,
      }
    );
  }
}

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

import { Inject, Injectable, Optional } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
  HttpEvent,
  HttpParameterCodec,
  HttpContext,
} from '@angular/common/http';
import { CustomHttpParameterCodec } from '../encoder';
import { Observable } from 'rxjs';

// @ts-ignore
import { GetMeetingUsersResponse } from '../model/get-meeting-users-response';

// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS } from '../variables';
import { Configuration } from '../configuration';

export interface GetListMeetingsUsersAsyncRequestParams {
  page: number;
  onPage: number;
  sortColumn?: string;
  sortMode?: string;
  dateFrom?: string;
  dateTo?: string;
  idMeeting?: number;
  idUser?: number;
  answer?: string;
}

export interface GetUserWithMeetingRequestParams {
  meetingId: number;
  userId: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsersMeetingsApi {
  protected basePath = 'https://jaball.manowski.pl:2100';
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
  public getListMeetingsUsersAsync(
    requestParameters: GetListMeetingsUsersAsyncRequestParams,
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json';
      context?: HttpContext;
    }
  ): Observable<Array<GetMeetingUsersResponse>>;
  public getListMeetingsUsersAsync(
    requestParameters: GetListMeetingsUsersAsyncRequestParams,
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json';
      context?: HttpContext;
    }
  ): Observable<HttpResponse<Array<GetMeetingUsersResponse>>>;
  public getListMeetingsUsersAsync(
    requestParameters: GetListMeetingsUsersAsyncRequestParams,
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json';
      context?: HttpContext;
    }
  ): Observable<HttpEvent<Array<GetMeetingUsersResponse>>>;
  public getListMeetingsUsersAsync(
    requestParameters: GetListMeetingsUsersAsyncRequestParams,
    observe: any = 'body',
    reportProgress: boolean = false,
    options?: {
      httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json';
      context?: HttpContext;
    }
  ): Observable<any> {
    const page = requestParameters.page;
    if (page === null || page === undefined) {
      throw new Error(
        'Required parameter page was null or undefined when calling getListMeetingsUsersAsync.'
      );
    }
    const onPage = requestParameters.onPage;
    if (onPage === null || onPage === undefined) {
      throw new Error(
        'Required parameter onPage was null or undefined when calling getListMeetingsUsersAsync.'
      );
    }
    const sortColumn = requestParameters.sortColumn;
    const sortMode = requestParameters.sortMode;
    const dateFrom = requestParameters.dateFrom;
    const dateTo = requestParameters.dateTo;
    const idMeeting = requestParameters.idMeeting;
    const idUser = requestParameters.idUser;
    const answer = requestParameters.answer;

    let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
    if (page !== undefined && page !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>page,
        'Page'
      );
    }
    if (onPage !== undefined && onPage !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>onPage,
        'OnPage'
      );
    }
    if (sortColumn !== undefined && sortColumn !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>sortColumn,
        'SortColumn'
      );
    }
    if (sortMode !== undefined && sortMode !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>sortMode,
        'SortMode'
      );
    }
    if (dateFrom !== undefined && dateFrom !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>dateFrom,
        'DateFrom'
      );
    }
    if (dateTo !== undefined && dateTo !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>dateTo,
        'DateTo'
      );
    }
    if (idMeeting !== undefined && idMeeting !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>idMeeting,
        'IdMeeting'
      );
    }
    if (idUser !== undefined && idUser !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>idUser,
        'IdUser'
      );
    }
    if (answer !== undefined && answer !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>answer,
        'Answer'
      );
    }

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

    let localVarPath = `/api/users-meetings/all`;
    return this.httpClient.request<Array<GetMeetingUsersResponse>>(
      'get',
      `${this.configuration.basePath}${localVarPath}`,
      {
        context: localVarHttpContext,
        params: localVarQueryParameters,
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
  public getUserWithMeeting(
    requestParameters: GetUserWithMeetingRequestParams,
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json';
      context?: HttpContext;
    }
  ): Observable<GetMeetingUsersResponse>;
  public getUserWithMeeting(
    requestParameters: GetUserWithMeetingRequestParams,
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json';
      context?: HttpContext;
    }
  ): Observable<HttpResponse<GetMeetingUsersResponse>>;
  public getUserWithMeeting(
    requestParameters: GetUserWithMeetingRequestParams,
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json';
      context?: HttpContext;
    }
  ): Observable<HttpEvent<GetMeetingUsersResponse>>;
  public getUserWithMeeting(
    requestParameters: GetUserWithMeetingRequestParams,
    observe: any = 'body',
    reportProgress: boolean = false,
    options?: {
      httpHeaderAccept?: 'text/plain' | 'application/json' | 'text/json';
      context?: HttpContext;
    }
  ): Observable<any> {
    const meetingId = requestParameters.meetingId;
    if (meetingId === null || meetingId === undefined) {
      throw new Error(
        'Required parameter meetingId was null or undefined when calling getUserWithMeeting.'
      );
    }
    const userId = requestParameters.userId;
    if (userId === null || userId === undefined) {
      throw new Error(
        'Required parameter userId was null or undefined when calling getUserWithMeeting.'
      );
    }

    let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
    if (meetingId !== undefined && meetingId !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>meetingId,
        'meetingId'
      );
    }
    if (userId !== undefined && userId !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>userId,
        'userId'
      );
    }

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

    let localVarPath = `/api/users-meetings`;
    return this.httpClient.request<GetMeetingUsersResponse>(
      'get',
      `${this.configuration.basePath}${localVarPath}`,
      {
        context: localVarHttpContext,
        params: localVarQueryParameters,
        responseType: <any>responseType_,
        withCredentials: this.configuration.withCredentials,
        headers: localVarHeaders,
        observe: observe,
        reportProgress: reportProgress,
      }
    );
  }
}

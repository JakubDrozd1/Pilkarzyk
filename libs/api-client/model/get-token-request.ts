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


export interface GetTokenRequest { 
    Grant_type?: string | null;
    Username?: string | null;
    Password?: string | null;
    Client_id?: string | null;
    Client_secret?: string | null;
    Refresh_token?: string | null;
    Scope?: string | null;
}


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


export interface GetUpdateUserRequest { 
    Login?: string | null;
    UserPassword?: string | null;
    Email?: string | null;
    Firstname?: string | null;
    Surname?: string | null;
    PhoneNumber?: number | null;
    Avatar?: string | null;
    Column?: Array<string> | null;
}


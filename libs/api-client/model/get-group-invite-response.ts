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


export interface GetGroupInviteResponse { 
    Name?: string | null;
    IdGroupInvite?: number;
    IdGroup?: number;
    IdUser?: number | null;
    IdAuthor?: number;
    DateAdd?: string;
    FirstnameAuthor?: string | null;
    SurnameAuthor?: string | null;
    Firstname?: string | null;
    Surname?: string | null;
    Email?: string | null;
    PhoneNumber?: number | null;
}


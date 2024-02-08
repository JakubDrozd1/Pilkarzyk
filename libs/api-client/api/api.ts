export * from './group-invites.api';
import { GroupInvitesApi } from './group-invites.api';
export * from './groups.api';
import { GroupsApi } from './groups.api';
export * from './groups-users.api';
import { GroupsUsersApi } from './groups-users.api';
export * from './meetings.api';
import { MeetingsApi } from './meetings.api';
export * from './messages.api';
import { MessagesApi } from './messages.api';
export * from './notification-tokens.api';
import { NotificationTokensApi } from './notification-tokens.api';
export * from './rankings.api';
import { RankingsApi } from './rankings.api';
export * from './token.api';
import { TokenApi } from './token.api';
export * from './users.api';
import { UsersApi } from './users.api';
export * from './users-meetings.api';
import { UsersMeetingsApi } from './users-meetings.api';
export const APIS = [GroupInvitesApi, GroupsApi, GroupsUsersApi, MeetingsApi, MessagesApi, NotificationTokensApi, RankingsApi, TokenApi, UsersApi, UsersMeetingsApi];

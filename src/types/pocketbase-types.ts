/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	AdminRoles = "admin_roles",
	Attendance = "attendance",
	ClubMemberships = "club_memberships",
	ClubYears = "club_years",
	ClubberRegistrations = "clubber_registrations",
	Clubbers = "clubbers",
	Clubs = "clubs",
	Countries = "countries",
	Events = "events",
	Programs = "programs",
	Regions = "regions",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export enum AdminRolesRoleOptions {
	"Pending" = "Pending",
	"Global" = "Global",
	"Country" = "Country",
	"Region" = "Region",
}
export type AdminRolesRecord = {
	country?: RecordIdString
	id: string
	region?: RecordIdString
	role: AdminRolesRoleOptions
	user: RecordIdString
}

export enum AttendanceStatusOptions {
	"Present" = "Present",
	"Absent" = "Absent",
	"Excused" = "Excused",
}
export type AttendanceRecord = {
	club: RecordIdString
	event: RecordIdString
	id: string
	status: AttendanceStatusOptions
	student: RecordIdString
}

export enum ClubMembershipsRolesOptions {
	"Director" = "Director",
	"Secretary" = "Secretary",
	"Treasurer" = "Treasurer",
	"Leader" = "Leader",
	"Guardian" = "Guardian",
	"Pending" = "Pending",
}
export type ClubMembershipsRecord = {
	club: RecordIdString
	id: string
	roles: ClubMembershipsRolesOptions[]
	user: RecordIdString
}

export type ClubYearsRecord = {
	club: RecordIdString
	endDate: IsoDateString
	id: string
	label: string
	startDate: IsoDateString
}

export type ClubberRegistrationsRecord = {
	club: RecordIdString
	club_year: RecordIdString
	clubber: RecordIdString
	id: string
	program: RecordIdString
}

export enum ClubbersGenderOptions {
	"Male" = "Male",
	"Female" = "Female",
}
export type ClubbersRecord = {
	active?: boolean
	club: RecordIdString
	dateOfBirth?: IsoDateString
	firstName: string
	gender?: ClubbersGenderOptions
	guardian?: RecordIdString
	id: string
	lastName: string
	notes?: string
}

export enum ClubsTypeOptions {
	"Leader Based" = "Leader Based",
	"Other" = "Other",
}

export enum ClubsVenueOptions {
	"Church" = "Church",
	"School" = "School",
	"Community Center" = "Community Center",
	"Christian Camp" = "Christian Camp",
	"Children's Ministry Office" = "Children's Ministry Office",
	"Mission Compound" = "Mission Compound",
	"Refugee Camp" = "Refugee Camp",
	"Youth Center" = "Youth Center",
	"Orphanage" = "Orphanage",
	"Other" = "Other",
}
export type ClubsRecord<Tmetadata = unknown> = {
	active?: boolean
	address?: string
	country: RecordIdString
	denomination?: string
	expiration?: IsoDateString
	id: string
	joinCode?: string
	lat?: number
	leaderSecret?: string
	lng?: number
	location?: string
	metadata?: null | Tmetadata
	missionary?: RecordIdString
	name: string
	region: RecordIdString
	registration?: string
	salesforce?: string
	timezone?: string
	type: ClubsTypeOptions
	venue: ClubsVenueOptions
}

export type CountriesRecord = {
	id: string
	isoCode?: string
	name: string
}

export enum EventsTypeOptions {
	"Weekly" = "Weekly",
	"Games" = "Games",
	"Quiz" = "Quiz",
	"Other" = "Other",
}
export type EventsRecord = {
	club?: RecordIdString
	club_year: RecordIdString
	endDate: IsoDateString
	id: string
	name: string
	region?: RecordIdString
	startDate: IsoDateString
	type: EventsTypeOptions
}

export type ProgramsRecord = {
	club: RecordIdString
	description?: string
	id: string
	name: string
}

export type RegionsRecord = {
	country: RecordIdString
	id: string
	name: string
}

export type UsersRecord = {
	avatar?: FileNameString
	bio?: string
	created: IsoAutoDateString
	displayName?: string
	email: string
	emailVisibility?: boolean
	id: string
	language?: string
	locale?: string
	name?: string
	password: string
	phone?: string
	theme?: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type AdminRolesResponse<Texpand = unknown> = Required<AdminRolesRecord> & BaseSystemFields<Texpand>
export type AttendanceResponse<Texpand = unknown> = Required<AttendanceRecord> & BaseSystemFields<Texpand>
export type ClubMembershipsResponse<Texpand = unknown> = Required<ClubMembershipsRecord> & BaseSystemFields<Texpand>
export type ClubYearsResponse<Texpand = unknown> = Required<ClubYearsRecord> & BaseSystemFields<Texpand>
export type ClubberRegistrationsResponse<Texpand = unknown> = Required<ClubberRegistrationsRecord> & BaseSystemFields<Texpand>
export type ClubbersResponse<Texpand = unknown> = Required<ClubbersRecord> & BaseSystemFields<Texpand>
export type ClubsResponse<Tmetadata = unknown, Texpand = unknown> = Required<ClubsRecord<Tmetadata>> & BaseSystemFields<Texpand>
export type CountriesResponse<Texpand = unknown> = Required<CountriesRecord> & BaseSystemFields<Texpand>
export type EventsResponse<Texpand = unknown> = Required<EventsRecord> & BaseSystemFields<Texpand>
export type ProgramsResponse<Texpand = unknown> = Required<ProgramsRecord> & BaseSystemFields<Texpand>
export type RegionsResponse<Texpand = unknown> = Required<RegionsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	admin_roles: AdminRolesRecord
	attendance: AttendanceRecord
	club_memberships: ClubMembershipsRecord
	club_years: ClubYearsRecord
	clubber_registrations: ClubberRegistrationsRecord
	clubbers: ClubbersRecord
	clubs: ClubsRecord
	countries: CountriesRecord
	events: EventsRecord
	programs: ProgramsRecord
	regions: RegionsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	admin_roles: AdminRolesResponse
	attendance: AttendanceResponse
	club_memberships: ClubMembershipsResponse
	club_years: ClubYearsResponse
	clubber_registrations: ClubberRegistrationsResponse
	clubbers: ClubbersResponse
	clubs: ClubsResponse
	countries: CountriesResponse
	events: EventsResponse
	programs: ProgramsResponse
	regions: RegionsResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase

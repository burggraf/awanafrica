/**
* This file was semi-automatically generated.
* It follows the structure expected by pocketbase-typegen.
*/

export const Collections = {
	AdminRoles: "admin_roles",
	Attendance: "attendance",
	ClubMemberships: "club_memberships",
	ClubYears: "club_years",
	Clubs: "clubs",
	Countries: "countries",
	Events: "events",
	Programs: "programs",
	Regions: "regions",
	ClubberRegistrations: "clubber_registrations",
	Clubbers: "clubbers",
	Users: "users",
} as const

// Record types for each collection

export interface AdminRolesRecord {
	user: string
	role: "Global" | "Missionary" | "Country" | "Region" | "Pending"
	country?: string
	region?: string
}

export interface AttendanceRecord {
	event: string
	clubber: string
	club: string
	status: "Present" | "Absent" | "Excused"
}

export interface ClubMembershipsRecord {
	user: string
	club: string
	roles: ("Director" | "Secretary" | "Treasurer" | "Leader" | "Guardian" | "Pending")[]
}

export interface ClubYearsRecord {
	club: string
	label: string
	startDate: string
	endDate: string
}

export interface ClubsRecord {
	name: string
	registration: string
	joinCode?: string
	leaderSecret?: string
	lat?: number
	lng?: number
	venue: "Church" | "School" | "Community Center" | "Christian Camp" | "Other"
	type: "Leader Based" | "Other"
	denomination?: string
	location?: string
	missionary?: string
	expiration?: string
	metadata?: any
	salesforce?: string
	region: string
	address?: string
	timezone?: string
	active?: boolean
}

export interface CountriesRecord {
	name: string
	isoCode: string
}

export interface EventsRecord {
	club: string
	club_year: string
	name: string
	type: "Weekly" | "Games" | "Quiz" | "Other"
	startDate: string
	endDate: string
}

export interface ProgramsRecord {
	club: string
	name: string
	description?: string
}

export interface RegionsRecord {
	name: string
	country: string
}

export interface ClubberRegistrationsRecord {
	clubber: string
	club: string
	club_year: string
	program: string
}

export interface ClubbersRecord {
	club: string
	guardian?: string
	firstName: string
	lastName: string
	dateOfBirth?: string
	notes?: string
	active?: boolean
	gender?: "Male" | "Female"
}

export interface UsersRecord {
	email: string
	verified: boolean
	name?: string
	displayName?: string
	phone?: string
	avatar?: string
	bio?: string
	language?: string
	locale?: string
	theme?: string
}

// Response types (includes system fields)

export type BaseRecord = {
	id: string
	created: string
	updated: string
}

export type AdminRolesResponse<Texpand = unknown> = AdminRolesRecord & BaseRecord & { expand?: Texpand }
export type AttendanceResponse<Texpand = unknown> = AttendanceRecord & BaseRecord & { expand?: Texpand }
export type ClubMembershipsResponse<Texpand = unknown> = ClubMembershipsRecord & BaseRecord & { expand?: Texpand }
export type ClubYearsResponse<Texpand = unknown> = ClubYearsRecord & BaseRecord & { expand?: Texpand }
export type ClubsResponse<Texpand = unknown> = ClubsRecord & BaseRecord & { expand?: Texpand }
export type CountriesResponse<Texpand = unknown> = CountriesRecord & BaseRecord & { expand?: Texpand }
export type EventsResponse<Texpand = unknown> = EventsRecord & BaseRecord & { expand?: Texpand }
export type ProgramsResponse<Texpand = unknown> = ProgramsRecord & BaseRecord & { expand?: Texpand }
export type RegionsResponse<Texpand = unknown> = RegionsRecord & BaseRecord & { expand?: Texpand }
export type ClubberRegistrationsResponse<Texpand = unknown> = ClubberRegistrationsRecord & BaseRecord & { expand?: Texpand }
export type ClubbersResponse<Texpand = unknown> = ClubbersRecord & BaseRecord & { expand?: Texpand }
export type UsersResponse<Texpand = unknown> = UsersRecord & BaseRecord & { expand?: Texpand }

export type CollectionResponses = {
	admin_roles: AdminRolesResponse
	attendance: AttendanceResponse
	club_memberships: ClubMembershipsResponse
	club_years: ClubYearsResponse
	clubs: ClubsResponse
	countries: CountriesResponse
	events: EventsResponse
	programs: ProgramsResponse
	regions: RegionsResponse
	clubber_registrations: ClubberRegistrationsResponse
	clubbers: ClubbersResponse
	users: UsersResponse
}

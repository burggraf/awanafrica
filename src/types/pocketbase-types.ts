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
	StudentRegistrations: "student_registrations",
	Students: "students",
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
	student: string
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
	charter: string
	venue: "Church" | "School" | "Community Center" | "Christian Camp" | "Other"
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

export interface StudentRegistrationsRecord {
	student: string
	club: string
	club_year: string
	program: string
}

export interface StudentsRecord {
	club: string
	firstName: string
	lastName: string
	dateOfBirth?: string
	notes?: string
}

export interface UsersRecord {
	email: string
	verified: boolean
	name?: string
	displayName?: string
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
export type StudentRegistrationsResponse<Texpand = unknown> = StudentRegistrationsRecord & BaseRecord & { expand?: Texpand }
export type StudentsResponse<Texpand = unknown> = StudentsRecord & BaseRecord & { expand?: Texpand }
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
	student_registrations: StudentRegistrationsResponse
	students: StudentsResponse
	users: UsersResponse
}

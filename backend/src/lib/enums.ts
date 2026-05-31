export const Role = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT'
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED'
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const ClassStatus = {
  NOT_OPENED: 'NOT_OPENED',
  ENROLLING: 'ENROLLING',
  ACTIVE: 'ACTIVE',
  POSTPONED: 'POSTPONED',
  FINISHED: 'FINISHED',
  CANCELLED: 'CANCELLED'
} as const;

export type ClassStatus = (typeof ClassStatus)[keyof typeof ClassStatus];

export const EnrollmentStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
} as const;

export type EnrollmentStatus = (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus];

export const AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE'
} as const;

export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export const TuitionStatus = {
  UNPAID: 'UNPAID',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE'
} as const;

export type TuitionStatus = (typeof TuitionStatus)[keyof typeof TuitionStatus];

export const PaymentMethod = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CARD: 'CARD'
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const SessionStatus = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

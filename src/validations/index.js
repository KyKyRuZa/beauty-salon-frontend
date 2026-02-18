// Export all validation schemas
export * from './base';
export * from './auth';
export * from './user';
export * from './catalog';
export * from './booking';
export * from './admin';
export * from './formSchemas';

// Re-export specific schemas for compatibility
export {
  registerSchema,
  loginSchema,
  profileEditSchema
} from './auth';

export {
  adminRegisterSchema,
  adminLoginSchema,
  adminUpdateSchema
} from './admin';

export {
  appointmentSchema
} from './formSchemas';

// Re-export commonly used schemas
export {
  optionalIdSchema,
  optionalBooleanSchema,
  textSchema,
  optionalStringSchema
} from './base';
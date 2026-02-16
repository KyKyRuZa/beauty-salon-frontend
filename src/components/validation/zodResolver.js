import { z } from 'zod';

export const zodResolver = (schema) => async (values) => {
  try {
    const result = await schema.parseAsync(values);
    return { values: result, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      if (Array.isArray(error.errors)) {
        error.errors.forEach((err) => {
          if (err.path) {
            const field = err.path.join('.');
            errors[field] = { message: err.message, type: err.code };
          }
        });
      }
      return { values: {}, errors };
    }
    return { values: {}, errors: {} };
  }
};
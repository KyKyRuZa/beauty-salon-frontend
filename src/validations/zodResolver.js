import { z } from 'zod';

export const zodResolver = (schema) => async (values) => {
  try {
    const result = await schema.parseAsync(values);
    return { values: result, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      // Zod v4 использует issues вместо errors
      const issues = error.issues || error.errors || [];
      if (Array.isArray(issues)) {
        issues.forEach((err) => {
          if (err.path && err.path.length > 0) {
            const field = err.path.join('.');
            errors[field] = { message: err.message, type: err.code };
          } else if (err.path && err.path.length === 0) {
            // Глобальная ошибка (например от refine)
            errors.root = { message: err.message, type: err.code };
          }
        });
      }
      // Возвращаем оригинальные значения вместе с ошибками
      return { values, errors };
    }
    return { values: {}, errors: {} };
  }
};
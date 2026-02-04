/**
 * Date utilities – module-agnostic helpers.
 */

/**
 * Calculate age in full years from date of birth.
 * Uses calendar comparison (birthday not yet reached in current year decrements age).
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

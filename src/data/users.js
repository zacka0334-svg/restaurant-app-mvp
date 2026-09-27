// Mock users used by the Login / Signup screen.
// There is no backend: the list is held in AuthContext state and new
// sign-ups are appended to it (and persisted with AsyncStorage).
//
// Passwords follow the app rule: at least 8 characters with at least one digit.

export const users = [
  {
    id: 'u1',
    fullName: 'Ali Raza',
    email: 'customer@restaurant.pk',
    password: 'Customer123',
    role: 'customer',
  },
  {
    id: 'u2',
    fullName: 'Sara Khan',
    email: 'sara@restaurant.pk',
    password: 'Sara12345',
    role: 'customer',
  },
  {
    id: 'u3',
    fullName: 'Usman Tariq',
    email: 'manager@restaurant.pk',
    password: 'Manager123',
    role: 'manager',
  },
];

export default users;

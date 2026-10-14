// Safe, password-free representation sent to the admin frontend.
export function publicAdmin(admin) {
  return {
    id: String(admin._id),
    name: admin.name,
    email: admin.email,
    role: 'admin',
    createdAt: admin.createdAt,
  };
}

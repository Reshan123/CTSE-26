
const users = new Map();
let idCounter = 1;

const UserModel = {
  create: (userData) => {
    const id = String(idCounter++);
    const user = {
      id, name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      role: userData.role || 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.set(id, user);
    return user;
  },
  findById: (id) => users.get(String(id)) || null,
  findByEmail: (email) => {
    for (const user of users.values()) {
      if (user.email === email.toLowerCase()) return user;
    }
    return null;
  },
  update: (id, updates) => {
    const user = users.get(String(id));
    if (!user) return null;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    users.set(String(id), updated);
    return updated;
  },
  delete: (id) => users.delete(String(id)),
  findAll: () => Array.from(users.values()),
  exists: (id) => users.has(String(id))
};

module.exports = UserModel;

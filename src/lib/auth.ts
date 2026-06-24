export interface User {
  id: string;
  name: string;
  email: string;
}

interface StoredUser extends User {
  password: string;
}

const USERS_KEY = "grana:users";
const SESSION_KEY = "grana:session";

function hashPassword(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i);
    h |= 0;
  }
  return h.toString(36);
}

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function register(
  name: string,
  email: string,
  password: string
): { user: User } | { error: string } {
  const users = getUsers();
  if (users.some((u) => u.email === email.trim().toLowerCase())) {
    return { error: "Este e-mail já está cadastrado" };
  }
  const user: StoredUser = {
    id: `u${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashPassword(password),
  };
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const session: User = { id: user.id, name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { user: session };
}

export function login(
  email: string,
  password: string
): { user: User } | { error: string } {
  const users = getUsers();
  const user = users.find(
    (u) =>
      u.email === email.trim().toLowerCase() &&
      u.password === hashPassword(password)
  );
  if (!user) return { error: "E-mail ou senha incorretos" };
  const session: User = { id: user.id, name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { user: session };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function deleteAccount(uid: string) {
  const users = getUsers().filter((u) => u.id !== uid);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.removeItem(SESSION_KEY);
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(`:${uid}`)) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

export function getSession(): User | null {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function updateProfile(
  uid: string,
  name: string
): { user: User } | { error: string } {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Nome é obrigatório" };
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === uid);
  if (idx === -1) return { error: "Usuário não encontrado" };
  users[idx].name = trimmed;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const session: User = { id: users[idx].id, name: trimmed, email: users[idx].email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { user: session };
}

export function changePassword(
  uid: string,
  currentPassword: string,
  newPassword: string
): true | { error: string } {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === uid);
  if (idx === -1) return { error: "Usuário não encontrado" };
  if (users[idx].password !== hashPassword(currentPassword))
    return { error: "Senha atual incorreta" };
  if (newPassword.length < 6)
    return { error: "A nova senha deve ter pelo menos 6 caracteres" };
  users[idx].password = hashPassword(newPassword);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
}

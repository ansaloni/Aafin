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

export function getSession(): User | null {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
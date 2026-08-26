export type UserRole = "admin" | "manager" | "viewer";

export interface UserAccount {
  username: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  allowedTabs: Array<"dashboard" | "entry" | "overhead">;
  canEdit: boolean;
  canDelete: boolean;
  avatarEmoji: string;
}

export const USERS: Record<string, UserAccount & { passwordHash: string }> = {
  russellfoyze: {
    username: "russellfoyze",
    passwordHash: "russellfoyze",
    name: "Russell Foyze",
    role: "admin",
    roleLabel: "👑 অ্যাডমিন (মালিক)",
    allowedTabs: ["dashboard", "entry", "overhead"],
    canEdit: true,
    canDelete: true,
    avatarEmoji: "👑",
  },
  billal: {
    username: "billal",
    passwordHash: "billal",
    name: "Billal Hossain",
    role: "manager",
    roleLabel: "👔 ম্যানেজার (হিসাবরক্ষক)",
    allowedTabs: ["entry", "overhead"],
    canEdit: true,
    canDelete: false,
    avatarEmoji: "👔",
  },
  kayes: {
    username: "kayes",
    passwordHash: "kayes",
    name: "Kayes",
    role: "manager",
    roleLabel: "👔 ম্যানেজার (হিসাবরক্ষক)",
    allowedTabs: ["dashboard", "entry", "overhead"],
    canEdit: true,
    canDelete: true,
    avatarEmoji: "💼",
  },
  juel: {
    username: "juel",
    passwordHash: "juel",
    name: "Juel Ahmed",
    role: "viewer",
    roleLabel: "👁️ ভিউয়ার (দর্শক)",
    allowedTabs: ["dashboard"],
    canEdit: false,
    canDelete: false,
    avatarEmoji: "👁️",
  },
};

export function authenticateUser(usernameInput: string, passwordInput: string): UserAccount | null {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  const user = USERS[cleanUsername];
  if (!user) return null;

  if (user.passwordHash === cleanPassword) {
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  return null;
}

export function getUserProfile(username: string): UserAccount | null {
  const cleanUsername = username.trim().toLowerCase();
  const user = USERS[cleanUsername];
  if (!user) return null;
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

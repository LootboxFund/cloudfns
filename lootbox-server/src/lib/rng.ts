import { nanoid } from "nanoid";

export const generateUsername = (): string => `user ${nanoid(4)}`;

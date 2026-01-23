import { User } from "@prisma/client";
import { getAllUsers } from "./actions";
import UserClient from "./UserClient";

export default async function UserPage() {
  const result = await getAllUsers();

  // Cast data ke User[] untuk menghilangkan error type undefined/any[]
  const users: User[] = result.success && result.data ? (result.data as User[]) : [];

  return <UserClient initialData={users} />;
}

import { type User } from "lucia";
import { logout } from "~/components/custom/actions";

function Logout() {
  return (
    <form action={logout}>
      <button>
        <svg xmlns="http://www.w3.org/2000/svg" className="size-12 text-white">
          <path
            fill="currentColor"
            d="M5.615 20q-.69 0-1.152-.462Q4 19.075 4 18.385V5.615q0-.69.463-1.152Q4.925 4 5.615 4h6.404v1H5.615q-.23 0-.423.192Q5 5.385 5 5.615v12.77q0 .23.192.423q.193.192.423.192h6.404v1zm10.847-4.462l-.702-.719l2.319-2.319H9.192v-1h8.887l-2.32-2.32l.703-.718L20 12z"
          />
        </svg>{" "}
      </button>
    </form>
  );
}

export function DisplayUser({ user }: { user: User }) {
  return (
    <div className="flex place-content-between pl-4 pb-4 border-b-2 border-gray-700">
      <div className="flex gap-2">
        <img className="size-8 rounded-2xl" src={user.avatarUrl} />
        <div>
          <h1 className="text-white">Welcome {user.username}</h1>
          <h2 className="text-sm text-stone-200">{user.email}</h2>
        </div>
      </div>
      <Logout />
    </div>
  );
}
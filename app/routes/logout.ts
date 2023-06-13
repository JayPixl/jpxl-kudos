import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { logout } from "~/utils/auth.server";


export const action: ActionFunction = ({ request }) => logout(request)

export const loader: LoaderFunction = () => redirect("/home")
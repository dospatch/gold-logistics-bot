import { redirect } from "next/navigation";

// General employment applications now live in Careers.
export default function ApplyRedirect() {
  redirect("/careers/apply");
}

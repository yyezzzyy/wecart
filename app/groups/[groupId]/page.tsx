import { redirect } from "next/navigation";

export default function GroupIndexPage({ params }: { params: { groupId: string } }) {
  redirect(`/groups/${params.groupId}/items`);
}

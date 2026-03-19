import { useQuery } from "@tanstack/react-query";
import { getFriends } from "@/api/friends";
import { ErrorState } from "@/components/common/ErrorState";
import { Loading } from "@/components/common/Loading";

export function FriendsPage() {
  const friendsQuery = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Friends (TODO)</h1>
      {friendsQuery.isLoading && <Loading text="Loading friends..." />}
      {friendsQuery.isError && <ErrorState message="Failed to load friends" />}
      {friendsQuery.data && friendsQuery.data.friends.length === 0 && (
        <p className="text-sm text-gray-600">No friends yet.</p>
      )}
      {friendsQuery.data && friendsQuery.data.friends.length > 0 && (
        <ul className="space-y-2">
          {friendsQuery.data.friends.map((friend) => (
            <li className="rounded border p-3 text-sm" key={friend.id}>
              <p>{friend.username}</p>
              <p className="text-gray-600">{friend.email}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

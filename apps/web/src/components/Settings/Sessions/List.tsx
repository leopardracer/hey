import Loader from "@/components/Shared/Loader";
import { Button, EmptyState, ErrorMessage } from "@/components/Shared/UI";
import formatDate from "@/helpers/datetime/formatDate";
import errorToast from "@/helpers/errorToast";
import useLoadMoreOnIntersect from "@/hooks/useLoadMoreOnIntersect";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { ComputerDesktopIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import {
  type AuthenticatedSessionsRequest,
  PageSize,
  useAuthenticatedSessionsQuery,
  useRevokeAuthenticationMutation
} from "@hey/indexer";
import type { ApolloClientError } from "@hey/types/errors";
import { useState } from "react";
import { toast } from "sonner";
import { WindowVirtualizer } from "virtua";

const List = () => {
  const { currentAccount } = useAccountStore();
  const [revoking, setRevoking] = useState(false);
  const [revokeingSessionId, setRevokeingSessionId] = useState<null | string>(
    null
  );

  const onError = (error: ApolloClientError) => {
    setRevoking(false);
    setRevokeingSessionId(null);
    errorToast(error);
  };

  const onCompleted = () => {
    setRevoking(false);
    setRevokeingSessionId(null);
    toast.success("Session revoked");
  };

  const [revokeAuthentication] = useRevokeAuthenticationMutation({
    onCompleted,
    onError,
    update: (cache) => {
      cache.evict({ id: "ROOT_QUERY" });
    }
  });

  const handleRevoke = async (authenticationId: string) => {
    setRevoking(true);
    setRevokeingSessionId(authenticationId);

    return await revokeAuthentication({
      variables: { request: { authenticationId } }
    });
  };

  const request: AuthenticatedSessionsRequest = { pageSize: PageSize.Fifty };
  const { data, error, fetchMore, loading } = useAuthenticatedSessionsQuery({
    skip: !currentAccount?.address,
    variables: { request }
  });

  const authenticatedSessions = data?.authenticatedSessions?.items;
  const pageInfo = data?.authenticatedSessions?.pageInfo;
  const hasMore = pageInfo?.next;

  const handleEndReached = async () => {
    if (hasMore) {
      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      });
    }
  };

  const loadMoreRef = useLoadMoreOnIntersect(handleEndReached);

  if (loading) {
    return <Loader className="my-10" />;
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-5"
        error={error}
        title="Failed to load sessions"
      />
    );
  }

  if (!authenticatedSessions?.length) {
    return (
      <EmptyState
        hideCard
        icon={<GlobeAltIcon className="size-8" />}
        message="You are not logged in on any other devices!"
      />
    );
  }

  return (
    <div className="virtual-divider-list-window">
      <WindowVirtualizer>
        {authenticatedSessions.map((session) => (
          <div
            className="flex flex-wrap items-start justify-between p-5"
            key={session.authenticationId}
          >
            <div>
              <div className="mb-3 flex items-center space-x-2">
                <ComputerDesktopIcon className="size-8" />
                <div>
                  {session.browser ? <span>{session.browser}</span> : null}
                  {session.os ? <span> - {session.os}</span> : null}
                </div>
              </div>
              <div className="space-y-1 text-gray-500 text-sm dark:text-gray-200">
                {session.origin ? (
                  <div>
                    <b>Origin -</b> {session.origin}
                  </div>
                ) : null}
                <div>
                  <b>Registered -</b>{" "}
                  {formatDate(session.createdAt, "MMM D, YYYY - hh:mm:ss A")}
                </div>
                <div>
                  <b>Last accessed -</b>{" "}
                  {formatDate(session.updatedAt, "MMM D, YYYY - hh:mm:ss A")}
                </div>
                <div>
                  <b>Expires at -</b>{" "}
                  {formatDate(session.expiresAt, "MMM D, YYYY - hh:mm:ss A")}
                </div>
              </div>
            </div>
            <Button
              disabled={
                revoking && revokeingSessionId === session.authenticationId
              }
              loading={
                revoking && revokeingSessionId === session.authenticationId
              }
              onClick={() => handleRevoke(session.authenticationId)}
            >
              Revoke
            </Button>
          </div>
        ))}
        {hasMore && <span ref={loadMoreRef} />}
      </WindowVirtualizer>
    </div>
  );
};

export default List;

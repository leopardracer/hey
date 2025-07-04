import Custom404 from "@/components/Shared/404";
import Custom500 from "@/components/Shared/500";
import BackButton from "@/components/Shared/BackButton";
import NotLoggedIn from "@/components/Shared/NotLoggedIn";
import PageLayout from "@/components/Shared/PageLayout";
import ProFeatureNotice from "@/components/Shared/ProFeatureNotice";
import { Card, CardHeader } from "@/components/Shared/UI";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { useGroupQuery } from "@hey/indexer";
import { useParams } from "react-router";
import SuperJoin from "./SuperJoin";

const MonetizeSettings = () => {
  const { address } = useParams<{ address: string }>();
  const { currentAccount } = useAccountStore();

  const { data, loading, error } = useGroupQuery({
    variables: { request: { group: address } },
    skip: !address
  });

  if (!address || loading) {
    return null;
  }

  if (error) {
    return <Custom500 />;
  }

  const group = data?.group;

  if (!group || currentAccount?.address !== group.owner) {
    return <Custom404 />;
  }

  if (!currentAccount) {
    return <NotLoggedIn />;
  }

  return (
    <PageLayout title="Monetize settings">
      {currentAccount?.hasSubscribed ? (
        <SuperJoin group={group} />
      ) : (
        <Card>
          <CardHeader
            icon={<BackButton path={`/g/${group.address}/settings`} />}
            title="Super Join"
          />
          <ProFeatureNotice className="m-5" feature="super join settings" />
        </Card>
      )}
    </PageLayout>
  );
};

export default MonetizeSettings;

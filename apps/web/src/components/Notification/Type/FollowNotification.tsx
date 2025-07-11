import { NotificationAccountAvatar } from "@/components/Notification/Account";
import AggregatedNotificationTitle from "@/components/Notification/AggregatedNotificationTitle";
import { useAccountStore } from "@/store/persisted/useAccountStore";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import getAccount from "@hey/helpers/getAccount";
import type { FollowNotificationFragment } from "@hey/indexer";
import plur from "plur";

interface FollowNotificationProps {
  notification: FollowNotificationFragment;
}

const FollowNotification = ({ notification }: FollowNotificationProps) => {
  const { currentAccount } = useAccountStore();
  const followers = notification.followers;
  const firstAccount = followers?.[0];
  const length = followers.length - 1;
  const moreThanOneAccount = length > 1;

  const text = moreThanOneAccount
    ? `and ${length} ${plur("other", length)} followed`
    : "followed";
  const type = "you";

  return (
    <div className="space-y-2 p-5">
      <div className="flex items-center space-x-3">
        <UserPlusIcon className="size-6" />
        <div className="flex items-center space-x-1">
          {followers.slice(0, 10).map((follower) => (
            <div key={follower.account.address}>
              <NotificationAccountAvatar account={follower.account} />
            </div>
          ))}
        </div>
      </div>
      <div className="ml-9">
        <AggregatedNotificationTitle
          firstAccount={firstAccount.account}
          linkToType={getAccount(currentAccount).link}
          text={text}
          type={type}
        />
      </div>
    </div>
  );
};

export default FollowNotification;

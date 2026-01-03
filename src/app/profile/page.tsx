import type { Metadata } from "next";
import ProfileShell from "@/components/profile/ProfileShell";
import ProfileHeader from "@/components/profile/ProfileHeader";
import BirthDataCard from "@/components/profile/BirthDataCard";
import SubscriptionCard from "@/components/profile/SubscriptionCard";
import SignOutButton from "@/components/profile/SignOutButton";

export const metadata: Metadata = {
  title: "Profile | Stella+",
  description: "Your cosmic profile and subscription settings",
};

/**
 * Profile Page
 *
 * Shows the user's profile information including:
 * - Big Three (Sun, Moon, Rising)
 * - Birth data
 * - Subscription status
 * - Sign out option
 */
export default function ProfilePage() {
  return (
    <ProfileShell>
      <div className="max-w-md mx-auto">
        <ProfileHeader />

        <div className="space-y-6">
          <BirthDataCard />
          <SubscriptionCard />
        </div>

        <SignOutButton />

        {/* Version info */}
        <div className="text-center pb-8">
          <p className="text-white/20 text-xs">
            Stella+ v1.0 • Made with cosmic love
          </p>
        </div>
      </div>
    </ProfileShell>
  );
}

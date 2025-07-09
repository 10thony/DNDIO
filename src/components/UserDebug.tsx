import React from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const UserDebug: React.FC = () => {
  const { user, isSignedIn } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, 
    user ? { clerkId: user.id } : "skip"
  );

  if (!isSignedIn) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-sm">
        🔒 Not signed in
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-xl p-4 text-sm max-w-xs shadow-lg backdrop-blur-md z-50">
      <div className="font-bold mb-2 text-base flex items-center gap-2">
        <span role="img" aria-label="User">👤</span> User Debug
      </div>
      <div className="space-y-2 text-xs">
        <div><span className="font-semibold">Clerk ID:</span> <span className="font-mono">{user?.id?.slice(0, 8)}...</span></div>
        <div><span className="font-semibold">Email:</span> <span className="font-mono">{user?.emailAddresses[0]?.emailAddress}</span></div>
        <div><span className="font-semibold">Convex User:</span> {convexUser ? <span className="text-green-600 font-bold">✅ Found</span> : <span className="text-red-600 font-bold">❌ Not found</span>}</div>
        {convexUser && (
          <div><span className="font-semibold">Role:</span> <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ml-1 ${convexUser.role === 'admin' ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-400 dark:border-red-700' : 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-400 dark:border-green-700'}`}>
            {convexUser.role}
          </span></div>
        )}
      </div>
    </div>
  );
}; 
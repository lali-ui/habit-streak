import { User } from '@/app/types';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose, users }) => {
  if (!isOpen) return null;

  const sortedUsers = [...users].sort((a, b) => b.streakScore - a.streakScore);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-100">Leaderboard</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          {sortedUsers.map((user, index) => (
            <div 
              key={user.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50"
            >
              <div className="text-xl font-bold text-gray-400 w-8">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-100">{user.name}</div>
                <div className="text-sm text-gray-400">
                  Total Streak Score: {user.streakScore}
                </div>
              </div>
              {index < 3 && (
                <div className="text-2xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 
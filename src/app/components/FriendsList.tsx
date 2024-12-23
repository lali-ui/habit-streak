import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  friends: string[];
  pendingRequests: string[];
  streakScore: number;
  email: string;
}

interface FriendsListProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSendRequest: (email: string) => void;
  onAcceptRequest: (userId: string) => void;
  onMessage: (friendId: string) => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({ 
  isOpen, 
  onClose, 
  currentUser,
  onSendRequest,
  onAcceptRequest,
  onMessage
}) => {
  const [email, setEmail] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getFriendData = (friendId: string): User => {
    return {
      id: friendId,
      name: `Friend ${friendId}`,
      email: '',
      friends: [],
      pendingRequests: [],
      streakScore: 0
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-100">Friends & Accountability</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {currentUser.friends.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <svg 
              className="w-12 h-12 mx-auto mb-3 text-gray-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
            <p className="text-sm mb-4">
              Add friends to stay motivated and accountable together
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentUser.friends.map(friendId => {
              const friend = getFriendData(friendId);
              return (
                <div 
                  key={friend.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg
                    border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-400/10 text-yellow-400
                      flex items-center justify-center font-medium">
                      {friend.name[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="text-gray-200">{friend.name}</span>
                      <div className="text-sm text-gray-400">
                        {friend.streakScore} day streak
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onMessage(friend.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400
                        hover:text-gray-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSendRequest(email);
            setEmail('');
          }}
          className="flex gap-2 mb-6"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Friend's email..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300"
          >
            Add
          </button>
        </form>

        {currentUser.pendingRequests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-100 mb-3">Pending Requests</h3>
            <div className="space-y-2">
              {currentUser.pendingRequests.map(request => (
                <div 
                  key={request}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50"
                >
                  <span className="text-gray-300">{request}</span>
                  <button
                    onClick={() => onAcceptRequest(request)}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 
import { Crown, Shield, User, UserMinus } from 'lucide-react';
import { useRoomStore } from '../stores/roomStore';
import { useUserStore } from '../stores/userStore';
import { ROLES } from '../utils/constants';
import socketService from '../services/socketService';

const ParticipantList = () => {
  const { participants, roomCode, hostId } = useRoomStore();
  const { currentUser } = useUserStore();

  const isHost = currentUser?.clerkId === hostId;

  const getRoleIcon = (role) => {
    switch (role) {
      case ROLES.HOST:
        return <Crown className="w-4 h-4 text-warning" />;
      case ROLES.MODERATOR:
        return <Shield className="w-4 h-4 text-info" />;
      default:
        return <User className="w-4 h-4 text-base-content" />;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      [ROLES.HOST]: 'badge-warning',
      [ROLES.MODERATOR]: 'badge-info',
      [ROLES.PARTICIPANT]: 'badge-ghost'
    };
    return badges[role] || 'badge-ghost';
  };

  const handleRoleChange = (userId, newRole) => {
    if (!isHost || userId === currentUser?.clerkId) return;
    socketService.assignRole(roomCode, userId, newRole);
  };

  const handleRemoveParticipant = (userId) => {
    if (!isHost || userId === currentUser?.clerkId) return;
    if (confirm('Remove this participant from the room?')) {
      socketService.removeParticipant(roomCode, userId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-base-200 rounded-lg">
      <div className="p-4 border-b border-base-300">
        <h3 className="font-semibold text-lg">
          Participants ({participants.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {participants.map((participant) => {
          const isCurrentUser = participant.userId === currentUser?.clerkId;
          const canManage = isHost && !isCurrentUser;

          return (
            <div
              key={participant.userId}
              className="flex items-center gap-3 p-3 bg-base-300 rounded-lg hover:bg-base-100 transition-colors"
            >
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10">
                  <span className="text-sm">{participant.username[0].toUpperCase()}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {participant.username}
                  {isCurrentUser && <span className="text-xs opacity-70 ml-2">(You)</span>}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleIcon(participant.role)}
                  {canManage ? (
                    <select
                      value={participant.role}
                      onChange={(e) => handleRoleChange(participant.userId, e.target.value)}
                      className="select select-xs select-bordered"
                    >
                      <option value={ROLES.PARTICIPANT}>Participant</option>
                      <option value={ROLES.MODERATOR}>Moderator</option>
                    </select>
                  ) : (
                    <span className={`badge badge-sm ${getRoleBadge(participant.role)}`}>
                      {participant.role}
                    </span>
                  )}
                </div>
              </div>

              {canManage && (
                <button
                  onClick={() => handleRemoveParticipant(participant.userId)}
                  className="btn btn-ghost btn-sm btn-square text-error"
                  title="Remove participant"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantList;

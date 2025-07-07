import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import Modal from "./Modal";
import "./JoinRequestModal.css";

interface JoinRequestModalProps {
  campaignId: string;
  campaignName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const JoinRequestModal: React.FC<JoinRequestModalProps> = ({
  campaignId,
  campaignName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useUser();
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user's database ID
  const userRecord = useQuery(api.users.getUserByClerkId, 
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get user's characters
  const userCharacters = useQuery(
    api.characters.getCharactersByUserId,
    userRecord?._id ? { userId: userRecord._id } : "skip"
  );

  // Get user's existing join requests for this campaign
  const existingRequests = useQuery(
    api.joinRequests.getJoinRequestsByUser,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const createJoinRequest = useMutation(api.joinRequests.createJoinRequest);

  // Check if user already has a pending or approved request for this campaign
  const hasExistingRequest = existingRequests?.some(
    request => request.campaignId === campaignId && 
    (request.status === "PENDING" || request.status === "APPROVED")
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCharacterId) {
      setError("Please select a character");
      return;
    }

    if (!user?.id || !userRecord?._id) {
      setError("User information not available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createJoinRequest({
        campaignId: campaignId as any,
        requesterUserClerkId: user.id,
        requesterUserId: userRecord._id,
        playerCharacterId: selectedCharacterId as any,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create join request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSelectedCharacterId("");
      onClose();
    }
  };

  // Don't render if user already has a request
  if (hasExistingRequest) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Request to Join: ${campaignName}`}
    >
      <div className="join-request-modal">
        <form onSubmit={handleSubmit} className="join-request-form">
          <div className="form-section">
            <h3>Select Your Character</h3>
            <p className="form-description">
              Choose which character you'd like to play in this campaign.
            </p>
            
            {userCharacters && userCharacters.length > 0 ? (
              <div className="character-selection">
                {userCharacters.map((character) => (
                  <div
                    key={character._id}
                    className={`character-option ${
                      selectedCharacterId === character._id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedCharacterId(character._id)}
                  >
                    <div className="character-info">
                      <h4>{character.name}</h4>
                      <p className="character-details">
                        Level {character.level} {character.race} {character.class}
                      </p>
                      <p className="character-stats">
                        HP: {character.hitPoints} | AC: {character.armorClass}
                      </p>
                    </div>
                    <div className="character-selector">
                      <input
                        type="radio"
                        name="character"
                        value={character._id}
                        checked={selectedCharacterId === character._id}
                        onChange={() => setSelectedCharacterId(character._id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-characters">
                <p>You don't have any characters yet.</p>
                <button
                  type="button"
                  className="create-character-button"
                  onClick={() => {
                    // Navigate to character creation with return parameter
                    window.location.href = "/characters?create=true&returnTo=join-request";
                  }}
                >
                  Create a Character
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="cancel-button"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading || !selectedCharacterId}
            >
              {isLoading ? "Sending Request..." : "Send Join Request"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default JoinRequestModal; 
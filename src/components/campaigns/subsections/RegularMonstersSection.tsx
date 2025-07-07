import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useCollapsibleSection } from "../../../hooks/useCollapsibleSection";
import { useNavigationState } from "../../../hooks/useNavigationState";
import EntitySelectionModal from "../../modals/EntitySelectionModal";
import MonsterCreationModal from "../../modals/MonsterCreationModal";
import "./RegularMonstersSection.css";

interface RegularMonstersSectionProps {
  campaignId: Id<"campaigns">;
  monsterIds?: Id<"monsters">[];
  onUpdate: () => void;
  canAdd?: boolean;
  canUnlink?: boolean;
}

type ModalType = "entitySelection" | "monsterCreation" | null;

const RegularMonstersSection: React.FC<RegularMonstersSectionProps> = ({
  campaignId,
  monsterIds = [],
  onUpdate,
  canAdd = false,
  canUnlink = false,
}) => {
  const { user } = useUser();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const { isCollapsed, toggleCollapsed } = useCollapsibleSection(
    `regular-monsters-${campaignId}`,
    false
  );
  const { navigateToDetail } = useNavigationState();

  const monsters = useQuery(api.monsters.getAllMonsters);
  const updateCampaign = useMutation(api.campaigns.updateCampaign);

  // Filter for regular monsters (CR < 10)
  const campaignRegularMonsters = monsters?.filter(monster => 
    monsterIds.includes(monster._id) && 
    parseFloat(monster.challengeRating) < 10
  ) || [];

  const openEntitySelection = () => {
    setActiveModal("entitySelection");
  };

  const openMonsterCreation = () => {
    setActiveModal("monsterCreation");
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleEntitySelect = async (entityId: Id<any>) => {
    if (!user?.id) {
      alert("You must be logged in to perform this action.");
      return;
    }
    
    try {
      const currentMonsters = monsterIds || [];
      await updateCampaign({ 
        id: campaignId,
        clerkId: user.id,
        monsterIds: [...currentMonsters, entityId] 
      });
      onUpdate();
    } catch (error) {
      console.error("Error linking monster:", error);
      alert("Failed to link monster. Please try again.");
    }
    
    closeModal();
  };

  const handleMonsterCreated = async (monsterId: Id<"monsters">) => {
    if (!user?.id) {
      alert("You must be logged in to perform this action.");
      return;
    }
    
    try {
      const currentMonsters = monsterIds || [];
      await updateCampaign({ 
        id: campaignId,
        clerkId: user.id,
        monsterIds: [...currentMonsters, monsterId] 
      });
      onUpdate();
      alert("Monster created and linked successfully!");
    } catch (error) {
      console.error("Error linking monster:", error);
      alert("Monster created but failed to link. You can link it manually.");
    }
    
    closeModal();
  };

  const handleUnlinkEntity = async (entityId: Id<any>) => {
    if (!user?.id) {
      alert("You must be logged in to perform this action.");
      return;
    }
    
    try {
      const currentMonsters = monsterIds || [];
      await updateCampaign({ 
        id: campaignId,
        clerkId: user.id,
        monsterIds: currentMonsters.filter(id => id !== entityId) 
      });
      onUpdate();
    } catch (error) {
      console.error("Error unlinking monster:", error);
      alert("Failed to unlink monster. Please try again.");
    }
  };

  const handleMonsterClick = (monsterId: Id<"monsters">) => {
    navigateToDetail(`/monsters/${monsterId}?campaignId=${campaignId}`);
  };

  return (
    <div className="regular-monsters-section">
      <div className="section-header">
        <div className="header-left clickable" onClick={toggleCollapsed}>
          <button 
            className="collapse-button"
            onClick={(e) => e.stopPropagation()}
            aria-label={isCollapsed ? "Expand regular monsters section" : "Collapse regular monsters section"}
          >
            {isCollapsed ? "▶️" : "▼"}
          </button>
          <h3 className="section-title">🐺 Regular Monsters ({campaignRegularMonsters.length})</h3>
        </div>
        <div className="header-actions" onClick={(e) => e.stopPropagation()}>
          {canAdd && (
            <>
              <button 
                className="add-button"
                onClick={openEntitySelection}
              >
                + Link Monster
              </button>
              <button 
                className="add-button"
                onClick={openMonsterCreation}
              >
                + Create Monster
              </button>
            </>
          )}
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="section-content">
          {campaignRegularMonsters.length > 0 ? (
            <div className="entities-grid">
              {campaignRegularMonsters.map((monster: any) => (
                <div key={monster._id} className="entity-card">
                  <div 
                    className="entity-info clickable"
                    onClick={() => handleMonsterClick(monster._id)}
                  >
                    <h4 className="entity-name">{monster.name}</h4>
                    <p className="entity-description">
                      {monster.size} {monster.type} (CR {monster.challengeRating})
                    </p>
                    <span className="entity-cr">Challenge Rating: {monster.challengeRating}</span>
                  </div>
                  <div className="entity-actions">
                    {canUnlink && (
                      <button 
                        className="unlink-button"
                        onClick={() => handleUnlinkEntity(monster._id)}
                      >
                        Unlink
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No regular monsters (CR &lt; 10) added to this campaign yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {activeModal === "entitySelection" && (
        <EntitySelectionModal
          isOpen={true}
          onClose={closeModal}
          onSelect={handleEntitySelect}
          entityType="monsters"
          title="Link Existing Monster (CR < 10)"
          currentLinkedIds={monsterIds}
        />
      )}

      {activeModal === "monsterCreation" && (
        <MonsterCreationModal
          isOpen={true}
          onClose={closeModal}
          onSuccess={handleMonsterCreated}
        />
      )}
    </div>
  );
};

export default RegularMonstersSection; 
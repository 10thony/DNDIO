# Requirements Document

## Introduction

The live interaction system is a comprehensive enhancement to the D&D campaign management application that enables real-time, turn-based gameplay between Dungeon Masters (DMs) and players. This system introduces complex relationships between campaigns, timeline events, quests, and interactions, along with a sophisticated UI for managing live gameplay sessions including initiative tracking, turn management, and interactive maps.

## Requirements

### Requirement 1: Database Schema and Relationship Structure

**User Story:** As a DM, I want a structured relationship between campaigns, timeline events, quests, and interactions so that I can organize and manage complex campaign narratives effectively.

#### Acceptance Criteria

1. WHEN a campaign is created THEN the system SHALL ensure it has at least 3 timeline events
2. WHEN a timeline event is created THEN the system SHALL require at least one associated quest
3. WHEN a timeline event is created THEN the system SHALL allow designation of one primary quest
4. WHEN a timeline event status is updated THEN the system SHALL only allow states: idle, in progress, completed
5. WHEN a quest is created THEN the system SHALL require at least one interaction
6. WHEN a quest is created THEN the system SHALL allow association of reward items and completion XP
7. WHEN a quest status is updated THEN the system SHALL only allow states: idle, in progress, completed
8. WHEN an interaction is created THEN the system SHALL only allow states: idle, live, completed
9. WHEN an interaction is created THEN the system SHALL require at least one associated map

### Requirement 2: Initiative and Turn Management System

**User Story:** As a DM, I want an automated initiative system that determines turn order for all participants so that combat flows smoothly and fairly.

#### Acceptance Criteria

1. WHEN an interaction becomes live THEN the system SHALL generate initiative values for all PCs, NPCs, and monsters
2. WHEN initiative is rolled THEN the system SHALL calculate each participant's initiative as (randomly generated whole number from 1-20) + the PC/NPC/monster's dexterity modifier
3. WHEN an interaction has participants THEN the system SHALL maintain lists of monsters, enemy NPCs, and friendly NPCs
4. WHEN a turn is created THEN the system SHALL require a turnOwner reference (PC, NPC, or monster)
5. WHEN a turn is created THEN the system SHALL require an action taken and optional turnTarget
6. WHEN a turn is created THEN the system SHALL include distance available to travel based on the character's speed

### Requirement 3: Quest and Timeline Event State Management

**User Story:** As a DM, I want automatic state transitions for quests and timeline events based on interaction completion so that campaign progression is tracked accurately.

#### Acceptance Criteria

1. WHEN an interaction is marked completed THEN the system SHALL update the associated quest data
2. WHEN a quest has a completed interaction THEN the system SHALL allow the quest to be marked completed or idle
3. WHEN a quest is completed THEN the system SHALL allow the timeline event to be marked completed or idle
4. WHEN a timeline event is active THEN the system SHALL allow designation of a new primary quest
5. WHEN a quest is idle THEN the system SHALL allow a new interaction to be turned live

### Requirement 4: Live Interaction Modal Interface

**User Story:** As a player or DM, I want a comprehensive live interaction interface that provides all necessary tools for turn-based gameplay so that I can participate effectively in combat scenarios.

#### Acceptance Criteria

1. WHEN a live interaction is active THEN the system SHALL display a live interaction modal to all participants
2. WHEN the modal is displayed THEN the system SHALL show an initiative order tab with clickable elements
3. WHEN an initiative element is clicked THEN the system SHALL display the corresponding object's turn tab
4. WHEN it's a participant's turn THEN the system SHALL show only their relevant turn tab based on ownership
5. WHEN the modal is active THEN the system SHALL provide tabs for: initiative order, turn, action, inventory, and map

### Requirement 5: Initiative Order Management

**User Story:** As a DM and player, I want a clear visual representation of turn order so that everyone knows when it's their turn to act.

#### Acceptance Criteria

1. WHEN the initiative order tab is displayed THEN the system SHALL show elements ordered by highest initiative value
2. WHEN an initiative element is displayed THEN the system SHALL show the initiative value and object identification
3. WHEN an initiative element is clicked THEN the system SHALL display the mapped object's turn tab
4. WHEN it's an object's turn THEN the system SHALL highlight the current turn taker in the initiative order

### Requirement 6: Turn Management Interface

**User Story:** As a player or DM, I want intuitive turn management tools so that I can efficiently execute actions during my turn.

#### Acceptance Criteria

1. WHEN a turn tab is displayed THEN the system SHALL show action selection options
2. WHEN a turn tab is displayed THEN the system SHALL show target selection options
3. WHEN a turn tab is displayed THEN the system SHALL show available actions remaining
4. WHEN a turn tab is displayed THEN the system SHALL provide dice rolling functionality with save modifier selection
5. WHEN a user takes a turn THEN the system SHALL only show their owned character's turn tab
6. WHEN a DM takes a turn THEN the system SHALL show the relevant NPC or monster's turn tab

### Requirement 7: Action Management System

**User Story:** As a player or DM, I want to see available actions based on what I've already done this turn so that I understand my remaining options.

#### Acceptance Criteria

1. WHEN the action tab is displayed THEN the system SHALL show all available actions for the current turn taker
2. WHEN actions are displayed THEN the system SHALL consider actions already taken this turn
3. WHEN an action is selected THEN the system SHALL update the available actions list accordingly
4. WHEN the action tab is accessed THEN the system SHALL follow the established action ruleset

### Requirement 8: Inventory and Equipment Management

**User Story:** As a player or DM, I want to manage inventory and equipment during combat so that I can adapt my strategy based on available resources.

#### Acceptance Criteria

1. WHEN the inventory tab is displayed THEN the system SHALL show the character's inventory and equipped items
2. WHEN equipment is managed THEN the system SHALL allow equipping and unequipping (consuming an action)
3. WHEN inventory items are used THEN the system SHALL consume a bonus action
4. WHEN inventory changes are made THEN the system SHALL update the character's stats accordingly

### Requirement 9: Interactive Map System

**User Story:** As a player or DM, I want an interactive map that shows all participant positions and allows movement so that I can make tactical decisions based on positioning.

#### Acceptance Criteria

1. WHEN the map tab is displayed THEN the system SHALL show an interactive map preview component
2. WHEN the map is displayed THEN the system SHALL show locations of all interaction participants
3. WHEN it's a character's turn THEN the system SHALL allow movement based on their speed (5ft per grid cell)
4. WHEN movement is made THEN the system SHALL update the character's position on the map
5. WHEN the map is displayed THEN the system SHALL enforce movement limitations based on character speed

### Requirement 10: Turn Completion and Combat Resolution

**User Story:** As a DM, I want automatic combat resolution when victory conditions are met so that interactions conclude appropriately.

#### Acceptance Criteria

1. WHEN all enemies are defeated THEN the system SHALL mark the interaction as completed
2. WHEN all players are defeated THEN the system SHALL mark the interaction as completed
3. WHEN players surrender THEN the system SHALL allow the DM to mark the interaction as completed
4. WHEN an interaction is completed THEN the system SHALL update quest progression accordingly
5. WHEN combat ends THEN the system SHALL close the live interaction modal

### Requirement 11: Turn Skipping and DM Controls

**User Story:** As a DM, I want the ability to skip player turns and manage NPC/monster actions so that I can maintain game flow and control.

#### Acceptance Criteria

1. WHEN it's a player's turn THEN the system SHALL allow the DM to skip the turn
2. WHEN it's an NPC or monster turn THEN the system SHALL allow the DM to take the turn
3. WHEN the DM manages turns THEN the system SHALL provide access to all NPC and monster turn tabs
4. WHEN turns are skipped THEN the system SHALL advance to the next participant in initiative order
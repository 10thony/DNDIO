Ehancement 1: database schemas and server functionality changes need to be made to implement the functionality detailed blow:
The application has a strong MVP that mostly following the foundations detailed above.
But we need to implement a live interaction system. This requires a number of incremental enhancements to the applications that are detailed below.

This is a good opprotunity to explore how the relationship to the objects should work, we know the basic relationship between a Campaign and the rest of the objects, we know the about the relationship to pcs,npcs,monsters and their inventory/equipment. But now we need to determine a user flow, we have our basic flow where users can create/join campaigns detailed in the foundations. But how do quests, timeline events, and live interactions connect together?


 This is a more complex relationship structure that needs to be layed out.
    A campaign has atleast 3 timeline events.
    A timeline event has a list of associated quests (atleast one),
    A timeline event has one primary quest
    A timeline event can be:
        idle, in progress, completed
    A quest has a list of  interactions (atleast one).
    A quest has a list of reward items.
    A quest has a completion XP reward
    A quest can be:
        idle, in progress, completed
    A interaction can be,
        idle, live, completed.
    A interaction has a dictionary that maps each pcs,npcs,monster to 
        a random numerical value from 1-20 plus the objects dexterity modifier, this is called the initiative order, detailing who takes their turn in what order.
    a interaction has a list of monsters
    a interaction has a list of enemy npcs 
    a interaction has a list of friendly npcs
    a interaction has a list of maps (atleast one)
    a interaction has a list of turns
    
    
    Once a interaction is completed the quest data is updated to reflect that, 
    once a compelted live interaction has been added to a quest, 
    the quest can be marked:
        completed, or 
        the quest can go idle (this usually means the users arent doing anything for this quest at the moment) or
        a new interaction can be turned live.
    Once a timeline event has a quest that is completed it can be marked:
        completed, or 
        the timeline event can go idle (this usually means the users arent doing anything for this quest at the moment) or
        a new quest can be marked primary quest

    With the introduction of a live interaction, we need to describe what that entails
        the need for a new object, a turn. 
        a turn is comproised of:
            a turnOwner which can either be an reference to an instance of a NPC, player character or monster 
            an action taken column that references the action the turnOwner took during the turn
            a turnTarget which is a reference to either an npc, player character or monster that is the target of the action taken by the turn turnOwner.
            a distance available to travel field 

End Enhancement 1.
-----------------------------------
Enhancement 2: The Live interaction UI
Once the database and server functions have been implemented we have a good foundation 
but we need to now build through the actual flow of how a live interaction works

The base flow:
a DM has a campaign that has an interaction set up with all the necessary requirements
a DM selects an interaction to turn live.
the interaction is made live, the DM gets the Live Interaction Modal, and initiative is rolled for all relative obejcts in the interaction.
the player(s) get the live interaction modal and see their tabs with data thats dyanmic according to their specific character.
The DM and Player(s) take their turns respectively, all targeted objects are affected accordingly.
the players either defeat the mobs or are defeated. 
the interaction is marked complete.

the interaction goes through the initiative order, allowing turns to be taken until one side is wiped out or the players surrender.
end of base flow.


so the interaction has the initative order thats used to determine who takes their turn when

DMs take turns for monsters and NPCS (both friendly and enemy)
DMs can skip a users turn 
Users take their turns 

But what does taking a turn look like? we know the structure of a turn, but
how does the user/dm take a turn? 
how is the target of a turn affected? what manages keeping track of that.

well naturally all this happens in the live interaction modal widget.

the live interaction modal has:
    a initiatve order tab,
        this is a component that is a collection of clickable elements that are ordered numerically by highest initiative and each element displays the initiative rolled for the respective object, also eacg clickable element is tied to the object (pc,npc or monster) in the associated slot within the initive order collection, when the element is clicked it displayed the mapped object's turn tab.
    a turn tab,
        this is unique to each object, so each pc, npc, monster, gets a turn tab but only the specific user who "owns" the object sees the tab, so users only see their player character's turn tab, DMs see the respective object(either an npc or monster)'s turn tab when its that objects turn or when the DM clicks on the button in the turn order bar.
        a way to select an action to perform.
        a way to select a target for the action.
        a way to see how many available actions the pc/npc/monster has
        a way to roll a dice (sides specified by the user) against a specific save modifier (strength, constitution etc) this will be used to determine if a pc/npc/monster saves a DC check.
    a action tab,
        this tab shows the list of actions available for the user to take, this takes into consideration the actions already taken (see the actionruleset.txt document for details on the action ruleset).
    a inventory tab,
        this shows the user the object's inventory and equipment, it enables the equipping and unequiping of equipment (which take an action) and the usage of an item in the inventory (which takes a bonus action).
    a map tab,
        this displays an interactive map preview component that shows the location of all the objects in the interaction and enables the current turn taker to move according to their speed (one cell on the map grid = 5ft so if their speed is 20ft they can move 4 cells)
    
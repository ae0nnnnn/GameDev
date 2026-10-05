# TODOs and Reminders

## Reminders
Stuff such as Music and Art is not going to be done until I have learnt how to do it or would be done at at intentionally low quality if i have to do it to move on with something else.

**REMEMBER DO NOT DO ANY SCRIPT EDITING ON ROBLOX STUDIO
USE VISUAL STUDIO CODE  AS WE HAVE MOVED TO ROJO FOR EDITING AND VERSION CONTROL.**

All Scripting Based Issues will be moved to the GitHub <span class="narrator"> - Me when I lie</span>

Remember the theming for the game will be the theatre → this would be the theme for neutral world design such as null spaces like the area the narrator does the warnings at start of the game and also all the UI (however my UI design and Art is so ass that I don't think I can - so basic placeholders for now)

Also, **PLEASE REMEMBER WHEN DOING THE WIND UP FRAMES ACTUALLY MAKE THEM WIND UP** (Do this by making the wind up frame freeze for like 4–5 frames then do the follow through - the freeze should be smaller on med and hvy weapons as they already have a noticeable windup) 

Also, THE SHORTEST A SWING ANIM SHOULD BE IS 0.5 SECS because if its shorter it would be near impossible to consistently parry it


GitHub Link - https://github.com/ae0nnnnn/My-NEA-Game-Hobby
I need to go round and add SFX where it's missing as its one on the things that is making the game feel off to me – if I can't make any sounds – just go to 
[freesound.org](http://freesounds.org)

Use Mixamo and Pinterest for reference work (Animations)  
Use Cmdr for admin commands and server announcements 1
Use ZonePlus 3.2 for POIs when making maps → though it would be ages from now

  
Also found something that i am going to store here  
  
1. If you give an object a highlight with its fill transparency to -1 of any negative number it inverts the colours, and you can actually go past -1 deep into the negatives and this increases the effect  
  
2. If you use tech 1 on a glass object with transparency to 1 and reflectance to 0 anything that is in or viewed through that object gets the colours inverted → this allows to create smooth divisions across one mesh

Ignore the img below  as this is just a note i took from an animation discord server on how to do speed flickers

![[SpeedFlickImg.png]]
## To-dos
Æon :

Animate Judgment 
Redo the Fist Animations - One done  
Model The rest of Asmondaios’ weapons

Figure out how to make cutscenes and grab moves - For Cutscenes use moon animator (actually no i can make the cam rig in blender and use the blender export plugin to export it to studio then in the cutscene activator start the RunService loop or something else that locks the cam to the rig also for the dialogues I just realized something I can “borrow” the dialogue tree system I use for dialogues) or make try to find something in blender (oh I already thought of using blender … oh well)  
Redo all weapon welds based on C0 not C1- (Use the Plugin)

Add wounded running animations 

Add Uppercuts

Make the Movement System(Climbing, wall jumps, double jumps, Wall Runs etc.) - Wall runs are done, Climbing is done

Make the Stats System - Nearly Done

Make the Skills and Classes System 

Finish the Status Effects system - Basically done, but I need to add VFX and some of the other status effects  
Improve the Inventory System = {

Mostly the UI but some functionality can be improved …

 Just fixed a bug where that if you picked a non-stackable item with the same name as one in your inventory the item slot bugged out (fixed by creating a true name and ran name system based on your play name and a random number for example Hat_damiehug_123322) → this is now out of date as I now use a UID system
 
 I might remove the thing that creates extra stacks of an item if you have too many → however I would leave it for now as it's a QoL feature unless the players say that it clogs their inventories – I lied turns out that I deleted this already like good knows when
}

Also, I should also create a warning module that display a warning text when you try to perform an illegal action (Such as trying to change accessories turning a transformation or in combat) – this would also use the custom text module though i would prebake all the phrases when a user joins
  
Start making the other movesets

### Stuff that I should do now!!!

Shrink the size of the DrakeFang’s because it's massive. → actually now that I think about it, it's actually not that large 

Add the trail VFX for weapon swings also improve the weapon VFX for literally everything (however only important weapons such as Exponentia weapons and boss weapons get unique VFX the rest would have the basic trail)

Nerf all weapon damage into the ground because why on earth can I four-shot someone? Especially hvy

  
### Stuff that I can do really quickly and can do in my own time.

Make a blinking highlight for stuff such as counters (Use the existing highlight logic as a base) - also use a billboard GUI for this as well on top the character model’s head - I have finished the highlight blocking 

Also add resting which increases your health regen - all anims are done all is left is to implement it

Make a cooldown manager module based on this (I already use tables rather than `task.wait`, however I want to localize everything, so I don't to dig through the entire codebase) - [https://www.youtube.com/watch?v=_6F6vRt_9sM](https://www.youtube.com/watch?v=_6F6vRt_9sM)

Add got hit effects that are bound by the animation → use Liam’s vid on this unless I decide to just add the hit effect directly to the weapon dictionary rather than having to redo all the swing anims every time I want to adjust the VFX.

Also create the Weapons Object Class as this is going to be the place where a store every weapon's info and where I can finally start hooking their skills such as weapon arts.

Setting a system that keys the slots settings and global settings - I would option to edit global settings and per slot settings. - I have added the fields to template

Speaking of dialogue system I could divide each NPC’s dialogue tree into smaller trees – not necessary I could actually just use conditions nodes the lock paths and responses based on the condition

And use the script node on the root tree to select each variant of each branch when the option is picked – This would be able to handle NPCs with dialogue trees that change based on certain conditions.

I need to add some for characters to the current font maps  
This is the paste : ``0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!Æ;%:?*()_+-=.,/|"'@#$^&{}[]~`\<> -「」``

Add A bit about in game routes the player can take (such as Wrath, Benevolence) 
<span class="narrator"> – might actually scrap tho</span> 







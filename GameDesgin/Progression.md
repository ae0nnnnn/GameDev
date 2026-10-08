# Progression 

## Base Stats and Frame Data
Base hp - 250 - Scaling is done, but it needs to be improved 
Base Stance - 100 (Max should be around 110-120) 
<div class="char-devnote">
[Dev]: - Still need to make it scale with END/VIT 

</div> 
Base Balance Reserves - 250 (Max should be around 450 though i shouldn’t enforce this because if players want to be mages they can do what ever)

Parry frames = 0.22 secs 
Hypr Parry Frames = 0.12
Auto Parry (AP) Frames = 0.3 (I'm just guessing here) secs after a parry however right now they can extend each other → I am going to tweak it that AP frames can only extend themselves once then you have to manually parry the multi-hit again → done
ParryAnimLength and also the stun for whiffing 45 frames at 60fps.

## Weapon Info

### Weapon Refining 

Upgrade stones are required to upgrade your vessel weapon or Resonator 
These do not carry over per Potentia Swap or Weapon Modification for vessels and obviously for only now Resonator

Levels 1-3 require a tier 1 stone
Levels 4-6 require a tier 2 stone
Levels 7-10 require a tier 3 stone
Level MAX requires a tier 4 stone

 Weapon level/damage chart - BASE DMG

|                        | Still Needs adjustin |                 |                |
| ---------------------- | -------------------- | --------------- | -------------- |
| Med - Done  <br>weapon | Heavy  <br>weapon    | Light weapon    | Fist weapon    |
| Lv 1 - 10dmg           | Lv 1 - 20dmg         | Lv 1 - 6dmg     | Lv 1 - 10dmg   |
| Lv 2 - 11dmg           | Lv 2 - dmg           | Lv 2 - 6.6dmg   | Lv 2 - 11dmg   |
| Lv 3 - 12dmg           | Lv 3 - dmg           | Lv 3 - 7.2dmg   | Lv 3 - 12dmg   |
| Lv 4 - 13dmg           | Lv 4 - dmg           | Lv 4 - 7.8dmg   | Lv 4 - 13dmg   |
| Lv 5- 14dmg            | Lv 5 - dmg           | Lv 5 - 8.4dmg   | Lv 5- 14dmg    |
| Lv 6 - 15dmg           | Lv 6 - dmg           | Lv 6 - 9dmg     | Lv 6 - 15dmg   |
| Lv 7 - 16dmg           | Lv 7 - dmg           | Lv 7 - 9.6dmg   | Lv 7 - 16dmg   |
| Lv 8 -17dmg            | Lv 8 - dmg           | Lv 8 - 10.2dmg  | Lv 8 -17dmg    |
| Lv 9 - 18dmg           | Lv 9 - dmg           | Lv 9 - 10.8dmg  | Lv 9 - 18dmg   |
| Lv 10 - 19dmg          | Lv 10 -  dmg         | Lv 10 - 11.4dmg | Lv 10 - 19dmg  |
| Lv MAX - 20dmg         | Lv MAX - 25 dmg      | Lv MAX - 12dmg  | Lv MAX - 20dmg |

### Weapon Data
Swing cooldown
Medium weapon swing cooldown - 0.225 seconds
Heavy weapon swing cooldown- 0.25 seconds
Light weapon swing cooldown - 0.2 seconds
Fists swing cooldown - 0.1 seconds

Range 
<div class="char-devnote">
[Dev]:  -- needs to be done in `Vector3` 

</div> 
Medium weapon - medium range, long rang
Heavy weapon - long range, very long
Light weapon, short range, medium range
Fists - short range, very short

Hitbox frames
<div class="char-devnote">
[Dev]:  -- Needs to be redone as anims are changing

</div> 
Light - Frame 21
Med - Frame 9
Heavy - Frame 10


Windup Frames
Light - Starts 8 ends frame 14
Med 
Heavy

## Character Levelling 

### Stats

Vitality (VIT) → health
Endurance (END) → stamina, 
Strength (STR) →Strength moves
Dexterity (DEX) → Dexterity Moves and crit dmg
Spirit (SPT) → SPT Moves and Spells, Balance Reserves
Agility (AGL) → Speed and AGL (and DEX) scaling moves
Weapon Proficiency (WPN) → M1 damage
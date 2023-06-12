The generic character sheet is not meant to fit to any specific rule system, but instead is meant as a way to track some generic values for various systems, but it will not fit for every game.

# Features

It can track and store data per campaign, can submit dice rolls based on values entered and has free text sections for tracking abilities, known languages and inventory.

Any changes made are immediately stored in the campaign-wide local storage.

## Abilities entry

The "Abilities, Skills, Weapons" section is meant to be filled with anything that can be used as a combat action, be it an ability, a spell, a weapon attack, etc
This can be done in any way that is most comfortable for you to use, however, if you follow the pattern of:
"Name DiceRoll \[Optional Description\]" for each line in the text field each line will be extracted from the text field and shown as an extra UI element with a "roll damage" button using the entered dice roll.
For example if your character has a Rapier and a Dagger to attack with, you can enter:

```
Rapier 1d8+2
Dagger 1d6+2 Can be thrown
```

and both lines will be parsed from the text field to be displayed separately as well,

# Adapting for other systems

The generic character sheet base code is made to be fairly customizable, making it easy to adapt minor things in the sheet. Adding extra fields can be done by simply copying existing ones and renaming them. All input fields need to have a unique ID to be stored and conversely, as soon as they have an ID (and are either an HTML `<input>`, `<button>` or `<textarea>`), they will be stored and reloaded.
You can make the `field-title` label clickable for rolling by adding the HTML attribute `data-dice-type` and adding the dice that should be rolled. By default, clicking will add the accompanying input elements' value as an additive modifier (ie: If the input field has a value set of 3 and the dice type is 1d20, it will create a 1d20+3 roll). If no modifier is desired, add the attribute `data-modifier="no-mod"`, if you want to have a different input field as the modifier, like for an attack roll button that depends on eg: the Strength value set elsewhere, set the `data-modifier` value to the id of the input field you want to get the value from, eg: `data-modifier="str"`.

The description (`field-desc`) label is simply for readability/understandability and can be omitted if deemed unnecessary.

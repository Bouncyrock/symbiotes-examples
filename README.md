# Symbiotes Examples

This repository contains a number of examples for how to create web view "Symbiotes".
It should serve as inspiration for what is possible and as code examples for how to use and interact with our TaleSpire API.
The examples here are mostly proof of concepts and while they may have their own merit to use, they are not fleshed out in a way that is conductive to actual game use.

The full Symbiotes documentation is available as a [website](https://symbiote-docs.talespire.com) or as a [Symbiote](https://github.com/Bouncyrock/symbiotes-docs) itself to be installed in TaleSpire.

# Install Examples

To use Symbiotes, you need to activate the feature in the settings. As these examples are intended as documentation for developing your own, you will likely also want to activate development mode to be able to connect the Chromium debugging tools to the embedded browser.
To install the examples simply go to the Symbiote directory located at `%AppData%\..\LocalLow\BouncyRock Entertainment\TaleSpire\Symbiotes` by either navigating there manually or pressing the "Open Symbiotes Directory" button in the game settings or the Symbiotes side panel.
Each Symbiote should be in its own folder and contain one `manifest.json`.

# Feature List

The following is a list of which features are shown off in which examples.

- TaleSpire theme colors and fonts are used in all examples utilizing local webpages (that are completely stored on disk instead of online on some server): [Generic Character Sheet](Generic_Sheet/), [Language Chat](Language_Chat/), [Notes Handout](Notes_Handout/), [Dice Roller](Dice_Roller/), [Slab Stats](Slab_Stats/), [Selection Info](Selection_Info/)
- TaleSpire UI Icons: [Generic Character Sheet](Generic_Sheet/), [Slab Stats](Slab_Stats/), [Selection Info](Selection_Info/)
- Local Storage: [Generic Character Sheet](Generic_Sheet/), [Language Chat](Language_Chat/)
- Dice Rolls: [Generic Character Sheet](Generic_Sheet/), [Dice Roller](Dice_Roller/)
- Chat: [Language Chat](Language_Chat/)
- Data sync: [Notes Handout](Notes_Handout/)
- Player management: [Language Chat](Language_Chat/)
- Client management: [Notes Handout](Notes_Handout/)
- Board switch handling: [Slab Stats](Slab_Stats/)
- Creature info: [Selection Info](Selection_Info/)
- Handling content pack metadata: [Slab Stats](Slab_Stats/), [Selection Info](Selection_Info/)
- Permissions: [Notes Handout](Notes_Handout/)
- Symbiote debug log: [Generic Character Sheet](Generic_Sheet/), [Language Chat](Language_Chat/)
- Initialize Event: [Generic Character Sheet](Generic_Sheet/), [Language Chat](Language_Chat/), [Notes Handout](Notes_Handout/), [Selection Info](Selection_Info/)
- Dice Finder extra: [Dice Finder](Dice_Finder/)
- Inject custom JS/CSS: [Website Viewer](Website_Viewer/), [Dice Finder](Dice_Finder/)

# Example List

| Name | Description | Used Features |
| ---- | ----------- | ------------- |
| [Generic Character Sheet](Generic_Sheet/) | A basic character sheet for no specific system | TS Theme Colors, Font & Icons, Dice Rolls, Storage, Debug, Init Event, Description File |
| [PDF Reader](PDF_Reader/) | Loading a PDF into Symbiote | Load other local resource |
| [Minimal Website Viewer](Minimal_Website_Viewer/) | Load an online (non-local) website | Link to online resource |
| [Website Viewer](Website_Viewer/) | Load an online (non-local) website | Link to online resource, Inject JS, Browser controls |
| [Language Chat](Language_Chat/) | A chat tool that allows sending messages with languages that look like gibberish to players who don't know the language | TS Theme Colors, Clients in board, Chat, Subscriptions |
| [Notes Handout](Notes_Handout/) | A tool for sending stylized notes & web images to other clients | TS Theme Colors & Font, Client management, Sync Messages & Subscriptions, Player Permissions, Notifications, Run in background, Description File |
| [Dice Roller](Dice_Roller/) | A dice group composer that allows to roll with advantage and disadvantage | TS Theme Colors & Font, Dice Rolls & Subscriptions, Run in background, Description File |
| [Slab Stats](Slab_Stats/) | An overview of certain stats of a slab | TS Theme Colors & Font, Subscriptions, Slab unpacking & parsing, Load TS Thumbnails & Icons, Board switch handling |
| [Selection Info](Selection_Info/) | An overview of minis in a selection | TS Theme Colors & Font, Load TS Thumbnails & Icons |
| [Dice Finder](Dice_Finder/) | A demonstration of adding the Dice Finder extra to pages | Dice Finder Extra, Inject JS |

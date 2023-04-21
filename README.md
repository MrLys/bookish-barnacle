# Add system shortcut
## For GNOME
Use dconf-editor to set up the custom shortcut. If you don't have it, install it first:

sudo apt-get install dconf-editor
Open dconf-editor and navigate to org.gnome.settings-daemon.plugins.media-keys. Edit the custom-keybindings setting and add a new custom keybinding. E.g., if the value is ['/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/'], you will add another:

['/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/', '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom1/']
With the new keybinding added, navigate to the corresponding location: org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom1/.

Set the name to a descriptive title, command to the path of your Electron app executable, and binding to '<Super>s' (which represents <META-S>).

Please note that GNOME requires the Electron app to be compiled/bundled as an executable or script that can be run with a single command.

## For KDE
Open System Settings and navigate to "Shortcuts" > "Custom Shortcuts".

Click the "Edit" button, then click "New" > "Global Shortcut" > "Command/URL".

Give the new shortcut a descriptive title, click the "Trigger" tab, and press <META-S> in the "Shortcut" input field.

Click the "Action" tab and add the command to run your Electron app. To run an Electron app in development, you will need to enter the command to execute the main script, like electron /path/to/your/app/main.js. If your app is bundled, you can simply enter the path to the executable.

Click "Apply" to save the changes.

Please make sure you compile/bundle the Electron app if needed, and replace the placeholders in the commands with the correct file paths.

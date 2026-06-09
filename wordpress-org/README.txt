WordPress.org Plugin Directory assets
======================================

Upload the contents of the assets/ folder to your plugin SVN /assets directory
(not inside the plugin ZIP).

Files:
  banner-772x250.png  — Directory page banner (from clearweb-plugin-banner.png)
  icon-256x256.png    — Plugin icon (from clearweb-icon.png)
  screenshot-1.png    — Screenshot 1 in readme.txt
  screenshot-2.png    — Screenshot 2 in readme.txt
  screenshot-3.png    — Screenshot 3 in readme.txt

Replace screenshot-2.png and screenshot-3.png with real UI captures when available.

Listing is optimized for Israeli businesses — readme includes Hebrew FAQs and terms
תוסף נגישות / תוסף הנגשה for WordPress.org search discoverability.

SVN example (after plugin approval):
  svn co https://plugins.svn.wordpress.org/clearweb-accessibility-add-on
  cp wordpress-org/assets/* clearweb-accessibility-add-on/assets/
  svn add assets/*
  svn ci -m "Add banner, icon, and screenshots"

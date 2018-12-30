# ytDownloader
A simple userscript for downloading Youtube Videos.  
This script doesn't require any external scripts or libraries, the code you see is the code you get, everything is done locally within _your_ browser.

## Installation
Simply install one of the following: Greasemonkey [[F][FF Greasemonkey]], Violentmonkey [[F][FF Violentmonkey]][[C][Ch Violentmonkey]], Tampermonkey [[F][FF Tampermonkey]][[C][Ch Tampermonkey]]  
Click this link: [ytDownloader.user.js](https://github.com/xmillsa/ytDownloader/raw/master/src/ytDownloader.user.js)  
Your chosen add-on should then provide you with an install option, simply follow the instructions.

## Usage
Once installed, head over to Youtube and you'll find a "Download Links" button underneath the video, click this and it will show you a list of all the _video_ & _audio_ files available to download.  
Simply right-click on your desired file and click save-as.  
This script is very lightweight and should have a minimal performance impact, if any.  
This script should download the files relatively quickly as it downloads the files in chunks and then combines them together for download, this helps to bypass Youtubes streaming bandwidth buffer.  
If you encounter any issues whilst using this script please [let me know](https://github.com/xmillsa/ytDownloader).  

## Limitations
Due to the nature of Youtube, many of the videos you watch with a quality of 480p or higher, are actually separate Audio and Video files played simultaneously, so while this script will grant you the ability to download all of these files separately, it cannot merge them into one file.  
Video quality of 360p and lower are combined Audio and Video files as you would normally expect.

[FF Greasemonkey]: https://addons.mozilla.org/en-GB/firefox/addon/greasemonkey/ "Greasemonkey for Firefox"
[FF Violentmonkey]: https://addons.mozilla.org/en-GB/firefox/addon/violentmonkey/ "Violentmonkey for Firefox"
[FF Tampermonkey]: https://addons.mozilla.org/en-GB/firefox/addon/tampermonkey/ "Tampermonkey for Firefox"
[Ch Violentmonkey]: https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag "Violentmonkey for Chrome"
[Ch Tampermonkey]: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo "Tampermonkey for Chrome"
# ytDownloader
A simple userscript for downloading Youtube Videos.  
This script doesn't require any external scripts or libraries, the code you see is the code you get, everything is done locally within your browser.

It's very lightweight and should have a minimal performance impact.  
If there are any issues please let me know.  

This script should download the files relatively quickly as it downloads the files in chunks and then combines them togther for download, this helps to bypass Youtubes streaming bandwidth buffer.

## Installation
Simply install one of the following: greasemonkey, tampermonkey, violentmonkey.  
Click this link: [ytDownloader.user.js](https://github.com/xmillsa/ytDownloader/raw/master/src/ytDownloader.user.js)  
Your chosen addon should then provide you with an install option, simply follow the instructions.

## Usage
Once installed, head over to Youtube and you'll find a "Download Links" button underneath the video, click this and it will show you a list of all the _video_ & _audio_ files available to download.  
Simply right-click on your desired file and click save-as.

## Limitations
Due to the nature of Youtube, many of the videos you watch with a quality of 480p or higher, will actually be a seperate Audio and Video file, so while this script will grant you the ability to download all of these seperately, it cannot merge them.  
Video quality of 360p and lower are combined Audio and Video files as you would normally expect.
# ytDownloader
A simple userscript for downloading Youtube Videos.  
This script doesn't require any external scripts or libraries, the code you see is the code you get, everything is done locally within _your_ browser.

## Installation
Simply install one of the following: Greasemonkey [[ff][FF Greasemonkey]], Violentmonkey [[ff][FF Violentmonkey]][[ch][Ch Violentmonkey]], Tampermonkey [[ff][FF Tampermonkey]][[ch][Ch Tampermonkey]]  
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

---
---
## Do not post issues about the following

### FFmpeg, a workaround
There is a way to get around the limitation of a separate video and audio file, simply use FFmpeg!  
Now of course, this does require a little bit of effort on your behalf, just follow the following guide.  

This "guide" is adapted from my own website, [test-videos.co.uk][My FFmpeg Setup]  
Note this is based on a Windows machine, those of you on Linux should already know how to use FFmpeg... right?  

#### Quick Guide
- [Download FFmpeg for Windows](https://ffmpeg.zeranoe.com/builds/ "Zeranoe FFmpeg Builds, Download Page")
- Extract the contents of the downloaded Zip file using your prefered Zip extraction tool.
- Move the main `ffmpeg.exe` binary file, (you will find it located in the bin folder) to _any_ folder you like, I normally use `C:\FFmpeg`.
- Once you've done that, create a new file called `ytCombine.bat` in the same location you just put `ffmpeg.exe`.
- Edit that file using notepad (**do not use MS Word or even an alternative, they will not work and cause you problems**).
- Simply copy the following script into your new ytCombine.bat and hit save.

```
@echo off
setlocal EnableDelayedExpansion

set _dir=%~dp0

%_dir%ffmpeg.exe -i %1 -i %2 -c:v copy -c:a copy "%~dpn1-combined.mkv"

endlocal
```

To use, simply download your chosen Video only file, and Audio only file, select both of them and drag and drop onto your newly created ytCombine.bat file and hopefully in a very short amount of time, new file will be created that contains both the Video and Audio combined!  
The created file will be an MKV file, this is simply because the MKV container supports many different types of codecs, making this script very easy to use.

[FF Greasemonkey]: https://addons.mozilla.org/en-GB/firefox/addon/greasemonkey/ "Greasemonkey for Firefox"
[FF Violentmonkey]: https://addons.mozilla.org/en-GB/firefox/addon/violentmonkey/ "Violentmonkey for Firefox"
[FF Tampermonkey]: https://addons.mozilla.org/en-GB/firefox/addon/tampermonkey/ "Tampermonkey for Firefox"
[Ch Violentmonkey]: https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag "Violentmonkey for Chrome"
[Ch Tampermonkey]: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo "Tampermonkey for Chrome"
[My FFmpeg Setup]: https://test-videos.co.uk/posts/my-ffmpeg-setup
// ==UserScript==
// @name        Xmillsa's Youtube Downloader
// @version     0.2.3
// @namespace   https://andys-net.co.uk/
// @homepageURL https://andys-net.co.uk/
// @license     GPL-3.0-or-later; https://spdx.org/licenses/GPL-3.0-or-later.html
// @author      Andy Mills
// @description A simple script to enable in browser downloading of Youtube videos, no external scripts required.
// @icon        https://github.com/xmillsa/ytDownloader/raw/master/ytD-icon.png
// @grant       none
// @match       https://www.youtube.com/*
// ==/UserScript==

(function (){
    "use strict";

    let currURL = window.location.href,
        prevURL = '';

    // Always check the URL for changes.
    setInterval( checkURL, 250 );

    /*
        Keep an eye on the URL for any changes, if it changes, run the main function.
    */
    function checkURL(){
        // Current URL.
        currURL = window.location.href;
        // Has it changed?
        if ( prevURL !== currURL ){
            // Match the previous and current URLs so we don't loop forever and ever!
            prevURL = window.location.href;
            // Lets begin.
            main();
        }
    }

    /*
        The main function, everything is done through this function.
        First we check if we're on the correct page,
        Add some custom CSS styles,
        Create the container for our links,
        Grab the video ID from the URL,
        Fetch the videos details and await its arrival,
        Turn that data into something usable,
        Create the actual links and visible data.
    */
    async function main(){
        try{
            // Check we're on the correct page.
            if ( window.location.href.includes( 'watch?v=' ) ){

                // Add some styling.
                addCss();

                // Create our container/button.
                createContainer();

                // Get the current video ID from the URL.
                const videoID = /(?:\?v=)(.*?)(?:&|$)/i.exec(window.location.search)[1],
                      data    = await fetch( `https://www.youtube.com/get_video_info?video_id=${videoID}&el=detailpage`, { method: 'GET' } )
                                      .then( response => response.text() ),
                      // Parse the data so we can use it.
                      json    = parseData( data );

                // Create the links.
                createLinks( json );
            } else {
                // Must be a page with no video.
            }
        }
        catch( e ){
            /*
                Errors, errors everywhere!
                Not really, but something went wrong...
            */
            console.log( e );
        }
    }

    /*
        Grabs the required sections of data from the fetch response.
        We only require the "player_response" section, once found, turn it into JSON for easy use.
    */
    function parseData( data ){
        const captured = /(?:player_response=)(.*?)(?:&|$)/i.exec( data )[ 1 ],
              json     = JSON.parse(decodeURIComponent( captured ) );

        return json;
    }

    /*
        This creates a container for basically everything regarding this script.
        First ensure it doesn't already exist, (if it does we simply reset it),
        Create the container element, set some basic attributes,
        Add an event listener on the button to show/hide the links,
        Add the container to the page.
    */
    async function createContainer(){
        // Check it's not already been created.
        if ( document.getElementById( 'yt-container' ) === null ){
            const target  = await findTheTarget( '#primary #player' ),
                  div     = document.createElement( 'div' );

            // Set the div's attributes.
            div.id        = 'yt-container';
            div.className = 'style-scope ytd-watch-flexy';
            div.innerHTML = '<button id="linksButton">Download Links</button><div id="yt-links"><div><div><h3>Video & Audio Combined</h3><div id="combined"></div></div></div><div class="flex"><div><h3>Video Only - No Audio</h3><div id="seperate-video"></div></div><div><h3>Audio Only - No Video</h3><div id="seperate-audio"></div></div></div><div class="center footer flex"><div>Left Click = Potentially Quicker Download</div><div>Right Click -> Save As = Normal Download</div></div>';

            div.getElementsByTagName( 'button' )[ 0 ].addEventListener( 'click', () => {
                // Do some magic to allow for a variable number of links. (overall container height)
                if ( div.classList.contains( 'open' ) === false ){
                    let currentHeight = div.clientHeight;
                    // Work out required height.
                    // Temporarily disable transitions.
                    div.style.transitionDuration = '0s';
                    // Set height to auto, and store it's height.
                    div.style.height = 'auto';
                    let setHeight = div.clientHeight;
                    // Set height back to it's original height.
                    div.style.height = currentHeight +'px';
                    // Force a redraw otherwise it simply wont work.
                    div.offsetHeight;
                    // Re-enable transitions.
                    div.style.transitionDuration = '';
                    // Tell it the new height we worked out. (the transition takes care of the rest)
                    div.style.height = setHeight +'px';
                } else {
                    // Use CSS styling.
                    div.removeAttribute( 'style' );
                }
                div.classList.toggle( 'open' );
            });

            target.parentNode.insertBefore(div, target.nextSibling);
        } else {
            // It already exists, just reset it.
            // Remove inline styles.
            document.querySelector( '#yt-container' ).removeAttribute( 'style' );
            // Remove all class.
            document.querySelector( '#yt-container' ).removeAttribute( 'class' );
            // Empty the #combined div.
            document.querySelector( '#yt-container #combined' ).innerText = '';
            // Empty the #separate div.
            document.querySelector( '#yt-container #seperate-audio' ).innerText = '';
            // Empty the #separate div.
            document.querySelector( '#yt-container #seperate-video' ).innerText = '';
        }
    }

    /*
        This simply finds the requested target, used as a promise to allow async waiting.
        Probably overkill but it just felt right making it this way.
        Will simply wait... forever, until the target is found.
        This hasn't been tested for forced errors / never finding it's target, so could potentially break, working so far...
    */
    function findTheTarget( target ){
        return new Promise( resolve => {
            // Look for our target.
            const findingInt = setInterval( () => {
                if (document.querySelector( target ) !== null){
                    clearInterval( findingInt );
                    resolve( document.querySelector( target ) );
                } else {
                    // Can't find the target.
                }
            }, 500 );
        });
    }

    /*
        Creates all the information and download links for the parsed JSON data.
        Stores the 2 types of videos, "formats" and "adaptive" into arrays,
        will then sort those into ascending order of "contentLength" (Filesize),
        then simply loops through the arrays, sends each entry to the "displayInfo" function,
        then adds the returned element to the page.
    */
    async function createLinks( json ){
        // Store video details.
        const details       = json.videoDetails,
              // Store the combined video formats.
              formats       = json.streamingData.formats,
              // Store the seperate video & audio formats.
              adaptive      = json.streamingData.adaptiveFormats,
              // Store Video only.
              adaptiveVideo = [],
              // Store Audio only.
              adaptiveAudio = [];

        let row, target, i = 0;
        // Loops through the adaptive array and stores the audio and video links separately.
        for( ; i < adaptive.length; i++ ){
            if ( adaptive[ i ].mimeType.split( ';' )[ 0 ].split( '/' )[ 0 ] === 'audio' ){
                // Send to Audio only array.
                adaptiveAudio.push( adaptive[ i ] );
            } else {
                // Send to video only array.
                adaptiveVideo.push( adaptive[ i ] );
            }
        }

        // Sorts the "formats", "adaptiveVideo" and "adaptiveAudio" arrays by their content length (filesize) and their mimetype.
        simpleSort( formats );
        simpleSort( adaptiveVideo );
        simpleSort( adaptiveAudio );

        function simpleSort( anArray ){
            // Sorts the "formats" array by content length (filesize)
            anArray.sort(( a, b ) => {
                return parseInt( b.contentLength ) - parseInt( a.contentLength );
            });
            // Sort by mimetype.
            anArray.sort(( a, b ) => {
                let am = a.mimeType.split( ';' )[ 0 ].split( '/' )[ 1 ],
                    bm = b.mimeType.split( ';' )[ 0 ].split( '/' )[ 1 ];
                if ( am < bm )return -1;
                if ( am > bm )return 1;
                return  0;
            });
        }

        /*
            Loop through the previously made, now sorted arrays and display the required information.
        */
        displayInformation( '#yt-container #combined', formats );
        displayInformation( '#yt-container #seperate-audio', adaptiveAudio );
        displayInformation( '#yt-container #seperate-video', adaptiveVideo );

        async function displayInformation( query, array ){
            let i = 0;
            target = await findTheTarget( query );
            for( ; i < array.length; i++ ){
                if ( row = displayInfo( array[ i ], details ) ){
                    target.appendChild( row );
                }
            }
            openCloseTrick();
        }
    }

    /*
        If the list is opened before being populated, this will trick it into re-opening to show the now added links.
        If the list is closed, it will look like nothing happened.
        Simply uses the click event which fires its open/close action, it works out its required height on open, hence why we do this.
    */
    function openCloseTrick(){
        const target = document.getElementById( 'linksButton' );
        target.click();
        target.click();
    }

    /*
        Turns the individual JSON entry into a div row for displaying on page.
        Get all the vars, quality, mimetype & size.
        Work out "3gp" and "m4a" separately, all the others can be extracted from the mimetype entry itself,
        Create the div row element with the extracted data.
        return the div.
    */
    function displayInfo( data, details ){
        const row  = document.createElement( 'div' ),
              size = Number( data[ 'contentLength' ] / 1024 / 1024 ).toFixed(2);

        let qual = data[ 'qualityLabel' ],
            type = data[ 'mimeType' ].split( ';' )[ 0 ].split( '/' )[ 1 ];

        /*
            Check if the size is a number!
            If there is no contentLength within the original data from Youtube, the video doesn't seem to work / even exist, even though Youtube seems to think it does.
            For now, just don't display the links, may need to re-check this in the future in-case this is just a temporary bug.
        */
        if ( isNaN( size ) ){
            return false;
        }

        // Convert to Kbs for easier reading. (audio only)
        if ( qual === undefined ){
            qual = String( Number( data[ 'averageBitrate' ] / 1024 ).toFixed( 0 ) ) +' Kbs';
        }

        row.className = 'row';
        row.innerHTML = `<div class="right">${size} MB</div>
                         <div class="center">${qual} - ${type}</div>
                         <div class="left"><a class="falseLink" href="${ data[ 'url' ] }">Download</a></div>`;

        // Create "link" for downloading.
        let a = document.createElement( 'a' );
        a.innerText = 'Download';
        a.className = 'falseLink';

        // Listen to clicks, once clicked start the download process.
        row.getElementsByTagName( 'a' )[ 0 ].addEventListener( 'click', ( e ) => {
            e.preventDefault();
            // Show an indication that the download has started in the background.
            e.target.className = 'inProgress';
            e.target.innerText = 'Downloading 0%';

            //asyncDownload( data, details, e.target );

            // Try a new way of downloading...
            progressiveDownload( data, details, e.target );
        });

        return row;
    }

    async function progressiveDownload( data, details, calledFrom ){
        // Set request size.
        const requestSize = 1048576 * 2, // 1 MB
              numChunks   = Math.ceil( data[ 'contentLength' ] / requestSize ),
              chunkSize   = Math.ceil( data[ 'contentLength' ] / numChunks );

        // Get number of chunks required and size of each chunk.
        let entireBlob = new Blob( [], { type: 'application/octet-stream' } ),
            i          = 0,
            blob, response, start, end, currentPercent, newPercent;

        // Loop through all of our requests.
        for( ; i < numChunks; i++ ){
            response   = await fetchRetry( `${data[ 'url' ]}&range=${start}-${end}`, '', 3 );
            blob       = await response.blob();
            entireBlob = new Blob( [ entireBlob, blob ], { type: 'application/octet-stream' } );
            // Progress updates.
            currentPercent = Number( /[0-9]+(\.[0-9]+)?/.exec( calledFrom.innerText )[ 0 ] );
            newPercent     = Number( ( ( i + 1 ) / numChunks ) * 100 ).toFixed( 2 );
            calledFrom.innerText = `Downloading ${newPercent}%`;
        }

        const // Create a URL object with our returned blob data.
              urlObject = window.URL.createObjectURL( entireBlob ),
              // Create a link element and set it's URL to our URL object.
              a = document.createElement( 'a' );

        // Add our link to the page.
        document.body.appendChild( a );
        a.href = urlObject;
        // Set the filename.
        a.download = `${details[ 'title' ].replace(/\+/g,' ')}.${data.mimeType.split( ';' )[ 0 ].split( '/' )[ 1 ]}`;
        // Click the link! Should cause it to download if all has worked well.
        a.click();
        // This element is no longer required.
        a.remove();
        // Our URL object is no longer required.
        window.URL.revokeObjectURL( urlObject );
        // Reset the style of the link that was clicked.
        calledFrom.className = '';
        calledFrom.innerText = 'Download';
    }

    async function fetchRetry( url, options, retries ){
        // Create our experimental abort controllers.
        const controller = new AbortController(),
              signal     = controller.signal,
              // Timeout to run if the fetch API hasn't got a response yet, aborts the fetch.
              abortTimer = setTimeout( () => {
                  controller.abort();
              }, 1200 );
        try{
            return await fetch( url, { method: 'GET', signal } ).then( response => {
                clearTimeout( abortTimer );
                console.log('retrying');
                return response;
            } );
        }
        catch( e ){
            if ( retries === 1 ) throw e;
            return await fetchRetry( url, '', retries - 1 );
        }
    }

    /*
        Downloads the requested video in chunks to bypass Youtubes bandwidth limitations and speed up downloads.
        This works by first creating multiple promises requesting a "chunk" of data. (this is how Youtube actually "streams" it's videos, it's why videos never fully load and only load as you're watching it)
        Once the promises are made, run them all at the same time and await a response.
        Once the promises have all returned data, create an <a> link with that data and force a download.
    */
    async function asyncDownload( data, details, calledFrom ){
        // Set request size.
        const requestSize = 1048576 * 2, // 2 MB
              blobArray   = [],
              maxRequests = 8;

        // Get number of chunks required and size of each chunk.
        let numChunks = Math.ceil( data[ 'contentLength' ] / requestSize ),
            chunkSize  = Math.ceil( data[ 'contentLength' ] / numChunks ),
            i = 0,
            start, end;

        // Limit the maximum number of requests, we don't want to inadvertently DDOS Youtube.
        if ( numChunks > maxRequests ){
            numChunks = maxRequests;
            // Work out chunkSize again.
            chunkSize = Math.ceil( data[ 'contentLength' ] / numChunks );
        }

        // Loop through the number of chunks required.
        for( ; i < numChunks; i++ ){
            // Work out the start and end range in bytes for our chunk request.
            start = ( chunkSize + 1 ) * i;
            end   = start + chunkSize;
            // Create an array of promise requests for our Promise.all request.
            blobArray.push( new Promise( async ( resolv ) => {
                // Make our request and return a blob.
                const response       = await fetch( `${data[ 'url' ]}&range=${start}-${end}`, { method: 'GET' } ),
                      aBlob          = await response.blob(),
                      // Progress updates.
                      currentPercent = Number( /[0-9]+(\.[0-9]+)?/.exec( calledFrom.innerText )[ 0 ] ),
                      newPercent     = Number( currentPercent + ( ( 100 / numChunks ) ) ).toFixed( 2 );

                // Display some basic percentage progress.
                calledFrom.innerText = 'Downloading '+ String( newPercent ) +'%';
                resolv( aBlob );
            }));
        }

        try{
            // Run all of our promise requests and await their return.
            Promise.all( blobArray ).then( values => {
                // Makes a blob from all of the other blobs, this is our requested video, also store it's type as a stream.
                const entireBlob = new Blob( values, { type: 'application/octet-stream' } ),
                      // Create a URL object with our returned blob data.
                      urlObject = window.URL.createObjectURL( entireBlob ),
                      // Create a link element and set it's URL to our URL object.
                      a = document.createElement( 'a' );

                // Add our link to the page.
                document.body.appendChild( a );
                a.href = urlObject;
                // Set the filename.
                a.download = `${details[ 'title' ].replace(/\+/g,' ')}.${data.mimeType.split( ';' )[ 0 ].split( '/' )[ 1 ]}`;
                // Click the link! Should cause it to download if all has worked well.
                a.click();
                // This element is no longer required.
                a.remove();
                // Our URL object is no longer required.
                window.URL.revokeObjectURL( urlObject );
                // Reset the style of the link that was clicked.
                calledFrom.className = '';
                calledFrom.innerText = 'Download';
            }).catch( ( e ) => {
                console.log( e );
            });
        }
        catch(e){
            console.log(e);
            calledFrom.className = '';
            calledFrom.innerText = 'Download*';
        }
    }

    /*
        Some custom CSS for the container, button and links.
        Uses some of Youtubes own CSS vars, ensures it works with Youtubes Dark Theme mode.
    */
    function addCss(){
        // Check it's not already been added.
        if (document.getElementById( 'yt-downloader-styles' ) === null ){
            const css = `
                  #yt-container *{box-sizing:border-box}
                  #yt-container{color:var(--ytd-video-primary-info-renderer-title-color,var(--yt-spec-text-primary));font-size:1.3em;height:20px;line-height:1.22em;margin:.3em 0 1px 0;min-height:20px;overflow:hidden;position:relative;transition:height .4s}
                  #yt-container > button{background-color:transparent;border:none;color:var(--yt-spec-text-secondary);cursor:pointer;height:18px;margin:0;padding:0;position:relative;transition:box-shadow .2s;user-select:none;width:100%;z-index:1}
                  #yt-container > button::before{content:'<';left:5px;position:absolute;transform:rotate(-90deg);transition:transform .4s}
                  #yt-container > button::after{content:'>';position:absolute;right:5px;transform:rotate(90deg);transition:transform .4s}
                  #yt-container.open > button::before{transform:rotate(90deg)}
                  #yt-container.open > button::after{transform:rotate(-90deg)}
                  #yt-container > button:active{margin:0;padding:0}
                  #yt-container > button:hover,#yt-container.open > button{box-shadow:0 2px 0 0 var(--yt-spec-10-percent-layer)}
                  #yt-links .flex{display:flex;flex-direction:row;justify-content:space-evenly}
                  #yt-links{display:flex;flex-direction:column;justify-content:space-evenly;position:relative;width:100%}
                  #yt-links div{width:100%}
                  #yt-links > div{border-color:var(--yt-spec-10-percent-layer);border-width:0 0 1px 0;border-style:solid;margin:0;padding:.2em}
                  #yt-links > div > div{padding:.4em}
                  #yt-links a{color:var(--yt-endpoint-color,var(--yt-spec-icon-active-button-link))}
                  #yt-links h3{font-weight:300;margin:0;padding:.1em 0 .2em 0;text-align:center}
                  #yt-links .row{display:flex;justify-content:space-evenly}
                  #yt-links .right{text-align:right}
                  #yt-links .left{text-align:left}
                  #yt-links .center{text-align:center}
                  #yt-links .falseLink{cursor:pointer;text-decoration:underline}
                  #yt-links .inProgress{color:var(--yt-expand-color);font-size:.9em;pointer-events:none;text-decoration:none}
                  #yt-links .footer{background-color:var(--yt-playlist-background-item);font-size:.86em;padding:0}
                  ytd-video-primary-info-renderer{padding-top:10px}
                  `,
                  style = document.createElement( 'style' );

            style.id = 'yt-downloader-styles';
            style.innerText = css;
            document.head.appendChild( style );
        }
    }
}());
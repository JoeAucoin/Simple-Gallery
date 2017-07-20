/**
 * jQuery lightBox plugin
 * This jQuery plugin was inspired and based on Lightbox 2 by Lokesh Dhakar (http://www.huddletogether.com/projects/lightbox2/)
 * and adapted to me for use like a plugin from jQuery.
 * @name jquery-lightbox-0.4.js
 * @author Leandro Vieira Pinho - http://leandrovieira.com
 * @version 0.4
 * @date November 17, 2007
 * @category jQuery plugin
 * @copyright (c) 2007 Leandro Vieira Pinho (leandrovieira.com)
 * @license CC Attribution-No Derivative Works 2.5 Brazil - http://creativecommons.org/licenses/by-nd/2.5/br/deed.en_US
 * @example Visit http://leandrovieira.com/projects/jquery/lightbox/ for more informations about this jQuery plugin
 */

// Offering a Custom Alias suport - More info: http://docs.jquery.com/Plugins/Authoring#Custom_Alias
(function($) {
	/**
	 * $ is an alias to jQuery object
	 *
	 */
	$.fn.lightBox = function(settings) {
		// Settings to configure the jQuery lightBox plugin how you like
		settings = jQuery.extend({
			// Configuration related to overlay
			overlayBgColor: 		'#000',		// (string) Background color to overlay; inform a hexadecimal value like: #RRGGBB. Where RR, GG, and BB are the hexadecimal values for the red, green, and blue values of the color.
			overlayOpacity:			0.8,		// (integer) Opacity value to overlay; inform: 0.X. Where X are number from 0 to 9
			// Configuration related to images
			imageLoading:			'images/lightbox-ico-loading.gif',		// (string) Path and the name of the loading icon
			imageBtnPrev:			'images/lightbox-btn-prev.gif',			// (string) Path and the name of the prev button image
			imageBtnNext:			'images/lightbox-btn-next.gif',			// (string) Path and the name of the next button image
			imageBtnClose:			'images/lightbox-btn-close.gif',		// (string) Path and the name of the close btn
			imageBlank:				'images/lightbox-blank.gif',			// (string) Path and the name of a blank image (one pixel)
			// Configuration related to container image box
			containerBorderSize:	10,			// (integer) If you adjust the padding in the CSS for the container, #lightbox-container-image-box, you will need to update this value
			containerResizeSpeed:	400,		// (integer) Specify the resize duration of container image. These number are miliseconds. 400 is default.
			// Configuration related to texts in caption. For example: Image 2 of 8. You can alter either "Image" and "of" texts.
			txtImage:				'Image',	// (string) Specify text "Image"
			txtOf:					'of',		// (string) Specify text "of"
			// Configuration related to keyboard navigation
			keyToClose:				'c',		// (string) (c = close) Letter to close the jQuery lightBox interface. Beyond this letter, the letter X and the SCAPE key is used to.
			keyToPrev:				'p',		// (string) (p = previous) Letter to show the previous image
			keyToNext:				'n',		// (string) (n = next) Letter to show the next image.
			keyToDownload:			'd',		// (string) (n = next) Letter to show the next image.
			// Don�t alter these variables in any way
			imageArray:				[],
			activeImage:			0,
			// Localized values
			previous:				'&#171; [P]revious',
			next:					'[N]ext &#187;',
			close:					'[C]lose X',
			download:				'[D]ownload Photo',
			// Configuration related to pause/play functionality
			slideInterval:          6000,
			autoStart:              false,
			inProgress:             false,
			txtPlay:                'Play',
			txtPause:               'Pause',
			timeoutID:              -1 
		},settings);
		
		// Caching the jQuery object with all elements matched
		var jQueryMatchedObj = this; // This, in this context, refer to jQuery object
		/**
		 * Initializing the plugin calling the start function
		 *
		 * @return boolean false
		 */
		function _initialize() {
			_start(this,jQueryMatchedObj); // This, in this context, refer to object (link) which the user have clicked
			return false; // Avoid the browser following the link
		}
		/**
		 * Start the jQuery lightBox plugin
		 *
		 * @param object objClicked The object (link) whick the user have clicked
		 * @param object jQueryMatchedObj The jQuery object with all elements matched
		 */
		function _start(objClicked,jQueryMatchedObj) {
			// Hime some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			$('embed, object, select').css({ 'visibility' : 'hidden' });
			// Call the function to create the markup structure; style some elements; assign events in some elements.
			_set_interface();
			// Unset total images in imageArray
			settings.imageArray.length = 0;
			// Unset image active information
			settings.activeImage = 0;
			settings.timeoutID = -1;
			settings.inProgress = settings.autoStart;
			if( settings.inProgress ) {
			    $('#lightbox-container-image-details-nav-btnPlay').html(settings.txtPause);
				settings.timeoutID = window.setTimeout(function() {_show_next_image();}, settings.slideInterval);
			}
			else
			{
			    $('#lightbox-container-image-details-nav-btnPlay').html(settings.txtPlay);
			}
			// We have an image set? Or just an image? Let�s see it.
			if ( jQueryMatchedObj.length == 1 ) {
				settings.imageArray.push(new Array(objClicked.getAttribute('href'),objClicked.getAttribute('title'),objClicked.getAttribute('description'),objClicked.getAttribute('tags'),objClicked.getAttribute('pid')));
			} else {
				// Add an Array (as many as we have), with href and title atributes, inside the Array that storage the images references		
				for ( var i = 0; i < jQueryMatchedObj.length; i++ ) {
					settings.imageArray.push(new Array(jQueryMatchedObj[i].getAttribute('href'),jQueryMatchedObj[i].getAttribute('title'),jQueryMatchedObj[i].getAttribute('description'),jQueryMatchedObj[i].getAttribute('tags'),jQueryMatchedObj[i].getAttribute('pid')));
				}
			}
			while ( settings.imageArray[settings.activeImage][0] != objClicked.getAttribute('href') ) {
				settings.activeImage++;
			}
			// Call the function that prepares image exibition
			_set_image_to_view();
		}
		/**
		 * Create the jQuery lightBox plugin interface
		 *
		 * The HTML markup will be like that:
            <div id="jquery-overlay"></div>
            <div id="jquery-lightbox">
                <div id="lightbox-container-image-box">
                    <div id="lightbox-container-image">
                        <img id="lightbox-image">
                        <div id="lightbox-loading">
                            <a href="#" id="lightbox-loading-link"><img src="' + settings.imageLoading + '"></a>
                        </div>
                    </div>
                </div>
                <div id="lightbox-container-image-data-box">
                    <div id="lightbox-container-image-data">
                        <div id="lightbox-container-image-details">
                            <span id="lightbox-container-image-details-caption"></span>
                            <span id="lightbox-container-image-details-currentNumber"></span>
                            <span id="lightbox-container-image-details-nav">
                                <a href="#" id="lightbox-container-image-details-nav-btnPrev">' + settings.previous + '</a>
                                <a href="#" id="lightbox-container-image-details-nav-btnPlay">' + settings.txtPlay + '</a>
                                <a href="#" id="lightbox-container-image-details-nav-btnNext">' + settings.next + '</a>
                                <a href="#" id="lightbox-container-image-details-nav-btnPause"> Pause</a>
                            </span>
                        </div>
                        <div id="lightbox-image-details-close">
                            <a href="#" id="lightbox-image-details-close-btnClose">' + settings.close + '</a>
                        </div>
                    </div>
                </div>
            </div>
		 *
		 */
		function _set_interface() {
			// Apply the HTML markup into body tag
			$('body').append('<div id="jquery-overlay"></div><div id="jquery-lightbox"><div id="lightbox-container-image-box"><div id="lightbox-container-image"><img id="lightbox-image"><div id="lightbox-loading"><a href="#" id="lightbox-loading-link"><img src="' + settings.imageLoading + '"></a></div></div></div><div id="lightbox-container-image-data-box"><div id="lightbox-container-image-data"><div id="lightbox-container-image-details"><span id="lightbox-container-image-details-caption"></span><span id="lightbox-container-image-details-description"></span><span id="lightbox-container-image-details-currentNumber"></span><span id="lightbox-container-image-details-nav"><a href="#" id="lightbox-container-image-details-nav-btnPrev">' + settings.previous + '</a><a href="#" id="lightbox-container-image-details-nav-btnPlay">' + settings.txtPlay + '</a><a href="#" id="lightbox-container-image-details-nav-btnNext">' + settings.next + '</a><a href="#" id="lightbox-container-image-details-nav-btnPause"> Pause</a></span></div><div id="lightbox-image-details-close"><a href="#" id="lightbox-image-details-close-btnClose">' + settings.close + '</a><br /><br /><a href="#" id="lightbox-image-details-close-btnDownload" target="_blank">' + settings.download + '</a></div></div></div></div>');	
			// Get page sizes
			var arrPageSizes = ___getPageSize();
			// Style overlay and show it
			$('#jquery-overlay').css({
				backgroundColor:	settings.overlayBgColor,
				opacity:			settings.overlayOpacity,
				width:				arrPageSizes[0],
				height:				arrPageSizes[1]
			}).fadeIn();
			// Get page scroll
			var arrPageScroll = ___getPageScroll();
			// Calculate top and left offset for the jquery-lightbox div object and show it
			$('#jquery-lightbox').css({
				top:	arrPageScroll[1] + (arrPageSizes[3] / 10),
				left:	arrPageScroll[0]
			}).show();
			// Assign the _finish function to lightbox-loading-link and lightbox-secNav-btnClose objects
			$('#lightbox-loading-link,#lightbox-image-details-close-btnClose').click(function() {
				_finish();
				return false;
			});
			$('#lightbox-image-details-close-btnDownload').click(function() {
				_download_image();
				return false;
			});
			$('#lightbox-container-image-details-nav-btnPlay').click(function() {
			    if( settings.inProgress )
			    {
			        if( settings.timeoutID != -1 ) {
			            window.clearTimeout(settings.timeoutID);
			        }
			        settings.inProgress = false;
				    $('#lightbox-container-image-details-nav-btnPlay').html(settings.txtPlay);
			    }
			    else
			    {
			        if ( settings.activeImage != ( settings.imageArray.length - 1 ) ) {
			            settings.inProgress = true;
				        $('#lightbox-container-image-details-nav-btnPlay').html(settings.txtPause);
				        settings.timeoutID = window.setTimeout(function() {_show_next_image();}, settings.slideInterval);
				    }
				}
				return false;
			});
			
			$('#lightbox-container-image-box').click(function() {
				_show_next_image();
				return false;								
			});
			
			// Assigning click events in elements to close overlay
			$('#jquery-overlay,#jquery-lightbox,#lightbox-container-image-data-box,#lightbox-container-image-details-currentNumber').click(function(e) {
			    if(this.id == 'lightbox-container-image-details-currentNumber') { e.stopPropagation();_finish(); return true; }
				if(this.id == 'lightbox-container-image-data-box') { return false; }
				_finish();									
			});
			// If window was resized, calculate the new overlay dimensions
			$(window).resize(function() {
				// Get page sizes
				var arrPageSizes = ___getPageSize();
				// Style overlay and show it
				$('#jquery-overlay').css({
					width:		arrPageSizes[0],
					height:		arrPageSizes[1]
				});
				// Get page scroll
				var arrPageScroll = ___getPageScroll();
				// Calculate top and left offset for the jquery-lightbox div object and show it
				$('#jquery-lightbox').css({
					top:	arrPageScroll[1] + (arrPageSizes[3] / 10),
					left:	arrPageScroll[0]
				});
			});
		}
		/**
		 * Prepares image exibition; doing a image�s preloader to calculate it�s size
		 *
		 */
		function _set_image_to_view() { // show the loading
			// Show the loading
			$('#lightbox-loading').show();
			// Hide some elements
			$('#lightbox-image,#lightbox-nav,#lightbox-container-image-details-nav-btnPrev,#lightbox-container-image-details-nav-btnNext,#lightbox-container-image-details-nav-btnPlay,#lightbox-container-image-data-box,#lightbox-container-image-details-currentNumber,#lightbox-container-image-details-nav-btnPause').hide();
			// Image preload process
			var objImagePreloader = new Image();
			objImagePreloader.onload = function() {
				$('#lightbox-image').attr('src',settings.imageArray[settings.activeImage][0]);
				// Perfomance an effect in the image container resizing it
				_resize_container_image_box(objImagePreloader.width,objImagePreloader.height);
				//	clear onLoad, IE behaves irratically with animated gifs otherwise
				objImagePreloader.onload=function(){};
			}
			objImagePreloader.src = settings.imageArray[settings.activeImage][0];
		}
		/**
		 * Perfomance an effect in the image container resizing it
		 *
		 * @param integer intImageWidth The image�s width that will be showed
		 * @param integer intImageHeight The image�s height that will be showed
		 */
		function _resize_container_image_box(intImageWidth,intImageHeight) {
			// Get current width and height
			var intCurrentWidth = $('#lightbox-container-image-box').width();
			var intCurrentHeight = $('#lightbox-container-image-box').height();
			// Get the width and height of the selected image plus the padding
			var intWidth = (intImageWidth + (settings.containerBorderSize * 2)); // Plus the image�s width and the left and right padding value
			var intHeight = (intImageHeight + (settings.containerBorderSize * 2)); // Plus the image�s height and the left and right padding value
			// Diferences
			var intDiffW = intCurrentWidth - intWidth;
			var intDiffH = intCurrentHeight - intHeight;
			// Perfomance the effect
			$('#lightbox-container-image-box').animate({ width: intWidth, height: intHeight },settings.containerResizeSpeed,function() { _show_image(); });
			if ( ( intDiffW == 0 ) && ( intDiffH == 0 ) ) {
				if ( $.browser.msie ) {
					___pause(250);
				} else {
					___pause(100);	
				}
			}
			$('#lightbox-container-image-data-box').css({ width: intWidth });
		};
		/**
		 * Show the prepared image
		 *
		 */
		function _show_image() {
			$('#lightbox-loading').hide();
			$('#lightbox-image').fadeIn(function() {
				_show_image_data();
				_set_navigation();
			});
			_preload_neighbor_images();
			
		    if( settings.timeoutID != -1 )
		        window.clearTimeout(settings.timeoutID); 
		        
			if( settings.inProgress ) {
		        if ( settings.activeImage != ( settings.imageArray.length - 1 ) ) {
			        settings.timeoutID = window.setTimeout(function() {_show_next_image();}, settings.slideInterval);
			    }
			    else
			    {
			        settings.timeoutID = -1;
			        settings.inProgress = false;
			        $('#lightbox-container-image-details-nav-btnPlay').html(settings.txtPlay);
			    }
			}
		};
		/**
		 * Show next image 
		 * 
		 */
		 function _show_next_image() {
		    if ( settings.activeImage != ( settings.imageArray.length - 1 ) ) {
				settings.activeImage = settings.activeImage + 1;
				_set_image_to_view();
				_disable_keyboard_navigation();
			}
		 }
		/**
		 * Download image 
		 * 
		 */
		 function _download_image() {
		    var link = settings.downloadLink;
		    link = link.replace('{0}', settings.imageArray[settings.activeImage][4]);
            window.open(link);
         }
		/**
		 * Show the image information
		 *
		 */
		function _show_image_data() {
			//$('#lightbox-container-image-data-box').slideDown('fast');
			$('#lightbox-container-image-data-box').show();
			$('#lightbox-container-image-details-caption').hide();
			if( !settings.hideTitle )
			{
			    if ( settings.imageArray[settings.activeImage][1] ) {
                    $('#lightbox-container-image-details-caption').html(settings.imageArray[settings.activeImage][1]).show();
			    }
			}
			
			$('#lightbox-container-image-details-description').hide();
			if( !settings.hideDescription )
			{
			    if ( settings.imageArray[settings.activeImage][2] ) {
                    $('#lightbox-container-image-details-description').html(settings.imageArray[settings.activeImage][2]).show();
			    }
			}
			
			if( settings.hideDownload )
			{
                $('#lightbox-image-details-close-btnDownload').hide();
			}
			
			// If we have a image set, display 'Image X of X'
			if ( settings.imageArray.length > 1 ) {
			    var result = "";
			    
			    if( !settings.hidePaging )
			    {
    			    result = result + settings.txtImage + ' ' + ( settings.activeImage + 1 ) + ' ' + settings.txtOf + ' ' + settings.imageArray.length + ' ';
			    }
			    
			    if( !settings.hideTags )
			    {
				    if ( settings.imageArray[settings.activeImage][3] ) {
    				    result = result + settings.imageArray[settings.activeImage][3];
				    }
			    }
			    
				$('#lightbox-container-image-details-currentNumber').html(result).show();
			}		
		}
		/**
		 * Display the button navigations
		 *
		 */
		function _set_navigation() {
			$('#lightbox-nav').show();

			// Instead to define this configuration in CSS file, we define here. And it�s need to IE. Just.
			//$('#lightbox-nav-btnPrev,#lightbox-container-image-details-nav-btnNext').css({ 'background' : 'transparent url(' + settings.imageBlank + ') no-repeat' });
			
			// Show the prev button, if not the first image in set
			if ( settings.activeImage != 0 ) {
				// Show the images button for Next buttons
				$('#lightbox-container-image-details-nav-btnPrev').unbind().show().bind('click',function() {
					settings.activeImage = settings.activeImage - 1;
					_set_image_to_view();
					return false;
				});
			}
			
			// Show the next button, if not the last image in set
			if ( settings.activeImage != ( settings.imageArray.length -1 ) ) {
				// Show the images button for Next buttons
				$('#lightbox-container-image-details-nav-btnNext').unbind().show().bind('click',function() {
					settings.activeImage = settings.activeImage + 1;
					_set_image_to_view();
					return false;
				});
			}
			
			if( settings.imageArray.length > 1 ) {
			    $('#lightbox-container-image-details-nav-btnPlay').show();
			}
			
			// Enable keyboard navigation
			_enable_keyboard_navigation();
		}
		/**
		 * Enable a support to keyboard navigation
		 *
		 */
		function _enable_keyboard_navigation() {
			$(document).keydown(function(objEvent) {
				_keyboard_action(objEvent);
			});
		}
		/**
		 * Disable the support to keyboard navigation
		 *
		 */
		function _disable_keyboard_navigation() {
			$(document).unbind();
		}
		/**
		 * Perform the keyboard actions
		 *
		 */
		function _keyboard_action(objEvent) {
			// To ie
			if ( objEvent == null ) {
				keycode = event.keyCode;
				escapeKey = 27;
			// To Mozilla
			} else {
				keycode = objEvent.keyCode;
				escapeKey = objEvent.DOM_VK_ESCAPE;
			}
			// Get the key in lower case form
			key = String.fromCharCode(keycode).toLowerCase();
			// Verify the keys to close the ligthBox
			if ( ( key == settings.keyToClose ) || ( key == 'x' ) || ( keycode == escapeKey ) ) {
				_finish();
			}
			// Verify the key to show the previous image
			if ( ( key == settings.keyToPrev ) || ( keycode == 37 ) ) {
				// If we�re not showing the first image, call the previous
				if ( settings.activeImage != 0 ) {
					settings.activeImage = settings.activeImage - 1;
					_set_image_to_view();
					_disable_keyboard_navigation();
				}
			}
			// Verify the key to show the next image
			if ( ( key == settings.keyToNext ) || ( keycode == 39 ) ) {
				_show_next_image();
			}
			
			if( !settings.hideDownload )
			{
			    // Verify the key to show the next image
			    if ( key == settings.keyToDownload ) {
				    _download_image();
			    }
			}
		}
		/**
		 * Preload prev and next images being showed
		 *
		 */
		function _preload_neighbor_images() {
			if ( (settings.imageArray.length -1) > settings.activeImage ) {
				objNext = new Image();
				objNext.src = settings.imageArray[settings.activeImage + 1][0];
			}
			if ( settings.activeImage > 0 ) {
				objPrev = new Image();
				objPrev.src = settings.imageArray[settings.activeImage -1][0];
			}
		}
		/**
		 * Remove jQuery lightBox plugin HTML markup
		 *
		 */
		function _finish() {
		    if( settings.timeoutID != -1 )
		        window.clearTimeout(settings.timeoutID); 
			$('#jquery-lightbox').remove();
			$('#jquery-overlay').fadeOut(function() { $('#jquery-overlay').remove(); });
			// Show some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			$('embed, object, select').css({ 'visibility' : 'visible' });
		}
		
		/**
		 / THIRD FUNCTION
		 * getPageSize() by quirksmode.com
		 *
		 * @return Array Return an array with page width, height and window width, height
		 */
		function ___getPageSize() {
			var xScroll, yScroll;
			if (window.innerHeight && window.scrollMaxY) {	
				xScroll = window.innerWidth + window.scrollMaxX;
				yScroll = window.innerHeight + window.scrollMaxY;
			} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
				xScroll = document.body.scrollWidth;
				yScroll = document.body.scrollHeight;
			} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
				xScroll = document.body.offsetWidth;
				yScroll = document.body.offsetHeight;
			}
			var windowWidth, windowHeight;
			if (self.innerHeight) {	// all except Explorer
				if(document.documentElement.clientWidth){
					windowWidth = document.documentElement.clientWidth; 
				} else {
					windowWidth = self.innerWidth;
				}
				windowHeight = self.innerHeight;
			} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
				windowWidth = document.documentElement.clientWidth;
				windowHeight = document.documentElement.clientHeight;
			} else if (document.body) { // other Explorers
				windowWidth = document.body.clientWidth;
				windowHeight = document.body.clientHeight;
			}	
			// for small pages with total height less then height of the viewport
			if(yScroll < windowHeight){
				pageHeight = windowHeight;
			} else { 
				pageHeight = yScroll;
			}
			// for small pages with total width less then width of the viewport
			if(xScroll < windowWidth){	
				pageWidth = xScroll;		
			} else {
				pageWidth = windowWidth;
			}
			arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight) 
			return arrayPageSize;
		};
		/**
		 / THIRD FUNCTION
		 * getPageScroll() by quirksmode.com
		 *
		 * @return Array Return an array with x,y page scroll values.
		 */
		function ___getPageScroll() {
			var xScroll, yScroll;
			if (self.pageYOffset) {
				yScroll = self.pageYOffset;
				xScroll = self.pageXOffset;
			} else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
				yScroll = document.documentElement.scrollTop;
				xScroll = document.documentElement.scrollLeft;
			} else if (document.body) {// all other Explorers
				yScroll = document.body.scrollTop;
				xScroll = document.body.scrollLeft;	
			}
			arrayPageScroll = new Array(xScroll,yScroll) 
			return arrayPageScroll;
		};
		 /**
		  * Stop the code execution from a escified time in milisecond
		  *
		  */
		 function ___pause(ms) {
			var date = new Date(); 
			curDate = null;
			do { var curDate = new Date(); }
			while ( curDate - date < ms);
		 };
		// Return the jQuery object for chaining. The unbind method is used to avoid click conflict when the plugin is called more than once
		return this.unbind('click').click(_initialize);
	};
})(jQuery); // Call and execute the function immediately passing the jQuery object
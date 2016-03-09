/**
 * Created by marcus on 11.02.16.
 */
function ContentHandler()
{
    //var thumbSpawnField      = document.getElementById("thumbSpawnField");
    var thumbSpawnField         = document.getElementById("thumbSpawnField");
    //var contentField         = document.getElementById("content");
    var contentObjects          = [];
    var thumbUIItems            = [];
    var currentSWFSettings;
    var currentContentObject;
    var allowSwitchPictures     = false;
    var swfParameters           = {quality: "high", wmode: "transparent", scale: "showall", align: "middle"};
    var flashVariables          = {};
    var swfAttributes           = {};
    var contentFieldPreset      = $("#contentField").clone(true);
    var currentContentIndex     = -1;
    var swipeHandler;

    $("#contentField").remove();


    $(document).keydown(function(e)
    {
        logMessage("onPress Key: " + e.which);

        switch(e.which)
        {
            case 37: // left
                onClickPreviousPic();
                break;
            case 39: // right
                onClickNextPic();
                break;
            case 27: // Escape
                hideContent();
                break;
            default: return;
        }

        //e.preventDefault();
    });


    this.add = function ($contentObject)
    {
        if(!contentHandler.getContentJsonIsLoaded($contentObject.id))
        {
            contentObjects.push($contentObject);
        }
    };


    this.getContentJsonIsLoaded = function($id)
    {
        if (contentHandler.getContentByMainCategory($id) != null)
        {
            return true;
        }else
        {
            return false;
        }
    };


    this.showThumbs = function($contentObjects, $startPositionObject)
    {
        logMessage("ContentHandler showThumbs()");

        //Remove firstly the old Items
        contentHandler.removeAllThumbItems(false);

        //showWelcome(false);

        thumbUIItems        = [];
        var thumbImages     = [];

        //logMessage("LALALA um of ContentObjects: " + $contentObjects.length);

        if($contentObjects != undefined)
        {
            for(var i = 0; i < $contentObjects.length; i++)
            {
                thumbUIItems[i]    = document.createElement('div');

                thumbUIItems[i].id = $contentObjects[i].id;
                thumbUIItems[i].index = i;
                thumbUIItems[i].thumbTargetPosition   = contentHandler.getPossibleThumpPosition(thumbUIItems[i]);
                //thumbUIItems[i].title   = $contentObjects[i].title;

                $(thumbUIItems[i]).addClass('ThumbItem');

                //Handle Thumb-Image
                thumbImages[i]      = new Image();
                thumbImages[i].id   = i;
                thumbImages[i].src  = $contentObjects[i].thumb_image;

                $(thumbImages[i]).load(function()
                {
                    //Fly in from the Main or Subcategory-Button
                    if($startPositionObject != undefined)
                    {
                        $(thumbUIItems[this.id]).css({  top: $($startPositionObject).position().top - $(thumbSpawnField).position().top + "px",
                                                        left: $($startPositionObject).position().left - $(thumbSpawnField).position().left + "px"});
                    }

                    TweenMax.to(this.parentNode, 1, {   opacity: 1, scaleX: 1, scaleY: 1,
                        delay: this.id / thumbUIItems.length,
                        onStart: contentHandler.positionateThumbToSpawnPosition,
                        onStartParams: [thumbUIItems[this.id], 1]});
                });

                $(thumbImages[i]).addClass('ThumbImage');
                thumbUIItems[i].appendChild(thumbImages[i]);

                TweenMax.to(thumbUIItems[i], 0, {  opacity: 0, scaleX: 0, scaleY: 0});

                $(thumbUIItems[i]).click(contentHandler.onClickItem);

                //Tooltips
                $(thumbUIItems[i]).on('mousemove', function(evt)
                {
                    $("#thumb-tooltip").attr('data-original-title', contentHandler.getContentObjectByID(evt.currentTarget.id).title);
                    $("#thumb-tooltip").css({top: evt.clientY - 10, left: evt.clientX});
                    $("#thumb-tooltip").tooltip('show');
                });

                $(thumbUIItems[i]).on('mouseleave', function(e)
                {
                    $("#thumb-tooltip").tooltip('hide');
                    //$('[data-toggle="tooltip"]').tooltip('hide');
                });

                var thumbIcon = document.createElement('span');
                thumbIcon.id       = "thumbIcon";
                $(thumbIcon).addClass('glyphicon glyphicon-eye-open ThumbIcon');

                thumbUIItems[i].appendChild(thumbIcon);
                thumbSpawnField.appendChild(thumbUIItems[i]);

                //TweenMax.to(thumbUIItems[i], 1, { opacity: 1, scaleX: 1, scaleY: 1, delay: i / 5});
                Draggable.create(thumbUIItems[i], {type:"x,y", edgeResistance:0.75, bounds:thumbSpawnField, throwProps:true});
            }
        }
    };


    this.removeAllThumbItems = function ($showWelcome)
    {
        showWelcome($showWelcome);

        if(thumbUIItems.length > 0)
        {
            for(var t = 0; t < thumbUIItems.length; t++)
            {
                if(thumbUIItems[t] != undefined && thumbUIItems[t] != null)
                {
                    TweenMax.killTweensOf(thumbUIItems[t]);
                    TweenMax.to(thumbUIItems[t], 0.3, {scaleX: 0, scaleY: 0, onComplete: contentHandler.removeThumbItem, onCompleteParams: [thumbUIItems[t]]});
                }
            }
        }
    };


    this.rearrangeThumbs = function($duration)
    {
        if($duration === undefined) { $duration = 0.5; }

        if(thumbUIItems != null && thumbUIItems.length > 0)
        {
            for(var i = 0; i < thumbUIItems.length; i++)
            {
                thumbUIItems[i].thumbTargetPosition = contentHandler.getPossibleThumpPosition(thumbUIItems[i]);
                contentHandler.positionateThumbToSpawnPosition(thumbUIItems[i], $duration);
            }
        }
    };


    this.positionateThumbToSpawnPosition = function($thumb, $duration)
    {
        if($duration === undefined) { $duration = 0.5; }

        //$thumb.thumbTargetPosition   = contentHandler.getPossibleThumpPosition($thumb);

        TweenMax.to($thumb, $duration,   {  top: $thumb.thumbTargetPosition.top,
            left: $thumb.thumbTargetPosition.left,
            rotation:Math.random() * 60 - 30});
    };


    this.getPossibleThumpPosition = function($thumb)
    {
        var tmpPosition     = {id: $thumb.id};
        var tmpAttempts     = 0;

        do
        {
            tmpAttempts++;
            tmpPosition.top     = Math.random() * (thumbSpawnField.offsetHeight - 120);
            tmpPosition.left    = Math.random() * (thumbSpawnField.offsetWidth - 120);
        }while(!contentHandler.getDistanceToOtherThumbsIsAccepted(tmpPosition) && tmpAttempts < 30);

        return tmpPosition;
    };


    this.getDistanceToOtherThumbsIsAccepted = function(tmpPosition)
    {
        for(var i = 0; i < thumbUIItems.length; i++)
        {
            if( tmpPosition.id != thumbUIItems[i].id &&
                thumbUIItems[i].thumbTargetPosition != undefined &&
                contentHandler.getDistance(tmpPosition, {top: thumbUIItems[i].thumbTargetPosition.top, left: thumbUIItems[i].thumbTargetPosition.left}) < 100)
            {
                //logMessage("DISTANCE IS NOT OK!!!");
                return false;
            }
        }

        return true;
    };


    this.getDistance = function(position1, position2)
    {
        return Math.sqrt(Math.pow(position1.left - position2.left, 2) + Math.pow(position1.top - position2.top, 2));
    };


    this.showContent = function($contentObject, $imgFadeIn)
    {
        if($imgFadeIn === undefined) { $imgFadeIn = false; }

        currentContentObject    = $contentObject;
        logMessage("Show Content: " + $contentObject + " $imgFadeIn: " + $imgFadeIn);
        $("#thumb-tooltip").tooltip('hide');

        var isAnInstantContentSwitch    = false;

        if($("#contentField")[0] != undefined)
        {
            isAnInstantContentSwitch    = true;
            $("#contentField").remove();
        }

        var tmpContent  = $(contentFieldPreset).clone(true);

        if(!isAnInstantContentSwitch)
        {
            $(tmpContent).css('opacity', 0);
        }

        $("#content").append(tmpContent);
        //$('#contentField').css('z-index', 1000);
        $("#contentField").LoadingOverlay("show");

        TweenMax.allTo([$("#buttonPrevious"), $("#buttonNext"), $("#closeButton")], 0, {autoAlpha: 0});

        //Check if the IMG in Cache
        if($contentObject.largeIMGObject == null)           //Is not in cache
        {
            logMessage("Load Image " + $contentObject.large_image);

            if($contentObject.large_image.search(".swf") > -1)
            {
                allowSwitchPictures     = false;

                var swfContainer   = document.createElement('div');
                swfContainer.id    = "swfImage";
                $(swfContainer).addClass('LargeImage');
                $('#contentImage').append(swfContainer);

                currentSWFSettings = { data: $contentObject.large_image, width: $contentObject.width, height: $contentObject.height};

                if (swfobject.hasFlashPlayerVersion("10"))
                {
                    //currentSWFSettings = { data: $contentObject.large_image, width: $contentObject.width, height: $contentObject.height };
                    //swfobject.createSWF(currentSWFSettings, swfParameters, "swfImage");
                    swfobject.embedSWF( currentSWFSettings.data,
                        "swfImage",
                        currentSWFSettings.width,
                        currentSWFSettings.height,
                        "10",
                        "media/swf/expressInstall.swf",
                        flashVariables,
                        swfParameters,
                        swfAttributes,
                        function (evt) //onComplete-Callback
                        {
                            //Only execute if SWFObject embed was successful
                            if(evt.success)
                            {
                                logMessage("onSWFLoadComplete()");
                                $("#contentField").LoadingOverlay("hide");
                            }
                        });

                    $('#swfImage').css({ position: "absolute", top:  "50px", left: Math.round($(window).width() / 2 - ($contentObject.width / 2)) + "px" });
                    $('#closeButton').css({ position: "absolute", left: Math.round($('#swfImage').position().left + parseInt(currentSWFSettings.width) + 5) + "px" });
                    TweenMax.to($('#closeButton'), 0.5, {autoAlpha: 1});
                }else
                {
                    var att = { data:"media/swf/expressInstall.swf", width:"600", height:"240" };
                    var par = {};
                    var id = "swfImage";
                    swfobject.showExpressInstall(att, par, id, swfExpressInstallIsCanceled);
                }

                var tmpDescriptionContainer    = document.createElement('div');
                $(tmpDescriptionContainer).css({    top: "10px",
                                                    width: currentSWFSettings.width + "px",
                                                    height: parseInt(currentSWFSettings.height) + 10 + "px"});

                contentHandler.showContentText($contentObject, tmpDescriptionContainer);
                contentHandler.hideSwitchButtons();
                //Sound Settings
                //$('#muteButton').on('click', contentHandler.onClickMuteSound);
                //$('#muteButton').click(contentHandler.onClickMuteSound);
                //contentHandler.updateMuteButton();

                //Test
                //contentHandler.showSWFRepeatButton();
            }else //Image is not in Cache => LOAD
            {
                $contentObject.largeIMGObject = new Image();
                $contentObject.largeIMGObject.src  = $contentObject.large_image;
                $contentObject.largeIMGObject.id  = "largeImage";
                $($contentObject.largeIMGObject).addClass('LargeImage');

                $($contentObject.largeIMGObject ).load(function()
                {
                    $("#contentField").LoadingOverlay("hide");
                    allowSwitchPictures = true;
                    //logMessage("Large image IS LOADED");
                    contentHandler.showContentText($contentObject, this);

                    if($imgFadeIn)
                    {
                        TweenMax.killTweensOf(this);
                        $(this).css({  left: Math.round(($(window).width() / 2) - ($(this).width() / 2)) + "px"});
                        TweenMax.to(this, 0.3, {autoAlpha: 1, scaleX: 1, onComplete: contentHandler.centerImageUI, onCompleteParams: [this]});
                    }else
                    {
                        TweenMax.to(this, 0.3, {autoAlpha: 1});
                        contentHandler.centerImageUI(this);
                    }
                });

                $('#contentImage').append($contentObject.largeIMGObject);
                TweenMax.to($('#largeImage'), 0, {autoAlpha: 0});

                if($imgFadeIn)  //on Switch
                {
                    TweenMax.to($('#largeImage'), 0, {scaleX: 0});
                }
            }
        }else  //is in cache
        {
            $("#contentField").LoadingOverlay("hide");
            allowSwitchPictures = true;

            //logMessage("Image is in Cache!!!!!");
            $('#contentImage').append($contentObject.largeIMGObject);
            contentHandler.showContentText($contentObject, $contentObject.largeIMGObject);

            if($imgFadeIn)
            {
                $($contentObject.largeIMGObject).css({  left: Math.round(($(window).width() / 2) - ($($contentObject.largeIMGObject).width() / 2)) + "px"});
                TweenMax.to($contentObject.largeIMGObject, 0.3, {scaleX: 1, onComplete: contentHandler.centerImageUI, onCompleteParams: [$contentObject.largeIMGObject]});
            }else
            {
                TweenMax.to($contentObject.largeIMGObject, 0, {scaleX: 1});
                contentHandler.centerImageUI($contentObject.largeIMGObject);
            }
        }

        $('#closeButton').click(hideContent);
        $("#buttonPrevious").click(onClickPreviousPic);
        $("#buttonNext").click(onClickNextPic);
        $('#closeButton').css('z-index', 500);

        $(thumbSpawnField).css('z-index', -1);
        $(tmpContent).css('z-index', 500);

        if($imgFadeIn)
        {
            TweenMax.to(tmpContent, 0, {autoAlpha: 1});
        }else
        {
            TweenMax.to(tmpContent, 0.7, {autoAlpha: 1});
        }


        urlParameterHandler.addContentParametersToURL($contentObject);

        //Google-Analytics
        if($contentObject.subcategory != undefined && $contentObject.subcategory != null)
        {
            ga('send', 'pageview', "/" + mainCategoriesHandler.getCurrentActiveMainCategoryItem().id + "/" + $contentObject.subcategory + "/" + $contentObject.id + ".html");
        }else
        {
            ga('send', 'pageview', "/" + mainCategoriesHandler.getCurrentActiveMainCategoryItem().id + "/" + $contentObject.id + ".html");
            //ga('set', 'page', "/" + mainCategoriesHandler.getCurrentActiveMainCategoryItem().id + "/" + $contentObject.id + ".html");
        }
    };


    this.showContentText = function($contentObect, $imageBox)
    {
        if(($contentObect.title != "" && $contentObect.title != null && $contentObect.title != undefined) ||
            ($contentObect.description != "" && $contentObect.title != null && $contentObect.title != undefined))
        {
            var contentTextField   = $('#contentDescription');

            //contentTextField.html('<h3>' + $contentObect.title + '</h3>' +  $contentObect.description);
            contentTextField.css({   top:  $($imageBox).position().top + $($imageBox).height() + 20 + "px"});

            //seperate the words in spans (4 animation)
            var contentText = '<h3>' + $contentObect.title + '</h3>' + $contentObect.description.replace(/([^\s<>]+)(?:(?=\s)|$)/g, '<span>$1</span>');

            //possible-Download-link
            if($contentObect.download_URL != undefined && $contentObect.download_title != undefined)
            {
                contentTextField.html(contentText + '&nbsp' + '<span><a class="glyphicon glyphicon-paperclip" aria-hidden="true" href="' + $contentObect.download_URL + '" target="_blank"> ' + $contentObect.download_title + '</span>');
            }else
            {
                contentTextField.html(contentText);
            }

            var tmpContentWords = contentTextField.find("span");

            for(var i = 0; i < tmpContentWords.length; i++)
            {
                TweenMax.from(tmpContentWords[i], 0.3,{opacity:0, scale:2, delay: i * 0.15 + 1});
            }

            //TweenMax.staggerFromTo(contentTextField.find("span"), 0.3, {opacity:0, scaleX:7, scaleY:7}, {opacity:1, scaleX:1, scaleY:1}, 0.1);
        }else
        {
            $('#contentField').remove();
        }
    };

    this.centerImageUI = function($imageBox)
    {
        if($imageBox === undefined) { $imageBox = $("#largeImage")[0]; }

        if($imageBox != undefined  && $imageBox != null)
        {
            $($imageBox).css({  left: Math.round(($(window).width() / 2) - ($($imageBox).width() / 2)) + "px"});

            //Show the switch-buttons only, if the category has more than 1 item
            if(contentHandler.getContentByMainCategory(mainCategoriesHandler.getCurrentActiveMainCategoryItem().id).length > 1)
            {
                $("#buttonPrevious").css({  top: $($imageBox).position().top + "px",
                    left: $($imageBox).position().left - $("#buttonPrevious").width() - 10 + "px",
                    height: $($imageBox).height() + "px"});

                $("#buttonNext").css({  top: $($imageBox).position().top + "px",
                    left: $($imageBox).position().left + $($imageBox).width() + "px",
                    height: $($imageBox).height() + "px"});

                TweenMax.allTo([$("#buttonPrevious"), $("#buttonNext")], 0.5, {autoAlpha: 1});

                swipeHandler = new Hammer(document.getElementById("contentField"));
                swipeHandler.on("swipeleft swiperight", function(ev)
                {
                    //logMessage(ev.type +" gesture detected.");
                    if(ev.type == "swipeleft")
                    {
                        onClickPreviousPic();
                    }else
                    {
                        onClickNextPic();
                    }
                });
            }

            TweenMax.to($("#closeButton"), 0.5, {autoAlpha: 1});
            $("#closeButton").css({ top: $($imageBox).position().top - 20 + "px",
                                    left: $($imageBox).position().left + $($imageBox).width() + 20 + "px"});
        }
    };


    function onClickPreviousPic()
    {
        if(allowSwitchPictures && currentContentIndex != -1)
        {
            allowSwitchPictures = false;

            if(currentContentIndex === 0)
            {
                currentContentIndex = thumbUIItems.length - 1;
            }else
            {
                currentContentIndex--;
            }

            TweenMax.allTo([$("#buttonPrevious"), $("#buttonNext"), $("#closeButton")], 0.3, {autoAlpha: 0});
            TweenMax.to($('#largeImage'), 0.3, {scaleX: 0, onComplete: contentHandler.showContentAfterSwitchImage});

            //contentHandler.showContent(contentHandler.getContentObjectByID(thumbUIItems[currentContentIndex].id));
        }
    }


    function onClickNextPic ()
    {
        if(allowSwitchPictures && currentContentIndex != -1)
        {
            allowSwitchPictures = false;

            if(currentContentIndex >= thumbUIItems.length - 1)
            {
                currentContentIndex = 0;
            }else
            {
                currentContentIndex++;
            }

            TweenMax.allTo([$("#buttonPrevious"), $("#buttonNext"), $("#closeButton")], 0.3, {autoAlpha: 0});
            TweenMax.to($('#largeImage'), 0.3, {scaleX: 0, onComplete: contentHandler.showContentAfterSwitchImage});

            //contentHandler.showContent(contentHandler.getContentObjectByID(thumbUIItems[currentContentIndex].id));
        }
    }

    this.showContentAfterSwitchImage = function()
    {
        contentHandler.showContent(contentHandler.getContentObjectByID(thumbUIItems[currentContentIndex].id), true);
    }


    this.hideSwitchButtons = function()
    {
        TweenMax.allTo([$("#buttonNext"), $("#buttonPrevious")], 0, {autoAlpha: 0});
    };

    this.showSWFRepeatButton = function()
    {
        var repeatButton   = document.createElement('button');
        repeatButton.id     = "repeatButton";
        $(repeatButton).addClass('SWFRepeatButton');

        /*
         $(repeatButton).css({   top: "200px",
         left: "300px"});*/

        var repeatIcon = document.createElement('span');
        repeatIcon.id       = "repeatIcon";
        $(repeatIcon).addClass('glyphicon glyphicon-repeat SWFRepeatIcon');
        $(repeatButton).append(repeatIcon);

        $('#contentImage').append(repeatButton);

        $(repeatButton).css({   top: ($('#swfImage').position().top + ($('#swfImage').height() / 2) - ($('#repeatButton').height() / 2)) + "px",
            left: ($('#swfImage').position().left + ($('#swfImage').width() / 2)- ($('#repeatButton').width() / 2)) + "px"});

        TweenMax.to($(repeatButton), 0.5, {scaleX: 1, scaleY: 1});

        $(repeatButton).click(contentHandler.onClickSWFRepeat);
    };


    this.onClickSWFRepeat = function()
    {
        //logMessage("REPEAT GAME!!! " + $('#swfImage'))
        //swfobject.embedSWF(currentSWFSettings.data, "swfImage", currentSWFSettings.width, currentSWFSettings.height, "10", "media/swf/expressInstall.swf", flashVariables, swfParameters, swfAttributes);

        //$('#swfImage').css({ position: "absolute", top:  "50px", left: Math.round($(document).width() / 2 - ($contentObject.width / 2)) + "px" });
        contentHandler.showContent(currentContentObject);
    };

    //Mute-Function
    /*
     this.onClickMuteSound = function()
     {
     if(currentSoundVolume === 0)
     {
     //$("swfImage").prop('muted', true);
     //document.getElementById("swfImage").muted    = false;

     $('audio,video').each(function()
     {
     $(this).data('muted',false);
     });
     currentSoundVolume  = 1;
     }else
     {
     //$("swfImage").prop('muted', false);
     //document.getElementById("swfImage").muted    = true;
     $('audio,video').each(function()
     {
     $(this).data('muted',true);
     });

     var ytplayer = document.getElementById("swfImage");
     ytplayer.mute();

     currentSoundVolume  = 0;
     }

     contentHandler.updateMuteButton();
     };


     this.updateMuteButton = function()
     {
     //logMessage($('#muteIcon'));

     if($('#muteIcon').length == 0)
     {
     var muteIcon = document.createElement('span');
     muteIcon.id       = "muteIcon";
     $('#muteButton').append(muteIcon);
     }

     if(currentSoundVolume == 1)
     {
     $('#muteIcon').removeClass('glyphicon glyphicon-volume-off MuteIcon');
     $('#muteIcon').addClass('glyphicon glyphicon-volume-up MuteIcon');

     }else
     {
     $('#muteIcon').removeClass('glyphicon glyphicon-volume-up MuteIcon');
     $('#muteIcon').addClass('glyphicon glyphicon-volume-off MuteIcon');
     }
     };*/


    function hideContent ($immediately)
    {
        logMessage("hideContent()");

        if($("#contentField")[0] != undefined)
        {
            allowSwitchPictures = false;
            currentContentIndex = -1;
            $("#contentField").remove();

            if(contentHandler.getContentByMainCategory(mainCategoriesHandler.getCurrentActiveMainCategoryItem().id).length == 1)
            {
                mainCategoriesHandler.resetAllItems();
            }

            urlParameterHandler.updateURLParameters();
            currentContentObject    = null;
        }
    }


    this.onClickItem = function(evt)
    {
        //logMessage(evt.currentTarget.id);

        if(contentHandler.getContentObjectByID(evt.currentTarget.id) != null)
        {
            currentContentIndex        = evt.currentTarget.index;
            contentHandler.showContent(contentHandler.getContentObjectByID(evt.currentTarget.id));
        }else
        {
            logMessage("");
        }
    };

    this.removeThumbItem = function($item)
    {
        if($.contains($item, thumbSpawnField))
        {
            thumbSpawnField.removeChild($item);
            $item   = undefined;
        }
    };

    //return: Array
    this.getContentByMainCategory = function($id)
    {
        return contentObjects.filter(function($content, $index, $contentObjects)
        {
            return $content.id === $id;
        })[0];
    };


    //return: Array
    this.getContentBySubCategory = function($mainCategoryID, $subCategoryID)
    {
        //logMessage("????? " + $mainCategoryID);

        return contentHandler.getContentByMainCategory($mainCategoryID).filter(function($content, $index, $contentObjects)
        {
            return $content.subcategory === $subCategoryID;
        });
    };

    //return: Object
    this.getContentObjectByID = function($contentID)
    {
        return $.grep(contentHandler.getContentByMainCategory(mainCategoriesHandler.getCurrentActiveMainCategoryItem().id), function(element)
        {
            return element.id == $contentID;
        })[0];
    };
}
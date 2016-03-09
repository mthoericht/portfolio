/**
 * Created by marcus on 28.11.15.
 */
var mainCategoriesHandler;
var subCategegoriesHandler;
var contentHandler;
var urlParameterHandler;
var currentSoundVolume  = 1;
var currentOrientation;

$(window).resize(onResize);

function init()
{
    logMessage("init()");

    $("#btnImprint").click(onClickImprint);

    contentHandler              = new ContentHandler();
    mainCategoriesHandler       = new MainCategoriesHandler();
    subCategegoriesHandler      = new SubCategoriesHandler();
    urlParameterHandler         = new URLParameterHandler();

    //$(document).on("orientationchange", onChangeOrientation);

    $.LoadingOverlaySetup({
        color           : "rgba(0, 0, 0, 0)",
        image           : "media/gif/103.gif",      //http://preloaders.net/
        maxSize         : "250px",
        minSize         : "100px",
        resizeInterval  : 0
        //size            : "100%"
    });

    loadJson("main", function($mainJsonObject)
                    {
                        $.LoadingOverlay("hide");
                        mainCategoriesHandler.generate($mainJsonObject);

                        TweenMax.to(this, 1.5, {onComplete: urlParameterHandler.reactOnMainCategoryParameters});
                        //urlParameterHandler.reactOnMainCategoryParameters();

                        //logMessage("Has URL-Parameters? " + urlParameterHandler.getCurrentQueryObject().mainCategory);
                    });

    $("#thumbSpawnField").addClass('ThumbSpawnField');
    $("#welcome").addClass('Welcome');
    $.LoadingOverlay("show");
};


function onResize()
{
    TweenMax.killTweensOf(this);
    TweenMax.to(this, 1, {onComplete: contentHandler.rearrangeThumbs});
    centerUI();
};

function centerUI()
{
    contentHandler.centerImageUI();
    //$('#menu').css({  left: Math.round(($(document).width() / 2) - ($('#menu').width() / 2)) + "px"});
    $('#menu').css({  left: Math.round(($(window).width() / 2) - 280) + "px"});
}


function onChangeOrientation($event, $orientation)
{
    currentOrientation      = $orientation;
    logMessage("onChangeOrientation() to " + $orientation);
    logMessage("onChangeOrientation() to " + $orientation);

    mainCategoriesHandler.setOrientation($orientation);
    subCategegoriesHandler.hideAll();
    TweenMax.to(subCategegoriesHandler, 0.5, {onComplete: subCategegoriesHandler.setOrientation, onCompleteParams: [$orientation]});
    contentHandler.setOrientation($orientation);
};


function initWelcome($welcomeObject)
{
    $("#welcomeHeader").html($welcomeObject.headline);
    $("#welcomeDescription").html($welcomeObject.description);

    showWelcome(true);
};


function showWelcome($show)
{
    if($show && $('#welcome').css('opacity') == 0)
    {
        TweenMax.killTweensOf($("#welcome"));
        TweenMax.to($("#welcome"), 1, {autoAlpha: 1, delay:1});

        var blurElement = { a:50 };
        TweenMax.to(blurElement, 1, {a:0, delay: 1, onUpdate: function()
                {
                    TweenMax.set([$("#welcome")], {webkitFilter: "blur(" + blurElement.a + "px)", filter:"blur(" + blurElement.a + "px)"});
                }});
    }else if(!$show)
    {
        TweenMax.killTweensOf($("#welcome"));
        TweenMax.to($("#welcome"), 0.5, {autoAlpha:0});
    }
};



function onClickImprint()
{
    if($('#imprint').css('opacity') == 0)
    {
        $('#contentField').css('z-index', 1500);
        TweenMax.to($("#imprint"), 0.5, {autoAlpha:1});
        TweenMax.from($("#imprintText"), 0.5, {autoAlpha:0, top: $(document).height()});
        TweenMax.to($("#btnImprintClose"), 0, {autoAlpha:0});
        TweenMax.to($("#btnImprintClose"), 0.5, {autoAlpha:1, delay:0.5});
        $("#btnImprintClose").click(closeImprint);

        //Google-Analytics
        //ga('send', 'pageview', location.pathname + "/imprint");
        ga('send', 'pageview', "/imprint.html");
    }
};


function closeImprint()
{
    if($('#imprint').css('opacity') == 1)
    {
        TweenMax.to($("#btnImprintClose"), 0.5, {autoAlpha:0});
        TweenMax.to($("#imprint"), 0.5, {autoAlpha:0});
        TweenMax.to($("#imprintText"), 0.5, {autoAlpha:0, top: $(document).height(), onComplete: function()
                                                                                    {
                                                                                        TweenMax.to($("#imprintText"), 0, {autoAlpha:1});
                                                                                        $("#imprintText").css({top: "15vh"});
                                                                                    }});
    }
};


function loadJson($jsonID, $onCompleteCallback)
{
    if(typeof $onCompleteCallback === "function")
    {
        $.getJSON("data/" + $jsonID + ".json")
            .done(function($data)
            {
                logMessage("data/" + $jsonID + ".json is loaded ");

                $data.id        = $jsonID;          //Add the id to the callback-object
                $onCompleteCallback($data);
            })
            .fail(function( $jqXHR, $textStatus, $error )
            {
                logMessage("loadJson(" + $jsonURL + ") Request Failed: " + $textStatus + ", " + $error );
            });
    }else
    {
        logMessage("loadJson() $onCompleteCallback is not a function!");
    }
}


//Interface with ExternalInterface (inGame)
//--------------------------------------------------------
function swfGameIsFinished()
{
    logMessage("swfGameIsFinished()");
    contentHandler.showSWFRepeatButton();
}


function closeSWFGame()
{
    logMessage("closeSWFGame()");
    contentHandler.hideContent();
}


function swfExpressInstallIsCanceled()
{
    logMessage("swfExpressInstallIsCanceled()");
}
//--------------------------------------------------------
function random(min, max)
{
    return (Math.random() * (max - min)) + min;
}

function logMessage($message)
{
    console.log($message);
}
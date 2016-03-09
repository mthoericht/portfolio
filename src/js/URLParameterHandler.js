/**
 * Created by marcus on 11.02.16.
 */
function URLParameterHandler()
{
    var currentQueryObject;

    //On open the HP with the Parameters
    this.reactOnMainCategoryParameters = function()
    {
        logMessage("REACT ON PARAMETERS!");
        currentQueryObject = urlParameterHandler.getCurrentQueryObject();

        if(currentQueryObject.maincategory != undefined)
        {
            mainCategoriesHandler.showMainCategory(currentQueryObject.maincategory, urlParameterHandler.reactOnContentParameters);
        }
    };


    //On open the HP with the Parameters
    this.reactOnContentParameters = function()
    {
        if(currentQueryObject.maincategory != undefined)
        {
            if(currentQueryObject.subcategory != undefined)
            {
                subCategegoriesHandler.highlightItem(currentQueryObject.subcategory);
                showWelcome(false);
            }

            if(currentQueryObject.content != undefined)
            {
                contentHandler.showContent(contentHandler.getContentObjectByID(currentQueryObject.content), false);
                showWelcome(false);
            }
        }
    };


    //Without Content
    this.updateURLParameters = function()
    {
        logMessage("updateURLParameters()");

        urlParameterHandler.removeAllParametersFromURL();

        var tmpURLParameters;

        if(mainCategoriesHandler.getCurrentActiveMainCategoryItem() != undefined && mainCategoriesHandler.getCurrentActiveMainCategoryItem() != null)
        {
            tmpURLParameters = "?maincategory=" + mainCategoriesHandler.getCurrentActiveMainCategoryItem().id;

            if(subCategegoriesHandler.getCurrentActiveSubCategoryUIItem() != undefined && subCategegoriesHandler.getCurrentActiveSubCategoryUIItem() != null)
            {
                tmpURLParameters += "&subcategory=" + subCategegoriesHandler.getCurrentActiveSubCategoryUIItem().id;
            }

            history.pushState(null, "Marcus Thöricht", tmpURLParameters);
        }
    };


    this.addContentParametersToURL = function($contentObject)
    {
        if($contentObject.subcategory != undefined && $contentObject.subcategory != null)
        {
            history.pushState(null, $contentObject.title, "?maincategory=" + mainCategoriesHandler.getCurrentActiveMainCategoryItem().id
                + "&subcategory=" + $contentObject.subcategory
                + "&content=" + $contentObject.id);
        }else
        {
            history.pushState(null, $contentObject.title, "?maincategory=" + mainCategoriesHandler.getCurrentActiveMainCategoryItem().id
                + "&content=" + $contentObject.id);
        }
    };


    //Returns a object with the current URL-Parameters
    this.getCurrentQueryObject = function()
    {
        var tmpQueryObject = {};
        var tmpQuery = window.location.search.substring(1);
        var tmpVariables = tmpQuery.split("&");

        for (var i=0; i < tmpVariables.length; i++)
        {
            var pair = tmpVariables[i].split("=");

            if (typeof tmpQueryObject[pair[0]] === "undefined")
            {
                tmpQueryObject[pair[0]] = decodeURIComponent(pair[1]);
            } else if (typeof tmpQueryObject[pair[0]] === "string")
            {
                var arr = [tmpQueryObject[pair[0]],decodeURIComponent(pair[1])];
                tmpQueryObject[pair[0]] = arr;
            } else
            {
                tmpQueryObject[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }

        return tmpQueryObject;
    };


    this.removeAllParametersFromURL = function()
    {
        logMessage("removeAllParametersFromURL()");
        window.history.pushState(null, "Portfolio", location.href.substring(0, location.href.indexOf('?')) );
    };
}
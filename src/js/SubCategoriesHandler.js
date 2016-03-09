/**
 * Created by marcus on 11.02.16.
 */
function SubCategoriesHandler()
{
    var subCategoryContainer = document.getElementById("subCategories");
    var subCategoryUIItems;
    var currentActiveSubCategoryUIItem;

    this.showSubCategegories = function($id)
    {
        subCategoryUIItems          = [];
        var subCategoryIDs          = subCategegoriesHandler.getUniqueSubCategoryIDs($id);

        for(var i = 0; i < subCategoryIDs.length; i++)
        {
            subCategoryUIItems[i]    = document.createElement('button');
            TweenMax.to(subCategoryUIItems[i], 0, {opacity: 0});
            //optional with jQuery: $(mainCategoriesHandler.getCurrentActiveMainCategoryItem()).position().left
            //subCategoryUIItems[i].style.top   = mainCategoriesHandler.getCurrentActiveMainCategoryItem().style.top;
            subCategoryUIItems[i].id = subCategoryIDs[i];
            //menuItems[i].setAttribute('class', 'MenuItem');
            $(subCategoryUIItems[i]).addClass('SubCategoryItem');
            subCategoryUIItems[i].innerHTML = subCategegoriesHandler.getTitle(subCategoryIDs[i]);
            subCategoryUIItems[i].addEventListener("click", onClickItem);

            //subCategoryUIItems[i].style.height;
            //TweenMax.to(subCategoryUIItems[i], 0.5, {   opacity: 1, delay: i / 10});

            subCategoryContainer.appendChild(subCategoryUIItems[i]);

            TweenMax.to(subCategoryUIItems[i], 0, {left: (i * 120), top: 75});
            TweenMax.to(subCategoryUIItems[i], 0.5, {opacity: 1, delay: i / 10});

        }
    };


    function onClickItem (evt)
    {
        logMessage("Click Subcategory " + evt.target.id);

        if(currentActiveSubCategoryUIItem != evt.target)
        {
            subCategegoriesHandler.highlightItem(evt.target.id);
        }

        urlParameterHandler.updateURLParameters();
    }

    this.highlightItem = function($id)
    {
        subCategegoriesHandler.resetAllItems();
        currentActiveSubCategoryUIItem    = document.getElementById($id);

        //currentActiveSubCategoryUIItem.className = 'SubCategoryItem SubCategoryItemActive';
        $(currentActiveSubCategoryUIItem).addClass('SubCategoryItemActive');
        contentHandler.showThumbs(contentHandler.getContentBySubCategory(mainCategoriesHandler.getCurrentActiveMainCategoryItem().id, currentActiveSubCategoryUIItem.id), currentActiveSubCategoryUIItem);
    };


    this.getUniqueSubCategoryIDs = function ($maincategoryID)
    {
        var categoryContent     = contentHandler.getContentByMainCategory($maincategoryID);
        var uniqueSubCategoryIDs = [];

        //Check that the subcategory-IDs only existing one time in the uniqueSubCategoryIDs (Redundant-check) => jQuery-method
        $.each(categoryContent, function(i, element)
        {
            //inArray() checks, that the element exists
            if($.inArray(element.subcategory, uniqueSubCategoryIDs) === -1 && element.subcategory != undefined)
            {
                uniqueSubCategoryIDs.push(element.subcategory);
            }
        });

        return uniqueSubCategoryIDs;
    };

    //Returns the title of a specific Subtitle-ID
    this.getTitle = function ($subcategoryID)
    {
        //grep function (jQuery) is for searching (like array filter)
        var tmpSubcategory = $.grep(mainCategoriesHandler.getSubCategories(), function(element)
        {
            return element.id == $subcategoryID;
        })[0];

        if(tmpSubcategory === undefined) return null;
        else return tmpSubcategory.title;
    };


    this.removeAll = function ()
    {
        logMessage("REMOVE ALL SUBS");

        currentActiveSubCategoryUIItem = null;

        if(subCategoryUIItems != null && subCategoryUIItems.length > 0)
        {
            for(var i = 0; i < subCategoryUIItems.length; i++)
            {
                //TweenMax.to(subCategoryUIItems[i], 0.3, {scaleY: 0, onComplete: subCategoryContainer.removeSubCategoryItem, onCompleteParams:[subCategoryUIItems[i]]});
                subCategegoriesHandler.removeSubCategoryItem(subCategoryUIItems[i]);
            }
        }
    };


    this.removeSubCategoryItem = function($subCategoryItem)
    {
        if($(subCategoryContainer).find("#" + $subCategoryItem.id)[0])
        {
            subCategoryContainer.removeChild($subCategoryItem);
        }
    };


    this.resetAllItems = function()
    {
        currentActiveSubCategoryUIItem       = null;

        for(var i = 0; i < subCategoryUIItems.length; i++)
        {
            $(subCategoryUIItems[i]).removeClass('SubCategoryItemActive');
        }
    };


    this.getCurrentActiveSubCategoryUIItem = function()
    {
        return currentActiveSubCategoryUIItem;
    };
}
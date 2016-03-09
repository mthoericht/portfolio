/**
 * Created by marcus on 11.02.16.
 */
function MainCategoriesHandler()
{
    var mainCategories= document.getElementById("mainCategories");
    var mainCategoryUIItems;
    var currentActiveMainCategoryUIItem;
    var subcategorieObjects    = [];

    this.generate = function($mainJsonObject)
    {
        logMessage("MainCategoriesHandler() generate()");

        initWelcome($mainJsonObject.welcome);

        mainCategoryUIItems   = [];
        for(var i = 0; i < $mainJsonObject.maincategories.length; i++)
        {
            mainCategoryUIItems[i]    = document.createElement('button');
            TweenMax.to(mainCategoryUIItems[i], 0, {opacity: 0, scaleX: 0, scaleY: 0});
            mainCategoryUIItems[i].id = $mainJsonObject.maincategories[i].id;
            //menuItems[i].setAttribute('class', 'MenuItem');
            $(mainCategoryUIItems[i]).addClass('MainCategoryItem');
            mainCategoryUIItems[i].innerHTML =  '<span class="' + $mainJsonObject.maincategories[i].glyphicon + '"></span> <br>' + $mainJsonObject.maincategories[i].title;
            mainCategoryUIItems[i].addEventListener("click", mainCategoriesHandler.onClickItem);

            mainCategories.appendChild(mainCategoryUIItems[i]);

            TweenMax.to(mainCategoryUIItems[i], 0.5, {opacity: 1, scaleX: 1, scaleY: 1, delay: i / 5 + 0.5});
            TweenMax.to(mainCategoryUIItems[i], 0, {top: 10, left: i * 142});
        }

        subcategorieObjects     = $mainJsonObject.subcategories;
        onResize();
    };


    this.onClickItem = function(evt)
    {
        mainCategoriesHandler.showMainCategory(evt.currentTarget.id);
        urlParameterHandler.updateURLParameters();
    };


    this.showMainCategory = function($id)
    {
        var tmpChoosedMainCategoryUIItem  = document.getElementById($id);

        if(currentActiveMainCategoryUIItem != tmpChoosedMainCategoryUIItem)
        {
            //contentHandler.removeAllThumbItems(true);
            mainCategoriesHandler.resetAllItems();
            currentActiveMainCategoryUIItem   = tmpChoosedMainCategoryUIItem;

            //evt.target.classList.add("Active");
            $(currentActiveMainCategoryUIItem).addClass('MainCategoryItemActive');

            TweenMax.killTweensOf(currentActiveMainCategoryUIItem);
            TweenMax.to(currentActiveMainCategoryUIItem, 0.3, {scaleX: 1.2, scaleY: 1.2});

            if(!contentHandler.getContentJsonIsLoaded($id))
            {
                //Test without Json
                //contentHandler.addMainCategoryContent({id: evt.target.id});
                loadJson($id, mainCategoriesHandler.onContentJsonIsLoaded);
            }else
            {
                if(subCategegoriesHandler.getUniqueSubCategoryIDs($id).length > 0)
                {
                    subCategegoriesHandler.showSubCategegories($id);
                }else if(contentHandler.getContentByMainCategory(currentActiveMainCategoryUIItem.id).length == 1)        //if only 1 item in the maincategory (example about)
                {
                    contentHandler.showContent(contentHandler.getContentByMainCategory(currentActiveMainCategoryUIItem.id)[0], false);
                }else
                {
                    contentHandler.showThumbs(contentHandler.getContentByMainCategory(currentActiveMainCategoryUIItem.id));
                }
            }
        }else
        {
            contentHandler.removeAllThumbItems(true);
            mainCategoriesHandler.resetAllItems();
            subCategegoriesHandler.removeAll();
        }
    };


    this.onContentJsonIsLoaded = function($contentObject)
    {
        contentHandler.add($contentObject);

        if(subCategegoriesHandler.getUniqueSubCategoryIDs($contentObject.id).length > 0)
        {
            subCategegoriesHandler.showSubCategegories($contentObject.id);
        }else if($contentObject.length == 1)        //if only 1 item in the maincategory (example about)
        {
            contentHandler.showContent($contentObject[0], false);
        }else
        {
            contentHandler.showThumbs(contentHandler.getContentByMainCategory($contentObject.id));
        }

        urlParameterHandler.reactOnContentParameters();
    };


    this.getCurrentActiveMainCategoryItem = function()
    {
        return currentActiveMainCategoryUIItem;
    };

    this.getSubCategories = function()
    {
        return subcategorieObjects;
    };


    this.resetAllItems = function()
    {
        if(currentActiveMainCategoryUIItem != null)
        {
            subCategegoriesHandler.removeAll();
        }

        currentActiveMainCategoryUIItem       = null;

        for(var i = 0; i < mainCategoryUIItems.length; i++)
        {
            $(mainCategoryUIItems[i]).removeClass('MainCategoryItemActive');
            TweenMax.to(mainCategoryUIItems[i], 0.5, {scaleX: 1, scaleY: 1});
        }
    };
}
var contextMenuItem = {
    "id": "idsmenu",
    "title": "Search products",
    "contexts": ["selection"],  // ContextType
};
var cleanProductIgnorePrice = [];
var countApiIgnorePrice = 0;

chrome.runtime.onInstalled.addListener(function(){
    chrome.contextMenus.create(contextMenuItem);
});
chrome.contextMenus.onClicked.addListener(function (word) {
    var query = word.selectionText;
    cleanProductIgnorePrice = [];
    countApiIgnorePrice = 0;
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'openModal', data: query});
    });
    showNewProductsIgnorePrice(query);


});


function showNewProductsIgnorePrice(productName) {
    var firstWordProduct = '';
    if (productName.length) {
        firstWordProduct = productName.split(' ')[0];
    }
    var query1 = {
        ajax: true,
        page: 1,
        q: productName
    };

    $.ajax({
        url: 'https://www.lazada.sg/catalog',
        type: 'get', //send it through get method
        data: query1,
        success: function (response) {
            if (typeof response == 'string') {

            } else if ('listItems' in response.mods) {
                var products = response.mods.listItems;
                for (var i = 0; i < products.length; i++) {
                    var product = products[i];
                    var realPrice = parseFloat(product.price);
                    if (product.name.includes(firstWordProduct)) {
                        cleanProductIgnorePrice.push({
                            'name': product.name,
                            'price': realPrice,
                            'url': `https://${product.productUrl}`,
                            'image': product.image
                        });
                    }
                }
            }
            countApiIgnorePrice = countApiIgnorePrice + 1;
            sendProduct(countApiIgnorePrice);
        },
        error: function (xhr) {
            console.log(xhr);
            countApiIgnorePrice = countApiIgnorePrice + 1;
            sendProduct(countApiIgnorePrice);
        }
    });

    var query2 = {
        keyword: productName,
    };
    $.ajax({
            url: 'https://shopee.sg/api/v2/search_items/?by=relevancy&limit=50&newest=0&order=desc&page_type=search&version=2',
            type: 'get', //send it through get method
            headers: {
                'if-none-match-': '55b03-' + makeId(32),
            },
            data: query2,
            success: function (response) {
                if ('items' in response) {
                    var products = response.items;
                    for (var i = 0; i < products.length; i++) {
                        var product = products[i];
                        var realPrice = product.price / 100000;
                        if (product.name.includes(firstWordProduct)) {
                            var removeSpaceName = product.name.replace('|', '');
                            removeSpaceName = removeSpaceName.replace(' ', '-');
                            cleanProductIgnorePrice.push({
                                'name': product.name,
                                'price': realPrice,
                                'url': `https://shopee.sg/${removeSpaceName}-i.${product.shopid}.${product.itemid}`,
                                'image': `https://cf.shopee.sg/file/${product.image}`
                            });
                        }
                    }
                }
                countApiIgnorePrice = countApiIgnorePrice + 1;
                sendProduct(countApiIgnorePrice);
            },
            error: function (xhr) {
                console.log(xhr);
                countApiIgnorePrice = countApiIgnorePrice + 1;
                sendProduct(countApiIgnorePrice);
            }
        }
    );
}


function sendProduct(count) {
    if (count === 2) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "sendProduct", data: cleanProductIgnorePrice});
        });
    }

}

function makeId(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
var cleanProduct = [];
var countApi = 0;


$(document).ready(function () {
    $('#btn-compare').click(function (e) {
        e.preventDefault();
        $(this).attr('disabled','disabled');
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "detect"}, function (response) {
                    var result = response.result;
                    if(result.productPrice && result.productTitle && result.hasBtnCart) {
                        $('.ids-product-list').empty();
                        cleanProduct = [];
                        showNewProducts(response.result);
                    }
                });
            });

    });
    showOldProducts();
});

function showOldProducts() {
    if (localStorage.getItem('oldProducts')) {
        cleanProduct = JSON.parse(localStorage.getItem('oldProducts'));
        countApi = 2;
        loadData(countApi);
    }
}

function showNewProducts(item) {
    var firstWordProduct = '';
    if (item.productTitle.length) {
        firstWordProduct = item.productTitle.split(' ')[0];
    }
    var query1 = {
        ajax: true,
        page: 1,
        q: item.productTitle
    };

    var priceDiscount = parseFloat(item.productPrice) * 50 / 100;
    $('.ids-dual-ring').show();
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
                    if (product.name.includes(firstWordProduct) && realPrice >= priceDiscount && realPrice <= parseFloat(item.productPrice)) {
                        cleanProduct.push({
                            'name': product.name,
                            'price': realPrice,
                            'url': `https://${product.productUrl}`,
                            'image': product.image
                        });
                    }
                }
            }
            countApi = countApi + 1;
            loadData(countApi);
        },
        error: function (xhr) {
            console.log(xhr);
            countApi = countApi + 1;
            loadData(countApi);
        }
    });

    var query2 = {
        keyword: item.productTitle,
    };
    $.ajax({
            url: 'https://shopee.sg/api/v2/search_items/?by=relevancy&limit=50&newest=0&order=desc&page_type=search&version=2',
            type: 'get', //send it through get method
            headers: {
                'if-none-match-': '55b03-' + makeId(32)
            },
            data: query2,
            success: function (response) {
                if ('items' in response) {
                    var products = response.items;
                    for (var i = 0; i < products.length; i++) {
                        var product = products[i];
                        var realPrice = product.price / 100000;
                        if (product.name.includes(firstWordProduct) && realPrice >= priceDiscount && realPrice <= parseFloat(item.productPrice)) {
                            var removeSpaceName = product.name.replace('|', '');
                            removeSpaceName = removeSpaceName.replace(' ', '-');
                            cleanProduct.push({
                                'name': product.name,
                                'price': realPrice,
                                'url': `https://shopee.sg/${removeSpaceName}-i.${product.shopid}.${product.itemid}`,
                                'image': `https://cf.shopee.sg/file/${product.image}`
                            });
                        }
                    }
                }
                countApi = countApi + 1;
                loadData(countApi);
            },
            error: function (xhr) {
                console.log(xhr);
                countApi = countApi + 1;
                loadData(countApi);
            }
        }
    );
}

function loadData(count) {
    if (count === 2) {

        var ul = '';
        $('.ids-dual-ring').hide();
        if (cleanProduct.length) {
            sortProducts();
            localStorage.setItem('oldProducts', JSON.stringify(cleanProduct));
            for (var i = 0; i < cleanProduct.length; i++) {
                var li = '<li class="ids-product-item">';
                li += '<div class="ids-product-left">';
                li += '<img src="' + cleanProduct[i].image + '"/>';
                li += '</div>';
                li += '<div class="ids-product-middle">';
                li += '<h1><a href="' + cleanProduct[i].url + '" target="_blank">' + cleanProduct[i].name + '</a></h1>';
                li += '<p>-</p>';
                li += '</div>';
                li += '<div class="ids-product-right">';
                li += '<p class="old-price">-</p>';
                li += '<p class="new-price">' + cleanProduct[i].price + '$</p>';
                li += '<p class="stock">-</p>';
                li += '</div>';
                li += '</li>';
                ul += li;
            }

        } else {
            var li = '<li class="ids-product-item">';
            li += '<h1>No product found</h1>';
            li += '</li>';
            ul += li;
        }
        $('.ids-product-list').html(ul);
        $('#btn-compare').removeAttr('disabled');
        countApi = 0;
    }

}

function sortProducts() {
    cleanProduct.sort(function (a, b) {
        return parseFloat(a.price) - parseFloat(b.price);
    });
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

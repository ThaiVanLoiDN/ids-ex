chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request.action == 'detect') {
            sendResponse({
                result: detectProduct()
            });
        } else if (request.action == 'openModal') {
            var idsModal = $('#ids-modal-wrap');
            if (!idsModal.length) {
                createIdsModal();
                idsModal = $('#ids-modal-wrap');
                $('#ids-close').click(function () {
                    idsModal.hide();
                });
            }
            $('.ids-product-list').empty();
            idsModal.show();
            $('.ids-dual-ring').show();
        } else if (request.action == 'sendProduct') {
            loadData(request.data);
        }

    }
);

$(document).ready(function() {
    if(window.location.href == 'https://www.newbalance.com.sg/en/checkout/cart/') {
        $('.custom-promo input').val('FESTIVE20');
    }
});

var titleIds = '';
var titleClasses = '.attM6y>span, .pdp-mod-product-badge-title, .gl-heading, .quickview_title>span, .desktop_product_details > h1,' +
    ' .product-name, .product-info-main  .page-title > span, #productItemTitle > h1, .product_name > span,' +
    ' .fl-product-details--headline > span, .page-title-wrapper > .page-title > span, .cf-product-order > h1 > span,' +
    ' #DynamicHeading_productTitle, .product-info-title .page-title-wrapper, .singleModelTitle, .pd-header-navigation__headline-text,' +
    ' .product-summary-name, .p-heading-product-inner > .p-heading-light p-sub-title, .PageTitleStyle1 > h1 > #body,' +
    ' #quick-shop-title';
var priceIds = '';
var priceClasses = 'div._3e_UQT, .pdp-price_type_normal, .gl-price-item, .pdwebprice .sp_amt, .price-final_price  .price,' +
    ' #productItemTitle > .itemPrices > span, .modal_price > .money, #js-detail_price_without_selectedSize,' +
    ' .fl-price--sale > span, .price-final_price > .price-wrapper > .price, .cf-dell-price >  .cf-price, .pi-price-text,' +
    ' .price-wrapper > .price, .pricingSummary-details-final-price, .pd-buying-price__new-price, .price-update > .price,' +
    ' .product_title_wrapper .amount, .product-summary-price-dollar, .p-price > .p-heading-bold, .price > .highlight, .a8ProductPrice > .a8SalesPrice,' +
    ' #product-mega-pricing > span, #quick-shop-price';

var addCartClasses = '._1BdIQL>button, .navbtn_m>.mj_btnbg, .tocart, #addToBasket, .add-to-basket, .cf-atc-btn, #buttons_AddToCartButton,' +
    ' #buttons_ConfigureDeviceButton, .product_detail_pages_models_form_submit, .tg-add-to-cart, .js-add-to-basket, .a8AddtoCartButton,' +
    ' #quick-shop-add';

function detectProduct() {
    var productTitle = '';
    var productPrice = '';

    if ($(titleClasses).length) {
        productTitle = $(titleClasses).first().text();
    } else if ($("[id*='product'][id*='title']").text()) {
        productTitle = $("[id*='product'][id*='title']").text();
    } else if ($("[class*='product'][class*='title']").length) {
        productTitle = $("[class*='product'][class*='title']").first().text();
    }

    if ($(priceClasses).length) {
        productPrice = $(priceClasses).first().text();
    } else if ($("[id*='product'][id*='price']").text()) {
        productPrice = $("[id*='product'][id*='price']").text();
    } else if ($("[class*='product'][class*='price']").length) {
        productPrice = $("[class*='product'][class*='price']").first().text();
    }

    var hasBtnCart = false;
    if ($("[class*='add'][class*='cart']").length || $("[id*='button'][id*='cart']").length || $(addCartClasses).length) {
        hasBtnCart = true;
    }

    if ($('.fl-price--sale').length) {
        //foot locker
        productPrice = productPrice.replace(',', ".");
    }
    if ($('.pi-price-text').length) {
        //micro
        productPrice = productPrice.replace(' incl. GST', "");
    }

    if ($('.product-summary-price-dollar').length) {
        productPrice = productPrice.substr(0, productPrice.indexOf('00 \n' +
            '                          '));
    }
    if (productPrice.indexOf('-') != -1) {
        productPrice = productPrice.substr(0, productPrice.indexOf('-'));
        productPrice = productPrice.trim();
    }
    var number = Number(productPrice.replace(/[^0-9\.-]+/g, ""));
    productPrice = number;


    if (productTitle) {
        productTitle = productTitle.trim();
    }

    return {
        productPrice,
        productTitle,
        hasBtnCart
    }
}

function createIdsModal() {
    var html = '';
    html +='<div id="ids-modal-wrap" class="ids-modal">';
    html +='<div class="ids-modal-content">';
    html +='<span id="ids-close">&times;</span>';
    html += '<div class="ids-dual-ring" style="display: none;"></div>';
    html += '<ul class="ids-product-list"></ul>';
    html +='</div>';
    html +='</div>';
    $('body').append(html);
}






function loadData(products) {
    $('.ids-dual-ring').hide();
    var ul = '';
    if (products.length) {
        var sortData = sortProducts(products);
        for (var i = 0; i < sortData.length; i++) {
            var li = '<li class="ids-product-item">';
            li += '<div class="ids-product-left">';
            li += '<img src="' + sortData[i].image + '"/>';
            li += '</div>';
            li += '<div class="ids-product-middle">';
            li += '<h1><a href="' + sortData[i].url + '" target="_blank">' + sortData[i].name + '</a></h1>';
            li += '<p>-</p>';
            li += '</div>';
            li += '<div class="ids-product-right">';
            li += '<p class="old-price">-</p>';
            li += '<p class="new-price">' + sortData[i].price + '$</p>';
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

}

function sortProducts(arrayData) {
    return arrayData.sort(function (a, b) {
        return parseFloat(a.price) - parseFloat(b.price);
    });
}



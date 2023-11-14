const socket=io()
socket.on("realTimeProduct", product=>{

let ulProducts = document.querySelector('ul')
let liNuevoProduct = document.createElement('li')
liNuevoProduct.innerHTML = `${product.title} - ${product.description} - $${product.price}`
ulProducts.innerHTML += liNuevoProduct.outerHTML
})

socket.on('realTimeProductDelete', productId => {
    let ulProducts = document.querySelector('ul');
    let liToDelete = document.querySelector(`li[data-product-id="${productId}"]`);

    if (liToDelete) {
        ulProducts.removeChild(liToDelete);
    }
});
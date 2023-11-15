const socket=io()
socket.on("realTimeProduct", product=>{

let ulProducts = document.querySelector('ul')
let liNuevoProduct = document.createElement('li')
liNuevoProduct.setAttribute("id", `product-${product.id}`)
liNuevoProduct.innerHTML = `${product.title} - ${product.description} - $${product.price}`
ulProducts.innerHTML += liNuevoProduct.outerHTML
})

socket.on('realTimeProductDelete', productId => {
    const product = `product-${productId}`
let item = document.getElementById(product)
if (item) {
    item.remove();
}
})
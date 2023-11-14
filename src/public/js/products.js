const socket=io()
socket.on("realTimeProduct", product=>{

let ulProducts = document.querySelector('ul')
let liNuevoProduct = document.createElement('li')
liNuevoProduct.innerHTML = `${product.title} - ${product.description} - $${product.price}`
ulProducts.innerHTML += liNuevoProduct.outerHTML
})
const socket=io()

socket.on("realTimeProduct", product=>{

console.log(product)
let ulProducts = document.querySelector('ul')
let liNuevoProduct = document.createElement('li')
liNuevoProduct.innerHTML = product
ulProducts.append(liNuevoProduct)
})
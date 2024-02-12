const errorDictionary = {
    PRODUCT_NOT_FOUND: 'El producto no se encuentra',
    PRODUCT_CREATION_FAILED: 'Error al crear el producto',
    PRODUCT_DELETION_FAILED: 'Error al eliminar el producto',
    PRODUCT_UPDATED_FAILED: 'Error al actualizar el producto',
    PRODUCTS_FETCH_FAILED: 'Error al obtener productos',
    CART_ADDITION_FAILED: 'Error al agregar el producto al carrito',
    STOCK_INSUFFICIENT: 'No hay suficiente stock disponible',
    CART_NOT_FOUND: 'El carrito no se encuentra',
    CARTS_FETCH_FAILED: 'Error al obtener carritos',
    CART_CREATION_FAILED: 'Error al crear el carrito',
    PRODUCT_REMOVAL_FAILED: 'Error al eliminar el producto del carrito',
    PRODUCTS_REMOVAL_FAILED: 'Error al eliminar todos los productos del carrito',
    PRODUCT_UPDATE_FAILED: 'Error al actualizar el producto del carrito',
    CART_UPDATE_FAILED: 'Error al actualizar el carrito',
    PRODUCT_QUANTITY_UPDATE_FAILED: 'Error al actualizar la cantidad del producto',
    SERVER_ERROR: 'Error de servidor',
};

function customizeError(errorCode) {
    const errorMessage = errorDictionary[errorCode] || 'Error desconocido';
    const error = new Error(errorMessage);
    error.code = errorCode;
    return error;
}

module.exports = {
    customizeError,
    errorDictionary
};
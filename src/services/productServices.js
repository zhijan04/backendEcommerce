const { addProductMongo, getProductById, updateProductMongo, deleteProductMongo, getProductsMongo } = require('../dao/ProductManager.js');
const productosModelo = require('../dao/models/productsModel.js');


function handleServerError(res) {
    res.status(500).json({ error: "Error de servidor" });
}

function validateFields(data, fields) {
    return fields.filter(field => !(field in data));
}
class productService{
    constructor(){}
        
        static async getProducts(req,res){
            try {
                const { limit = 10, page = 1, query, filterType, filterValue, sort } = req.query;
                const startIndex = (page - 1) * limit;
        
                let searchQuery = {};
                if (query) {
                    searchQuery = { $text: { $search: query } };
                }
                if (filterType && filterValue) {
                    searchQuery[filterType] = filterValue;
                }
        
                const sortOptions = {};
                if (sort === 'asc') {
                    sortOptions.price = 1;
                } else if (sort === 'desc') {
                    sortOptions.price = -1;
                }
        
                const products = await productosModelo
                    .find(searchQuery)
                    .sort(sortOptions)
                    .skip(startIndex)
                    .limit(parseInt(limit));
        
                const totalProducts = await productosModelo.countDocuments(searchQuery);
        
                const totalPages = Math.ceil(totalProducts / limit);
                const prevPage = page > 1 ? page - 1 : null;
                const nextPage = page < totalPages ? page + 1 : null;
        
                const response = {
                    status: 'success',
                    products: products,
                    totalPages: totalPages,
                    prevPage: prevPage,
                    nextPage: nextPage,
                    page: page,
                    hasPrevPage: prevPage !== null,
                    hasNextPage: nextPage !== null,
                    prevLink: prevPage !== null ? `/productos?page=${prevPage}&limit=${limit}` : null,
                    nextLink: nextPage !== null ? `/productos?page=${nextPage}&limit=${limit}` : null
                };
        
                res.status(200).json(response);
            } catch (error) {
                console.error('Error obteniendo los productos:', error);
            }
        }
        static async getOneProduct(req, res){
            try {
                const productId = req.params.pid;
                const product = await getProductById(productId);
                if (product) {
                    res.status(200).json(product);
                } else {
                    res.status(404).json({ message: "Producto no encontrado" });
                }
            } catch (error) {
                handleServerError(res);
            }
        }
        static async deleteProduct(req, res){
            try {
                const io = req.app.get('socket');
                const productId = req.params.pid;
                const product = await getProductById(productId);
                if (!product) {
                    return res.status(404).json({ message: 'Producto no encontrado' });
                }
                const user = req.session.user;
            if (user.rol === 'premium' && product.product.owner !== user.email) {
                return res.status(403).json({ error: 'No tienes permisos para borrar este producto' });
            }

                const result = await deleteProductMongo(productId);
                console.log(result)
                if (result === "Producto eliminado correctamente.") {
                    { io.emit("realTimeProductDelete", productId) }
                    res.status(200).json({ message: result });
                } else if (!result) {
                    res.status(404).json({ message: "Producto no encontrado" });
                } else {
                    handleServerError(res);
                }
        
            } catch (error) {
                handleServerError(res);
            }
        }
        static async addProduct(req, res) {
            try {
                const io = req.app.get('socket');
                const { title, description, price, code, stock, category, status } = req.body;
                const thumbnails = req.body.thumbnails || [];
        
                const requiredFields = ['title', 'description', 'price', 'code', 'stock', 'category'];
                const invalidFields = validateFields(req.body, requiredFields);
                if (invalidFields.length > 0) {
                    return res.status(400).json({ error: `Campos inválidos: ${invalidFields.join(', ')}` });
                }
                if (!Array.isArray(thumbnails)) {
                    return res.status(400).json({ error: '"Thumbnails" únicamente permite formato de arreglo. ' });
                }
        
                const user = req.session.user;
                const userEmail = user.email || "admin";
        
                const productData = {
                    title,
                    description,
                    price,
                    thumbnails,
                    code,
                    stock,
                    category,
                    status: status !== undefined ? status : true,
                    owner: userEmail
                };
        
                const result = await addProductMongo(productData);
        
                const response = {
                    "Ya existe un producto con ese código.": 400,
                    "Producto agregado correctamente.": 201,
                    "Error al agregar el producto": 500,
                };
                const reStatus = response[result.message] || 500;
                console.log(result.message, reStatus, result);
                if (reStatus === 201) {
                    io.emit("realTimeProduct", result.product);
                }
                return res.status(reStatus).json({ message: result.message });
        
            } catch (error) {
                console.log(error);
                handleServerError(res);
            }
        }
        static async updateProduct(req, res) {
            try {
                const productId = parseInt(req.params.pid);
                const updates = req.body;
                const product = await getProductById(productId);
                const result = await updateProductMongo(productId, updates);
                const user = req.session.user;
                if (product.product.owner !== user.email) {
                    return res.status(403).json({ error: 'No tienes permisos para editar este producto' });
                }
                if (result) {
                    res.status(200).json({ message: "Producto actualizado con exito" });
                } else {
                    res.status(404).json({ message: "Producto no encontrado" });
                }
            } catch (error) {
                handleServerError(res);
            }
        }
}
module.exports = productService
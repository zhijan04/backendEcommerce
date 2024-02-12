async function generateMockedProducts(count) {

    const mockedProducts = [];

    for (let i = 1; i <= count; i++) {
        const product = {
            code: `MOCK-${i}`,
            title: `Mocked Product ${i}`,
            description: `Description Mocked Product ${i}`,
            price: Math.floor(Math.random() * 100) + 1,
            thumbnails: [`thumbnail_${i}_1.jpg`, `thumbnail_${i}_2.jpg`], 
            stock: Math.floor(Math.random() * 50) + 1,
            category: 'Mocked cat',
            status: true,
        };

        mockedProducts.push(product);
    }

    return mockedProducts;
}

module.exports = {
    generateMockedProducts
};
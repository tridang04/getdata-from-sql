const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Ví dụ API trả về danh sách sản phẩm
app.get('/api/products', (req, res) => {
    const products = [
        { id: 1, name: "Product 1", price: 100 },
        { id: 2, name: "Product 2", price: 200 },
    ];
    return res.json(products);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
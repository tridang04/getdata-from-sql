const sql = require('mssql/msnodesqlv8');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const UPLOAD_IMAGE = 'http://localhost:3000/api/upload-image'
// Cấu hình kết nối cho các server
const configRoot = {
    server: 'LAPTOP-PTTI6N5Q\\SERVER_CHINH',
    user: 'sa',
    password: '2004',
    database: 'ShopOnline',
    driver: 'msnodesqlv8',
    options: {
        trustServerCertificate: true
    }
};

const configServer1 = {
    server: 'LAPTOP-PTTI6N5Q\\SERVER_CON',
    user: 'sa',
    password: '2004',
    database: 'QL_GIATIEN',
    driver: 'msnodesqlv8',
    options: {
        trustServerCertificate: true
    }
};

const configServer2 = {
    server: 'LAPTOP-PTTI6N5Q\\SERVER_CON2',
    user: 'sa',
    password: '2004',
    database: 'QL_GIATIEN',
    driver: 'msnodesqlv8',
    options: {
        trustServerCertificate: true
    }
};

// Tạo ứng dụng Express
const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 8080;

// Kết nối tới server gốc
const connectRoot = new sql.ConnectionPool(configRoot).connect();

connectRoot
    .then((pool) => {
        console.log('Successfully connected to Root SQL Server.');

        // API lấy tất cả user
        app.get('/api/get-all-user', async (req, res) => {
            try {
                const result = await pool.request().query('SELECT * FROM DBO.Users');
                console.log('User Data:', result.recordset);
                res.json(result.recordset);
            } catch (err) {
                console.error('Error while executing query for users:', err);
                res.status(500).send('Error while executing query for users.');
            }
        });

        // API lấy tất cả sản phẩm
        app.get('/api/get-all-product', async (req, res) => {
            try {
                const result = await pool.request().query('SELECT * FROM DBO.Product');
                console.log('Product Data:', result.recordset);
                res.json(result.recordset);
            } catch (err) {
                console.error('Error while executing query for products:', err);
                res.status(500).send('Error while executing query for products.');
            }
        });

        // API thêm sản phẩm
        app.post('/api/add-product', async (req, res) => {
            const { description, image, name, price, quantity, productCategoryID } = req.body;
        
            // Kiểm tra các dữ liệu bắt buộc
            if (!description || !name || price === undefined || quantity === undefined || !productCategoryID) {
                return res.status(400).json({ error: 'Missing product data.' });
            }
        
            try {
                // Xác định server cần thêm sản phẩm
        
                const targetPool = await new sql.ConnectionPool(configRoot).connect();
        
                // Lấy giá trị productID cao nhất hiện có và cộng thêm 1
                const result = await targetPool.request().query("SELECT MAX(productID) AS maxProductID FROM Product");
                const newProductID = result.recordset[0].maxProductID + 1;
        
                const query = `
                    INSERT INTO Product (productID, description, image, name, price, quantity, productCategoryID)
                    VALUES (@productID, @description, @image, @name, @price, @quantity, @productCategoryID)
                `;
        
                await targetPool
                    .request()
                    .input('productID', sql.Int, newProductID)  // Sử dụng productID tự tính
                    .input('description', sql.NVarChar, description)
                    .input('image', sql.VarChar, image)
                    .input('name', sql.NVarChar, name)
                    .input('price', sql.Int, price)
                    .input('quantity', sql.Int, quantity)
                    .input('productCategoryID', sql.Int, productCategoryID)
                    .query(query);
        
                res.status(201).json({ message: 'Product added successfully.' });
            } catch (err) {
                console.error('Error while adding product:', err);
                res.status(500).send('Error while adding product.');
            }
        });
        
        app.post('/api/add-user', async (req, res) => {

            const { userID, name, address, username, password, phoneNumber, avatar} = req.body;
        
            // Kiểm tra các dữ liệu bắt buộc
            if ( !name || !username  || !password || !phoneNumber) {
                return res.status(400).json({ error: 'Missing user data.' });
            }
        
            try {
             
                const targetPool = await new sql.ConnectionPool(configRoot).connect();
        
                // Lấy giá trị productID cao nhất hiện có và cộng thêm 1
                const result = await targetPool.request().query("SELECT MAX(userID) AS maxUserID FROM Users");
                const newUserID = result.recordset[0].maxUserID + 1;
        
                // Thêm sản phẩm vào server phù hợp
                const query = `
                    INSERT INTO Users (userID, name, address, username, password, phoneNumber, avatar)
                    VALUES (@userID, @name, @address, @username, @password, @phoneNumber,  @avatar)
                `;
        
                await targetPool
                    .request()
                    .input('userID', sql.Int, newUserID)  // Sử dụng productID tự tính
                    .input('name', sql.NVarChar, name)
                    .input('address', sql.VarChar, address)
                    .input('username', sql.VarChar, username)
                    .input('password', sql.VarChar, password)
                    .input('phoneNumber', sql.VarChar, phoneNumber)
                    .input('avatar', sql.VarChar, avatar)
                    .query(query);
                


                    
                res.status(201).json({ message: 'Users added successfully.' });
                if( req.body && req.body.avatar){
                    await axios.post(UPLOAD_IMAGE, req.body);
                }

            } catch (err) {
                console.error('Error while adding user:', err);
                res.status(500).send('Error while adding user.');
            }
        });


        // Lắng nghe cổng
        app.listen(PORT, () => {
            console.log('Server is listening on port: ' + PORT);
        });
    })
    .catch((err) => {
        console.error('Unable to connect to Root SQL Server:', err);
    });

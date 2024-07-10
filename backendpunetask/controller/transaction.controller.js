import url from "../url.js";
import Transaction from '../modal/transaction.model.js';
import axios from "axios";
import moment from "moment";

export const InitializeData = async (req, res) => {
    try {
        const response = await axios.get(url.initData);
        await Transaction.deleteMany({});
        await Transaction.insertMany(response.data);
        return res.status(200).json({ Message: 'Database initialized with seed data' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ Error: 'Error initializing database' });
    }
}

export const listData = async (req, res) => {
    const { page = 1, perPage = 10, search = '', month } = req.query;
    const regex = new RegExp(search, 'i');
    const monthInt = parseInt(month, 10);

    const stringFilter = {
        $or: [
            { title: regex },
            { description: regex },
            { category: regex },
        ],
        $expr: {
            $eq: [{ $month: '$dateOfSale' }, monthInt]
        }
    };

    const numberFilter = {
        price: search ? Number(search) : { $exists: true },
        $expr: {
            $eq: [{ $month: '$dateOfSale' }, monthInt]
        }
    };

    try {
        let transactions = [];
        if (isNaN(Number(search))) {
            transactions = await Transaction.find(stringFilter)
                .skip((page - 1) * perPage)
                .limit(parseInt(perPage));
        } else {
            transactions = await Transaction.find(numberFilter)
                .skip((page - 1) * perPage)
                .limit(parseInt(perPage));
        }
        const total = await Transaction.countDocuments(stringFilter);
        return res.status(200).json({ transactions, total });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).send('Error fetching transactions');
    }
};

export const statisticsPrice = async (req, res) => {
    const { month } = req.query;

    // Ensure the month parameter is provided and is a valid number
    if (!month || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).send('Invalid month parameter');
    }

    const monthInt = parseInt(month, 10);

    const filter = {
        $expr: {
            $eq: [{ $month: "$dateOfSale" }, monthInt]
        }
    };

    try {
        const totalSaleAmount = await Transaction.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: "$price" } } },
        ]);

        const totalSoldItems = await Transaction.countDocuments({ ...filter, sold: true });
        const totalNotSoldItems = await Transaction.countDocuments({ ...filter, sold: false });

        return res.status(200).json({
            totalSaleAmount: totalSaleAmount[0]?.total || 0,
            totalSoldItems,
            totalNotSoldItems,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send('Error fetching statistics');
    }
};

export const barChart = async (req, res) => {
    const { month } = req.query;

    if (!month || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).send('Invalid month parameter');
    }

    const monthInt = parseInt(month, 10);

    const filter = {
        $expr: {
            $eq: [{ $month: "$dateOfSale" }, monthInt]
        }
    };

    try {
        const ranges = [
            { label: '0-100', min: 0, max: 100 },
            { label: '101-200', min: 101, max: 200 },
            { label: '201-300', min: 201, max: 300 },
            { label: '301-400', min: 301, max: 400 },
            { label: '401-500', min: 401, max: 500 },
            { label: '501-600', min: 501, max: 600 },
            { label: '601-700', min: 601, max: 700 },
            { label: '701-800', min: 701, max: 800 },
            { label: '801-900', min: 801, max: 900 },
            { label: '901-above', min: 901, max: Infinity },
        ];

        const data = await Promise.all(ranges.map(async (range) => {
            const count = await Transaction.countDocuments({
                ...filter,
                price: { $gte: range.min, $lte: range.max === Infinity ? Number.MAX_SAFE_INTEGER : range.max },
            });
            return { range: range.label, count };
        }));

        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).send('Error fetching bar chart data');
    }
};


export const pieChart = async (req, res) => {
    const { month } = req.query;
    if (!month) {
        return res.status(400).json({ error: 'Month parameter is required' });
    }

    // Fetch data from external API
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const products = response.data;

        // Filter products for the selected month
        const filteredProducts = products.filter(product =>
            moment(product.dateOfSale).month() + 1 === parseInt(month)
        );

        // Aggregate category counts
        const categories = {};
        filteredProducts.forEach(product => {
            if (categories[product.category]) {
                categories[product.category]++;
            } else {
                categories[product.category] = 1;
            }
        });

        // Format data for response
        const dataForPieChart = Object.keys(categories).map(category => ({
            category: category,
            count: categories[category]
        }));

        return res.status(200).json({ Data: dataForPieChart });
    } catch (error) {
        console.log(error);
        return res.status(500).send('Error fetching pie chart data');
    }
};

